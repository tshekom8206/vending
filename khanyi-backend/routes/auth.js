const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, generateToken, generateRefreshToken, refreshToken } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
router.post('/register', validate(schemas.register), async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      idNumber,
      password,
      address
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email },
        { phone },
        { idNumber }
      ]
    });

    if (existingUser) {
      let field = 'Email';
      if (existingUser.phone === phone) field = 'Phone number';
      if (existingUser.idNumber === idNumber) field = 'ID number';

      return res.status(400).json({
        success: false,
        error: `${field} already registered`
      });
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      idNumber,
      password,
      address
    });

    // Generate tokens
    const accessToken = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isVerified: user.isVerified
        }
      }
    });

  } catch (error) {
    console.error('Registration error:', error);

    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        error: `${field} already exists`
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server error during registration'
    });
  }
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
router.post('/login', validate(schemas.login), async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user and include password for verification
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Account has been deactivated. Please contact support.'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Generate tokens
    const accessToken = generateToken(user._id);
    const refreshTokenValue = generateRefreshToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        accessToken,
        refreshToken: refreshTokenValue,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isVerified: user.isVerified,
          lastLogin: user.lastLogin
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during login'
    });
  }
});

// @desc    Refresh access token
// @route   POST /api/v1/auth/refresh
// @access  Public
router.post('/refresh', refreshToken);

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('units', 'unitNumber estate')
      .populate('managedEstates', 'name address.city');

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          idNumber: user.idNumber,
          role: user.role,
          isActive: user.isActive,
          isVerified: user.isVerified,
          address: user.address,
          emergencyContact: user.emergencyContact,
          units: user.units,
          managedEstates: user.managedEstates,
          notifications: user.notifications,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt
        }
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching user data'
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/v1/auth/profile
// @access  Private
router.put('/profile', protect, validate(schemas.updateProfile), async (req, res) => {
  try {
    const allowedUpdates = [
      'firstName', 'lastName', 'phone', 'address',
      'emergencyContact', 'notifications'
    ];

    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      {
        new: true,
        runValidators: true
      }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          address: user.address,
          emergencyContact: user.emergencyContact,
          notifications: user.notifications
        }
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error updating profile'
    });
  }
});

// @desc    Change password
// @route   PUT /api/v1/auth/password
// @access  Private
router.put('/password', protect, validate(schemas.changePassword), async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error changing password'
    });
  }
});

// @desc    Forgot password
// @route   POST /api/v1/auth/forgot-password
// @access  Public
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal if email exists or not for security
      return res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent'
      });
    }

    // Generate reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // In a real application, you would send an email with the reset link
    // For now, we'll just return the token (remove this in production)
    res.json({
      success: true,
      message: 'Password reset token generated',
      data: {
        resetToken: resetToken // Remove this in production
      }
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error processing forgot password request'
    });
  }
});

// @desc    Reset password
// @route   POST /api/v1/auth/reset-password/:resettoken
// @access  Public
router.post('/reset-password/:resettoken', async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;

    if (!password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        error: 'Password and confirm password are required'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: 'Passwords do not match'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters'
      });
    }

    // Get hashed token
    const crypto = require('crypto');
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired reset token'
      });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Generate new tokens
    const accessToken = generateToken(user._id);
    const refreshTokenValue = generateRefreshToken(user._id);

    res.json({
      success: true,
      message: 'Password reset successfully',
      data: {
        accessToken,
        refreshToken: refreshTokenValue,
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
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error resetting password'
    });
  }
});

// @desc    Logout user (invalidate token)
// @route   POST /api/v1/auth/logout
// @access  Private
router.post('/logout', protect, async (req, res) => {
  try {
    // In a real application, you might want to blacklist the token
    // For now, we'll just return a success message
    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during logout'
    });
  }
});

// @desc    Verify account (placeholder for email/SMS verification)
// @route   POST /api/v1/auth/verify
// @access  Private
router.post('/verify', protect, async (req, res) => {
  try {
    const { verificationCode } = req.body;

    if (!verificationCode) {
      return res.status(400).json({
        success: false,
        error: 'Verification code is required'
      });
    }

    // In a real application, you would verify the code against what was sent
    // For now, we'll just mark the user as verified
    const user = await User.findById(req.user.id);
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: 'Account verified successfully',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified
        }
      }
    });

  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during verification'
    });
  }
});

// @desc    Get user's unit and meter information
// @route   GET /api/v1/auth/my-unit
// @access  Private
router.get('/my-unit', protect, async (req, res) => {
  try {
    const Unit = require('../models/Unit');
    const Meter = require('../models/Meter');
    const Estate = require('../models/Estate');

    // Find unit where user is tenant
    const unit = await Unit.findOne({ tenant: req.user.id })
      .populate('estate', 'name address tariff')
      .populate('meter');

    if (!unit) {
      return res.status(404).json({
        success: false,
        error: 'No unit assigned to this user'
      });
    }

    // Get meter information
    const meter = await Meter.findOne({ unit: unit._id });

    res.json({
      success: true,
      data: {
        unit: {
          id: unit._id,
          unitNumber: unit.unitNumber,
          estate: {
            id: unit.estate._id,
            name: unit.estate.name,
            address: unit.estate.address,
            tariff: unit.estate.tariff
          },
          specifications: unit.specifications,
          charges: unit.charges,
          status: unit.status
        },
        meter: meter ? {
          id: meter._id,
          meterNumber: meter.meterNumber,
          serialNumber: meter.serialNumber,
          specifications: meter.specifications,
          installation: meter.installation
        } : null
      }
    });

  } catch (error) {
    console.error('Get unit info error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching unit information'
    });
  }
});

module.exports = router;