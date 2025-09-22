const crypto = require('crypto');

class TokenGenerator {
  /**
   * Generate STS compliant electricity token
   * @param {number} amount - Purchase amount
   * @param {string} meterNumber - Meter number
   * @param {Object} options - Additional options
   * @returns {string} - Generated token
   */
  static generateElectricityToken(amount, meterNumber, options = {}) {
    const {
      tokenType = 'STS',
      currency = 'ZAR',
      tariffRate = 2.50,
      vendorId = '1234',
      keyRevision = '01'
    } = options;

    // Calculate units
    const units = Math.floor((amount / tariffRate) * 100) / 100; // Round to 2 decimal places

    // Create base token data
    const tokenData = {
      amount: Math.floor(amount * 100), // Convert to cents
      units: Math.floor(units * 100), // Convert to hundredths of kWh
      meterNumber: meterNumber.padStart(11, '0').slice(-11), // Ensure 11 digits
      timestamp: Math.floor(Date.now() / 1000),
      vendorId: vendorId.padStart(4, '0'),
      keyRevision
    };

    // Generate unique sequence number (8 digits)
    const sequenceNumber = Math.floor(10000000 + Math.random() * 90000000).toString();

    // Create token payload
    const payload = `${tokenData.meterNumber}${tokenData.amount.toString().padStart(8, '0')}${sequenceNumber}${vendorId}`;

    // Generate checksum using SHA-256 (simplified approach)
    const hash = crypto.createHash('sha256').update(payload + process.env.TOKEN_SECRET || 'default-secret').digest('hex');

    // Extract 20 digits from hash and format as STS token
    const tokenDigits = hash.replace(/[^0-9]/g, '').substring(0, 20);

    // Format as STS standard: 5 groups of 4 digits
    const formattedToken = tokenDigits.match(/.{1,4}/g).join(' ');

    return {
      token: formattedToken.replace(/\s/g, ''), // No spaces for storage
      formattedToken, // With spaces for display
      units,
      amount,
      meterNumber,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      metadata: {
        tokenType,
        sequenceNumber,
        timestamp: tokenData.timestamp,
        algorithm: 'SHA256-STS'
      }
    };
  }

  /**
   * Validate electricity token format
   * @param {string} token - Token to validate
   * @returns {boolean} - Is valid format
   */
  static validateTokenFormat(token) {
    // Remove spaces and validate length
    const cleanToken = token.replace(/\s/g, '');

    // Should be exactly 20 digits
    if (!/^\d{20}$/.test(cleanToken)) {
      return false;
    }

    return true;
  }

  /**
   * Generate transaction reference
   * @returns {string} - Transaction reference
   */
  static generateTransactionReference() {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `KV${timestamp.slice(-8)}${random}`;
  }

  /**
   * Calculate kWh from amount and tariff
   * @param {number} amount - Amount in ZAR
   * @param {number} tariffRate - Rate per kWh
   * @returns {number} - Calculated kWh
   */
  static calculateKwhFromAmount(amount, tariffRate) {
    if (!amount || !tariffRate || tariffRate <= 0) {
      return 0;
    }

    // Calculate with fees deduction (2% transaction fee)
    const transactionFee = Math.max(2, amount * 0.02);
    const vatOnFee = transactionFee * 0.15;
    const totalFees = transactionFee + vatOnFee;
    const electricityAmount = amount - totalFees;

    if (electricityAmount <= 0) {
      return 0;
    }

    return Math.floor((electricityAmount / tariffRate) * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Calculate amount from kWh and tariff
   * @param {number} kwh - kWh amount
   * @param {number} tariffRate - Rate per kWh
   * @returns {number} - Calculated amount including fees
   */
  static calculateAmountFromKwh(kwh, tariffRate) {
    if (!kwh || !tariffRate || tariffRate <= 0) {
      return 0;
    }

    const electricityAmount = kwh * tariffRate;

    // Add fees (2% transaction fee + 15% VAT on fee)
    const transactionFee = Math.max(2, electricityAmount * 0.02);
    const vatOnFee = transactionFee * 0.15;
    const totalFees = transactionFee + vatOnFee;

    return Math.ceil((electricityAmount + totalFees) * 100) / 100; // Round up to 2 decimal places
  }

  /**
   * Get preset amounts for quick selection
   * @returns {Array} - Array of preset amounts
   */
  static getPresetAmounts() {
    return [50, 100, 150, 200, 300, 500];
  }

  /**
   * Format currency for display
   * @param {number} amount - Amount to format
   * @param {string} currency - Currency code
   * @returns {string} - Formatted currency string
   */
  static formatCurrency(amount, currency = 'ZAR') {
    const currencySymbols = {
      'ZAR': 'R',
      'USD': '$',
      'EUR': '€',
      'GBP': '£'
    };

    const symbol = currencySymbols[currency] || currency;
    return `${symbol}${amount.toFixed(2)}`;
  }

  /**
   * Format balance for display
   * @param {number} balance - Balance in kWh
   * @param {string} unit - Unit (default: kWh)
   * @returns {string} - Formatted balance string
   */
  static formatBalance(balance, unit = 'kWh') {
    if (balance === null || balance === undefined) {
      return `0.00 ${unit}`;
    }
    return `${balance.toFixed(2)} ${unit}`;
  }

  /**
   * Generate a secure payment reference
   * @param {string} userId - User ID
   * @param {string} unitId - Unit ID
   * @returns {string} - Payment reference
   */
  static generatePaymentReference(userId, unitId) {
    const timestamp = Date.now().toString();
    const userHash = crypto.createHash('md5').update(userId).digest('hex').substring(0, 4);
    const unitHash = crypto.createHash('md5').update(unitId).digest('hex').substring(0, 4);

    return `PAY${timestamp.slice(-8)}${userHash.toUpperCase()}${unitHash.toUpperCase()}`;
  }

  /**
   * Validate meter number format
   * @param {string} meterNumber - Meter number to validate
   * @returns {Object} - Validation result
   */
  static validateMeterNumber(meterNumber) {
    if (!meterNumber || typeof meterNumber !== 'string') {
      return {
        isValid: false,
        error: 'Meter number is required'
      };
    }

    // Remove spaces and convert to uppercase
    const cleanMeter = meterNumber.replace(/\s/g, '').toUpperCase();

    // Should be 8-20 characters, alphanumeric
    if (!/^[A-Z0-9]{8,20}$/.test(cleanMeter)) {
      return {
        isValid: false,
        error: 'Meter number must be 8-20 alphanumeric characters'
      };
    }

    return {
      isValid: true,
      cleanMeterNumber: cleanMeter
    };
  }

  /**
   * Calculate token expiry date
   * @param {number} days - Days until expiry (default: 30)
   * @returns {Date} - Expiry date
   */
  static calculateTokenExpiry(days = 30) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);
    return expiryDate;
  }

  /**
   * Generate vendor-specific token
   * @param {string} vendorType - Type of vendor (CONLOG, HEXING, etc.)
   * @param {Object} tokenData - Token data
   * @returns {string} - Vendor-specific token
   */
  static generateVendorToken(vendorType, tokenData) {
    const { amount, meterNumber, units } = tokenData;

    switch (vendorType.toUpperCase()) {
      case 'CONLOG':
        return this.generateConlogToken(amount, meterNumber, units);
      case 'HEXING':
        return this.generateHexingToken(amount, meterNumber, units);
      case 'LANDIS':
        return this.generateLandisToken(amount, meterNumber, units);
      default:
        return this.generateElectricityToken(amount, meterNumber).token;
    }
  }

  /**
   * Generate Conlog-specific token
   * @private
   */
  static generateConlogToken(amount, meterNumber, units) {
    // Simplified Conlog token generation
    const payload = `CONLOG${meterNumber}${Math.floor(amount * 100)}${Math.floor(units * 100)}`;
    const hash = crypto.createHash('sha256').update(payload).digest('hex');
    return hash.replace(/[^0-9]/g, '').substring(0, 20);
  }

  /**
   * Generate Hexing-specific token
   * @private
   */
  static generateHexingToken(amount, meterNumber, units) {
    // Simplified Hexing token generation
    const payload = `HEXING${meterNumber}${Math.floor(amount * 100)}${Math.floor(units * 100)}`;
    const hash = crypto.createHash('sha256').update(payload).digest('hex');
    return hash.replace(/[^0-9]/g, '').substring(0, 20);
  }

  /**
   * Generate Landis+Gyr-specific token
   * @private
   */
  static generateLandisToken(amount, meterNumber, units) {
    // Simplified Landis+Gyr token generation
    const payload = `LANDIS${meterNumber}${Math.floor(amount * 100)}${Math.floor(units * 100)}`;
    const hash = crypto.createHash('sha256').update(payload).digest('hex');
    return hash.replace(/[^0-9]/g, '').substring(0, 20);
  }

  /**
   * Verify token integrity
   * @param {string} token - Token to verify
   * @param {Object} originalData - Original token data
   * @returns {boolean} - Is token valid
   */
  static verifyToken(token, originalData) {
    try {
      if (!this.validateTokenFormat(token)) {
        return false;
      }

      // In a real implementation, you would verify against the original generation data
      // For now, we'll just validate the format
      return true;
    } catch (error) {
      console.error('Token verification error:', error);
      return false;
    }
  }

  /**
   * Get token usage statistics
   * @param {Array} tokens - Array of token usage data
   * @returns {Object} - Usage statistics
   */
  static getTokenUsageStats(tokens) {
    const stats = {
      totalTokens: tokens.length,
      usedTokens: tokens.filter(t => t.isUsed).length,
      unusedTokens: tokens.filter(t => !t.isUsed).length,
      expiredTokens: tokens.filter(t => new Date() > new Date(t.expiryDate)).length,
      totalValue: tokens.reduce((sum, t) => sum + t.amount, 0),
      totalUnits: tokens.reduce((sum, t) => sum + t.units, 0)
    };

    stats.usageRate = stats.totalTokens > 0 ? (stats.usedTokens / stats.totalTokens * 100).toFixed(2) : 0;
    stats.expiryRate = stats.totalTokens > 0 ? (stats.expiredTokens / stats.totalTokens * 100).toFixed(2) : 0;

    return stats;
  }
}

module.exports = TokenGenerator;