const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  let token;

  // Check for token in header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'User not found'
        });
      }

      // Check if user is active
      if (!req.user.isActive) {
        return res.status(401).json({
          success: false,
          error: 'Account has been deactivated'
        });
      }

      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

// Check if user owns the resource or is admin
const ownerOrAdmin = (resourceUserField = 'user') => {
  return async (req, res, next) => {
    try {
      // System admins can access anything
      if (req.user.role === 'system_admin') {
        return next();
      }

      // Get resource ID from params
      const resourceId = req.params.id;
      if (!resourceId) {
        return res.status(400).json({
          success: false,
          error: 'Resource ID is required'
        });
      }

      // This middleware assumes the resource model will be checked in the route handler
      // For now, we'll add the check flag to the request
      req.checkOwnership = {
        resourceUserField,
        allowedUserId: req.user._id
      };

      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error during authorization check'
      });
    }
  };
};

// Check if user has access to specific estate
const estateAccess = async (req, res, next) => {
  try {
    const estateId = req.params.estateId || req.params.id || req.body.estate || req.query.estate;

    if (!estateId) {
      return res.status(400).json({
        success: false,
        error: 'Estate ID is required'
      });
    }

    // System admins have access to all estates
    if (req.user.role === 'system_admin') {
      return next();
    }

    // Estate admins can only access estates they manage
    if (req.user.role === 'estate_admin') {
      const hasAccess = req.user.managedEstates.some(
        estate => estate.toString() === estateId.toString()
      );

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to access this estate'
        });
      }

      return next();
    }

    // Tenants can only access their own units' estate
    if (req.user.role === 'tenant') {
      const Unit = require('../models/Unit');
      const userUnits = await Unit.find({ tenant: req.user._id }).populate('estate');

      const hasAccess = userUnits.some(
        unit => unit.estate._id.toString() === estateId.toString()
      );

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to access this estate'
        });
      }

      return next();
    }

    return res.status(403).json({
      success: false,
      error: 'Insufficient permissions'
    });

  } catch (error) {
    console.error('Estate access check error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error during estate access check'
    });
  }
};

// Check if user has access to specific unit
const unitAccess = async (req, res, next) => {
  try {
    const unitId = req.params.id || req.params.unitId || req.body.unit || req.query.unit;

    if (!unitId) {
      return res.status(400).json({
        success: false,
        error: 'Unit ID is required'
      });
    }

    // System admins have access to all units
    if (req.user.role === 'system_admin') {
      return next();
    }

    const Unit = require('../models/Unit');
    const unit = await Unit.findById(unitId).populate('estate');

    if (!unit) {
      return res.status(404).json({
        success: false,
        error: 'Unit not found'
      });
    }

    // Estate admins can access units in estates they manage
    if (req.user.role === 'estate_admin') {
      const hasAccess = req.user.managedEstates.some(
        estate => estate.toString() === unit.estate._id.toString()
      );

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to access this unit'
        });
      }

      return next();
    }

    // Tenants can only access their own units
    if (req.user.role === 'tenant') {
      if (unit.tenant && unit.tenant.toString() === req.user._id.toString()) {
        return next();
      }

      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this unit'
      });
    }

    return res.status(403).json({
      success: false,
      error: 'Insufficient permissions'
    });

  } catch (error) {
    console.error('Unit access check error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error during unit access check'
    });
  }
};

// Middleware to check if user account is verified
const requireVerification = (req, res, next) => {
  if (!req.user.isVerified) {
    return res.status(403).json({
      success: false,
      error: 'Account verification required. Please verify your email or phone number.'
    });
  }
  next();
};

// Rate limiting for sensitive operations
const sensitiveOperation = (req, res, next) => {
  // Additional rate limiting could be implemented here
  // For now, just ensure user is verified and active
  if (!req.user.isActive || !req.user.isVerified) {
    return res.status(403).json({
      success: false,
      error: 'Account must be active and verified for this operation'
    });
  }
  next();
};

// Middleware to validate user can perform actions on their own profile
const ownProfileOrAdmin = (req, res, next) => {
  const targetUserId = req.params.userId || req.params.id;

  if (req.user.role === 'system_admin') {
    return next();
  }

  if (req.user._id.toString() !== targetUserId) {
    return res.status(403).json({
      success: false,
      error: 'You can only modify your own profile'
    });
  }

  next();
};

// Utility function to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Utility function to generate refresh token
const generateRefreshToken = (id) => {
  return jwt.sign({ id, type: 'refresh' }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d'
  });
};

// Middleware to refresh access token
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token is required'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

    if (decoded.type !== 'refresh') {
      return res.status(400).json({
        success: false,
        error: 'Invalid refresh token type'
      });
    }

    // Get user
    const user = await User.findById(decoded.id).select('-password');

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Invalid refresh token'
      });
    }

    // Generate new tokens
    const newAccessToken = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role
        }
      }
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    return res.status(401).json({
      success: false,
      error: 'Invalid refresh token'
    });
  }
};

module.exports = {
  protect,
  authorize,
  ownerOrAdmin,
  estateAccess,
  unitAccess,
  requireVerification,
  sensitiveOperation,
  ownProfileOrAdmin,
  generateToken,
  generateRefreshToken,
  refreshToken
};