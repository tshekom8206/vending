const express = require('express');
const router = express.Router();
const User = require('../models/User');

// @desc    Create system admin user (development only)
// @route   POST /api/v1/admin/create-system-admin
// @access  Public (for initial setup only)
router.post('/create-system-admin', async (req, res) => {
  try {
    // Check if any system admin already exists
    const existingAdmin = await User.findOne({ role: 'system_admin' });

    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        error: 'System admin already exists'
      });
    }

    // Create system admin user
    const adminUser = await User.create({
      firstName: 'System',
      lastName: 'Administrator',
      email: 'admin@khanyi.com',
      phone: '+27000000000',
      idNumber: '0000000000000',
      password: 'admin123',
      role: 'system_admin',
      address: {
        street: 'Admin Street',
        city: 'Johannesburg',
        province: 'Gauteng',
        postalCode: '2000',
        country: 'South Africa'
      },
      isActive: true,
      isVerified: true
    });

    res.status(201).json({
      success: true,
      message: 'System administrator created successfully',
      data: {
        user: {
          id: adminUser._id,
          firstName: adminUser.firstName,
          lastName: adminUser.lastName,
          email: adminUser.email,
          role: adminUser.role
        },
        credentials: {
          email: 'admin@khanyi.com',
          password: 'admin123'
        }
      }
    });

  } catch (error) {
    console.error('Create admin error:', error);

    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        error: `${field} already exists`
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server error creating system administrator'
    });
  }
});

module.exports = router;