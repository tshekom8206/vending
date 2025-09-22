const express = require('express');
const router = express.Router();
const Estate = require('../models/Estate');
const Unit = require('../models/Unit');
const { protect, authorize, estateAccess } = require('../middleware/auth');
const { validate, validateQuery, validateParams, schemas } = require('../middleware/validation');

// @desc    Get all estates
// @route   GET /api/v1/estates
// @access  Public (with optional filtering)
router.get('/', validateQuery(schemas.searchEstates), async (req, res) => {
  try {
    const {
      q,
      city,
      province,
      type,
      minTariff,
      maxTariff,
      amenities,
      page = 1,
      limit = 20
    } = req.query;

    // Build query
    const query = { isActive: true };

    if (q) {
      query.$text = { $search: q };
    }

    if (city) {
      query['address.city'] = new RegExp(city, 'i');
    }

    if (province) {
      query['address.province'] = new RegExp(province, 'i');
    }

    if (type) {
      query.type = type;
    }

    if (minTariff || maxTariff) {
      query['tariff.rate'] = {};
      if (minTariff) query['tariff.rate'].$gte = parseFloat(minTariff);
      if (maxTariff) query['tariff.rate'].$lte = parseFloat(maxTariff);
    }

    if (amenities && amenities.length > 0) {
      query.amenities = { $in: Array.isArray(amenities) ? amenities : [amenities] };
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const estates = await Estate.find(query)
      .populate('administrators.user', 'firstName lastName email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    const total = await Estate.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      count: estates.length,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      data: estates
    });

  } catch (error) {
    console.error('Get estates error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching estates'
    });
  }
});

// @desc    Get single estate
// @route   GET /api/v1/estates/:id
// @access  Public
router.get('/:id', validateParams({ id: schemas.objectId }), async (req, res) => {
  try {
    const estate = await Estate.findById(req.params.id)
      .populate('administrators.user', 'firstName lastName email phone role')
      .populate('createdBy', 'firstName lastName email');

    if (!estate) {
      return res.status(404).json({
        success: false,
        error: 'Estate not found'
      });
    }

    // Get estate statistics
    const totalUnits = await Unit.countDocuments({ estate: estate._id, isActive: true });
    const occupiedUnits = await Unit.countDocuments({
      estate: estate._id,
      status: 'Occupied',
      isActive: true
    });
    const availableUnits = await Unit.countDocuments({
      estate: estate._id,
      status: 'Available',
      isActive: true
    });

    res.json({
      success: true,
      data: {
        ...estate.toObject(),
        statistics: {
          totalUnits,
          occupiedUnits,
          availableUnits,
          occupancyRate: totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0
        }
      }
    });

  } catch (error) {
    console.error('Get estate error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching estate'
    });
  }
});

// @desc    Create estate
// @route   POST /api/v1/estates
// @access  Private (System Admin only)
router.post('/',
  protect,
  authorize('system_admin'),
  validate(schemas.createEstate),
  async (req, res) => {
    try {
      const estateData = {
        ...req.body,
        createdBy: req.user._id
      };

      const estate = await Estate.create(estateData);

      res.status(201).json({
        success: true,
        message: 'Estate created successfully',
        data: estate
      });

    } catch (error) {
      console.error('Create estate error:', error);

      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          error: 'Estate with this name already exists'
        });
      }

      res.status(500).json({
        success: false,
        error: 'Server error creating estate'
      });
    }
  }
);

// @desc    Update estate
// @route   PUT /api/v1/estates/:id
// @access  Private (System Admin or Estate Admin)
router.put('/:id',
  protect,
  validateParams({ id: schemas.objectId }),
  estateAccess,
  async (req, res) => {
    try {
      const allowedUpdates = [
        'name', 'description', 'type', 'address', 'coordinates',
        'tariff', 'management', 'amenities', 'operatingHours'
      ];

      const updates = {};
      allowedUpdates.forEach(field => {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      });

      // Update tariff lastUpdated if tariff is being changed
      if (updates.tariff) {
        updates['tariff.lastUpdated'] = new Date();
      }

      const estate = await Estate.findByIdAndUpdate(
        req.params.id,
        updates,
        {
          new: true,
          runValidators: true
        }
      );

      if (!estate) {
        return res.status(404).json({
          success: false,
          error: 'Estate not found'
        });
      }

      res.json({
        success: true,
        message: 'Estate updated successfully',
        data: estate
      });

    } catch (error) {
      console.error('Update estate error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error updating estate'
      });
    }
  }
);

// @desc    Delete estate (soft delete)
// @route   DELETE /api/v1/estates/:id
// @access  Private (System Admin only)
router.delete('/:id',
  protect,
  authorize('system_admin'),
  validateParams({ id: schemas.objectId }),
  async (req, res) => {
    try {
      const estate = await Estate.findById(req.params.id);

      if (!estate) {
        return res.status(404).json({
          success: false,
          error: 'Estate not found'
        });
      }

      // Check if estate has active units
      const activeUnits = await Unit.countDocuments({
        estate: req.params.id,
        status: 'Occupied',
        isActive: true
      });

      if (activeUnits > 0) {
        return res.status(400).json({
          success: false,
          error: `Cannot delete estate with ${activeUnits} occupied units. Please relocate tenants first.`
        });
      }

      // Soft delete
      estate.isActive = false;
      await estate.save();

      res.json({
        success: true,
        message: 'Estate deleted successfully'
      });

    } catch (error) {
      console.error('Delete estate error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error deleting estate'
      });
    }
  }
);

// @desc    Get estate units
// @route   GET /api/v1/estates/:id/units
// @access  Private (Estate access required)
router.get('/:id/units',
  protect,
  validateParams({ id: schemas.objectId }),
  estateAccess,
  async (req, res) => {
    try {
      const { status, available, page = 1, limit = 20 } = req.query;

      const query = { estate: req.params.id, isActive: true };

      if (status) {
        query.status = status;
      }

      if (available === 'true') {
        query.status = 'Available';
      }

      const skip = (page - 1) * limit;
      const units = await Unit.find(query)
        .populate('tenant', 'firstName lastName email phone')
        .populate('meter', 'meterNumber currentBalance status')
        .sort({ unitNumber: 1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Unit.countDocuments(query);

      res.json({
        success: true,
        count: units.length,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        },
        data: units
      });

    } catch (error) {
      console.error('Get estate units error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error fetching estate units'
      });
    }
  }
);

// @desc    Add estate administrator
// @route   POST /api/v1/estates/:id/administrators
// @access  Private (System Admin only)
router.post('/:id/administrators',
  protect,
  authorize('system_admin'),
  validateParams({ id: schemas.objectId }),
  async (req, res) => {
    try {
      const { userId, permissions } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'User ID is required'
        });
      }

      const estate = await Estate.findById(req.params.id);

      if (!estate) {
        return res.status(404).json({
          success: false,
          error: 'Estate not found'
        });
      }

      // Check if user is already an administrator
      const existingAdmin = estate.administrators.find(
        admin => admin.user.toString() === userId
      );

      if (existingAdmin) {
        return res.status(400).json({
          success: false,
          error: 'User is already an administrator of this estate'
        });
      }

      // Add administrator
      estate.administrators.push({
        user: userId,
        permissions: permissions || ['manage_units', 'manage_tenants', 'view_reports'],
        assignedDate: new Date()
      });

      // Add estate to user's managed estates
      const User = require('../models/User');
      await User.findByIdAndUpdate(userId, {
        $addToSet: { managedEstates: estate._id },
        role: 'estate_admin'
      });

      await estate.save();

      res.json({
        success: true,
        message: 'Estate administrator added successfully',
        data: estate.administrators
      });

    } catch (error) {
      console.error('Add estate administrator error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error adding estate administrator'
      });
    }
  }
);

// @desc    Remove estate administrator
// @route   DELETE /api/v1/estates/:id/administrators/:userId
// @access  Private (System Admin only)
router.delete('/:id/administrators/:userId',
  protect,
  authorize('system_admin'),
  validateParams({
    id: schemas.objectId,
    userId: schemas.objectId
  }),
  async (req, res) => {
    try {
      const estate = await Estate.findById(req.params.id);

      if (!estate) {
        return res.status(404).json({
          success: false,
          error: 'Estate not found'
        });
      }

      // Remove administrator
      estate.administrators = estate.administrators.filter(
        admin => admin.user.toString() !== req.params.userId
      );

      // Remove estate from user's managed estates
      const User = require('../models/User');
      const user = await User.findById(req.params.userId);

      if (user) {
        user.managedEstates = user.managedEstates.filter(
          estateId => estateId.toString() !== req.params.id
        );

        // If user has no managed estates, change role back to tenant
        if (user.managedEstates.length === 0) {
          user.role = 'tenant';
        }

        await user.save();
      }

      await estate.save();

      res.json({
        success: true,
        message: 'Estate administrator removed successfully'
      });

    } catch (error) {
      console.error('Remove estate administrator error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error removing estate administrator'
      });
    }
  }
);

// @desc    Get estate statistics
// @route   GET /api/v1/estates/:id/statistics
// @access  Private (Estate access required)
router.get('/:id/statistics',
  protect,
  validateParams({ id: schemas.objectId }),
  estateAccess,
  async (req, res) => {
    try {
      const { period = 30 } = req.query;
      const estateId = req.params.id;
      const dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - parseInt(period));

      // Unit statistics
      const unitStats = await Unit.aggregate([
        { $match: { estate: estateId } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      // Purchase statistics
      const Purchase = require('../models/Purchase');
      const purchaseStats = await Purchase.aggregate([
        {
          $lookup: {
            from: 'units',
            localField: 'unit',
            foreignField: '_id',
            as: 'unitInfo'
          }
        },
        {
          $match: {
            'unitInfo.estate': estateId,
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

      // Revenue by month
      const monthlyRevenue = await Purchase.aggregate([
        {
          $lookup: {
            from: 'units',
            localField: 'unit',
            foreignField: '_id',
            as: 'unitInfo'
          }
        },
        {
          $match: {
            'unitInfo.estate': estateId,
            createdAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) },
            status: 'Completed'
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            revenue: { $sum: '$amount' },
            purchases: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]);

      res.json({
        success: true,
        data: {
          units: unitStats,
          purchases: purchaseStats[0] || {
            totalPurchases: 0,
            totalAmount: 0,
            totalUnits: 0,
            averageAmount: 0
          },
          monthlyRevenue,
          period: parseInt(period)
        }
      });

    } catch (error) {
      console.error('Get estate statistics error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error fetching estate statistics'
      });
    }
  }
);

module.exports = router;