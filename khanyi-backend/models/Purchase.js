const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const purchaseSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    unique: true,
    default: () => `TXN${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`
  },

  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },

  unit: {
    type: mongoose.Schema.ObjectId,
    ref: 'Unit',
    required: [true, 'Unit reference is required']
  },

  meter: {
    type: mongoose.Schema.ObjectId,
    ref: 'Meter',
    required: [true, 'Meter reference is required']
  },

  // Purchase details
  amount: {
    type: Number,
    required: [true, 'Purchase amount is required'],
    min: [1, 'Purchase amount must be at least R1']
  },

  unitsReceived: {
    type: Number,
    required: [true, 'Units received is required'],
    min: [0, 'Units received cannot be negative']
  },

  tariffRate: {
    type: Number,
    required: [true, 'Tariff rate is required']
  },

  // Electricity token
  token: {
    value: {
      type: String,
      required: [true, 'Token value is required'],
      unique: true
    },
    type: {
      type: String,
      enum: ['STS', 'Hexing', 'Conlog', 'Generic'],
      default: 'STS'
    },
    expiryDate: Date,
    isUsed: {
      type: Boolean,
      default: false
    },
    usedDate: Date
  },

  // Payment information
  payment: {
    method: {
      type: String,
      enum: ['Card', 'EFT', 'Mobile Money', 'Cash', 'Wallet'],
      required: [true, 'Payment method is required']
    },
    reference: String,
    gateway: String, // PayGate, PayFast, etc.
    gatewayTransactionId: String,
    status: {
      type: String,
      enum: ['Pending', 'Processing', 'Completed', 'Failed', 'Cancelled', 'Refunded'],
      default: 'Pending'
    },
    paidAt: Date,
    failureReason: String
  },

  // Transaction status
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Completed', 'Failed', 'Cancelled', 'Refunded'],
    default: 'Pending'
  },

  // Fees and charges
  fees: {
    transactionFee: {
      type: Number,
      default: 0
    },
    serviceFee: {
      type: Number,
      default: 0
    },
    vatAmount: {
      type: Number,
      default: 0
    },
    totalFees: {
      type: Number,
      default: 0
    }
  },

  // Delivery information
  delivery: {
    method: {
      type: String,
      enum: ['SMS', 'Email', 'App Push', 'USSD'],
      default: 'SMS'
    },
    destination: String, // phone number or email
    deliveredAt: Date,
    attempts: {
      type: Number,
      default: 0
    },
    maxAttempts: {
      type: Number,
      default: 3
    },
    lastAttemptAt: Date
  },

  // Refund information (if applicable)
  refund: {
    amount: Number,
    reason: String,
    processedAt: Date,
    processedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    refundReference: String
  },

  // System tracking
  metadata: {
    userAgent: String,
    ipAddress: String,
    deviceId: String,
    appVersion: String,
    platform: {
      type: String,
      enum: ['Android', 'iOS', 'Web', 'USSD', 'API']
    }
  },

  // Audit trail
  auditLog: [{
    action: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    details: String
  }],

  // Notes and comments
  notes: String,
  customerNotes: String

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for total amount including fees
purchaseSchema.virtual('totalAmount').get(function() {
  return this.amount + this.fees.totalFees;
});

// Virtual for purchase efficiency (units per rand)
purchaseSchema.virtual('efficiency').get(function() {
  return this.amount > 0 ? (this.unitsReceived / this.amount).toFixed(3) : 0;
});

// Virtual for formatted token (grouped display)
purchaseSchema.virtual('formattedToken').get(function() {
  if (!this.token.value) return '';

  // Format token in groups of 4 digits
  return this.token.value.replace(/(\d{4})/g, '$1 ').trim();
});

// Virtual for delivery status
purchaseSchema.virtual('deliveryStatus').get(function() {
  if (this.delivery.deliveredAt) return 'Delivered';
  if (this.delivery.attempts >= this.delivery.maxAttempts) return 'Failed';
  if (this.delivery.attempts > 0) return 'Retrying';
  return 'Pending';
});

// Indexes for performance
purchaseSchema.index({ transactionId: 1 });
purchaseSchema.index({ user: 1 });
purchaseSchema.index({ unit: 1 });
purchaseSchema.index({ meter: 1 });
purchaseSchema.index({ status: 1 });
purchaseSchema.index({ 'payment.status': 1 });
purchaseSchema.index({ createdAt: -1 });
purchaseSchema.index({ 'token.value': 1 });

// Compound indexes
purchaseSchema.index({ user: 1, createdAt: -1 });
purchaseSchema.index({ unit: 1, createdAt: -1 });

// Pre-save middleware to calculate fees
purchaseSchema.pre('save', function(next) {
  if (this.isModified('amount') || this.isNew) {
    // Calculate transaction fee (1% with min R2)
    this.fees.transactionFee = Math.max(2, this.amount * 0.01);

    // Calculate VAT (15% on fees only in South Africa)
    this.fees.vatAmount = this.fees.transactionFee * 0.15;

    // Total fees
    this.fees.totalFees = this.fees.transactionFee + this.fees.serviceFee + this.fees.vatAmount;
  }
  next();
});

// Method to generate electricity token
purchaseSchema.methods.generateToken = function() {
  const crypto = require('crypto');

  // Generate 20-digit token using STS standard format
  const baseNumber = Date.now().toString();
  const randomSuffix = Math.random().toString(36).substr(2, 8).toUpperCase();
  const combined = baseNumber + randomSuffix;

  // Create hash and take first 20 characters
  const hash = crypto.createHash('sha256').update(combined).digest('hex');
  const token = hash.substr(0, 20).toUpperCase();

  // Format as 5 groups of 4 digits
  const formattedToken = token.replace(/(.{4})/g, '$1').trim();

  this.token.value = formattedToken.replace(/\s/g, '');
  this.token.expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  return this.token.value;
};

// Method to mark token as used
purchaseSchema.methods.useToken = function() {
  this.token.isUsed = true;
  this.token.usedDate = new Date();

  // Add to audit log
  this.auditLog.push({
    action: 'TOKEN_USED',
    details: 'Electricity token was successfully applied to meter'
  });

  return this.save();
};

// Method to process refund
purchaseSchema.methods.processRefund = async function(reason, processedBy, refundAmount = null) {
  const refundAmt = refundAmount || this.amount;

  this.refund = {
    amount: refundAmt,
    reason,
    processedAt: new Date(),
    processedBy,
    refundReference: `REF${Date.now()}`
  };

  this.status = 'Refunded';
  this.payment.status = 'Refunded';

  // Add to audit log
  this.auditLog.push({
    action: 'REFUND_PROCESSED',
    user: processedBy,
    details: `Refund of R${refundAmt} processed. Reason: ${reason}`
  });

  return this.save();
};

// Method to retry token delivery
purchaseSchema.methods.retryDelivery = async function() {
  if (this.delivery.attempts >= this.delivery.maxAttempts) {
    throw new Error('Maximum delivery attempts exceeded');
  }

  this.delivery.attempts += 1;
  this.delivery.lastAttemptAt = new Date();

  // Add to audit log
  this.auditLog.push({
    action: 'DELIVERY_RETRY',
    details: `Token delivery attempt ${this.delivery.attempts} to ${this.delivery.destination}`
  });

  return this.save();
};

// Method to get purchase summary for user
purchaseSchema.methods.getSummary = function() {
  return {
    transactionId: this.transactionId,
    amount: this.amount,
    unitsReceived: this.unitsReceived,
    token: this.formattedToken,
    status: this.status,
    purchaseDate: this.createdAt,
    deliveryStatus: this.deliveryStatus
  };
};

// Static method to get user purchase history
purchaseSchema.statics.getUserHistory = function(userId, limit = 10, offset = 0) {
  return this.find({ user: userId })
    .populate('unit', 'unitNumber')
    .populate('meter', 'meterNumber')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(offset)
    .select('transactionId amount unitsReceived status createdAt token.value');
};

// Static method to get estate statistics
purchaseSchema.statics.getEstateStats = function(estateId, period = 30) {
  const dateFrom = new Date();
  dateFrom.setDate(dateFrom.getDate() - period);

  return this.aggregate([
    {
      $lookup: {
        from: 'units',
        localField: 'unit',
        foreignField: '_id',
        as: 'unitInfo'
      }
    },
    {
      $lookup: {
        from: 'estates',
        localField: 'unitInfo.estate',
        foreignField: '_id',
        as: 'estateInfo'
      }
    },
    {
      $match: {
        'estateInfo._id': mongoose.Types.ObjectId(estateId),
        createdAt: { $gte: dateFrom },
        status: 'Completed'
      }
    },
    {
      $group: {
        _id: null,
        totalPurchases: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        totalUnits: { $sum: '$unitsReceived' },
        averageAmount: { $avg: '$amount' }
      }
    }
  ]);
};

module.exports = mongoose.model('Purchase', purchaseSchema);