const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Unit = require('../models/Unit');
const Purchase = require('../models/Purchase');
const Incident = require('../models/Incident');
const { protect, authorize, ownProfileOrAdmin } = require('../middleware/auth');
const { validate, validateQuery, validateParams, schemas } = require('../middleware/validation');

// @desc    Get all users (Admin only)
// @route   GET /api/v1/users
// @access  Private (System Admin or Estate Admin)
router.get('/',
  protect,
  authorize('system_admin', 'estate_admin'),
  validateQuery(schemas.pagination),
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 20,
        role,
        search,
        estate,
        status,
        sort = '-createdAt'
      } = req.query;

      // Build query
      let query = {};

      // Estate admins can only see users in their managed estates
      if (req.user.role === 'estate_admin') {
        const units = await Unit.find({
          estate: { $in: req.user.managedEstates }
        }).select('tenant');

        const tenantIds = units.map(unit => unit.tenant).filter(Boolean);
        query._id = { $in: [...tenantIds, req.user._id] };
      }

      // Apply filters
      if (role) {
        query.role = role;
      }

      if (search) {
        query.$or = [
          { firstName: new RegExp(search, 'i') },
          { lastName: new RegExp(search, 'i') },
          { email: new RegExp(search, 'i') },
          { phone: new RegExp(search, 'i') }
        ];
      }

      if (estate) {
        const estateUnits = await Unit.find({ estate }).select('tenant');
        const estateTenantIds = estateUnits.map(unit => unit.tenant).filter(Boolean);
        query._id = { $in: estateTenantIds };
      }

      if (status !== undefined) {
        query.isActive = status === 'active';
      }

      const skip = (page - 1) * limit;
      const users = await User.find(query)
        .populate('units', 'unitNumber estate')
        .populate('managedEstates', 'name address.city')
        .populate({
          path: 'units',
          populate: {
            path: 'estate',
            select: 'name address.city'
          }
        })
        .select('-password')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit));

      const total = await User.countDocuments(query);

      res.json({
        success: true,
        count: users.length,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        },
        data: users
      });

    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error fetching users'
      });
    }
  }
);

// @desc    Get single user
// @route   GET /api/v1/users/:id
// @access  Private (Own profile or Admin)
router.get('/:id',
  protect,
  validateParams({ id: schemas.objectId }),
  ownProfileOrAdmin,
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id)
        .populate('units', 'unitNumber estate status lease')
        .populate('managedEstates', 'name address totalUnits occupiedUnits')
        .populate({
          path: 'units',
          populate: {
            path: 'estate',
            select: 'name address tariff'
          }
        })
        .populate({
          path: 'units',
          populate: {
            path: 'meter',
            select: 'meterNumber currentBalance status'
          }
        })
        .select('-password');

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // Get user activity summary if it's the user's own profile
      let activitySummary = null;
      if (req.params.id === req.user._id.toString()) {
        activitySummary = await this.getUserActivitySummary(user._id);
      }

      res.json({
        success: true,
        data: {
          user,
          activitySummary
        }
      });

    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error fetching user'
      });
    }
  }
);

// @desc    Update user
// @route   PUT /api/v1/users/:id
// @access  Private (Own profile or Admin)
router.put('/:id',
  protect,
  validateParams({ id: schemas.objectId }),
  ownProfileOrAdmin,
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // Define allowed updates based on user role
      let allowedUpdates;

      if (req.user.role === 'system_admin') {
        allowedUpdates = [
          'firstName', 'lastName', 'phone', 'address', 'emergencyContact',
          'notifications', 'role', 'isActive', 'isVerified', 'managedEstates'
        ];
      } else if (req.user.role === 'estate_admin' && req.params.id !== req.user._id.toString()) {
        // Estate admins can only update basic info of tenants in their estates
        const userUnits = await Unit.find({ tenant: req.params.id }).populate('estate');
        const hasAccess = userUnits.some(unit =>
          req.user.managedEstates.some(estate =>
            estate.toString() === unit.estate._id.toString()
          )
        );

        if (!hasAccess) {
          return res.status(403).json({
            success: false,
            error: 'Not authorized to update this user'
          });
        }

        allowedUpdates = ['firstName', 'lastName', 'phone', 'emergencyContact'];
      } else {
        // Users can only update their own basic info
        allowedUpdates = ['firstName', 'lastName', 'phone', 'address', 'emergencyContact', 'notifications'];
      }

      const updates = {};
      allowedUpdates.forEach(field => {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      });

      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        updates,
        {
          new: true,
          runValidators: true
        }
      ).select('-password');

      res.json({
        success: true,
        message: 'User updated successfully',
        data: updatedUser
      });

    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error updating user'
      });
    }
  }
);

// @desc    Deactivate user
// @route   DELETE /api/v1/users/:id
// @access  Private (System Admin only)
router.delete('/:id',
  protect,
  authorize('system_admin'),
  validateParams({ id: schemas.objectId }),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // Cannot deactivate own account
      if (req.params.id === req.user._id.toString()) {
        return res.status(400).json({
          success: false,
          error: 'Cannot deactivate your own account'
        });
      }

      // Check if user has active units
      const activeUnits = await Unit.countDocuments({
        tenant: req.params.id,
        status: 'Occupied',
        isActive: true
      });

      if (activeUnits > 0) {
        return res.status(400).json({
          success: false,
          error: `Cannot deactivate user with ${activeUnits} active units. Please end leases first.`
        });
      }

      // Soft delete
      user.isActive = false;
      await user.save();

      res.json({
        success: true,
        message: 'User deactivated successfully'
      });

    } catch (error) {
      console.error('Deactivate user error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error deactivating user'
      });
    }
  }
);

// @desc    Get user dashboard data
// @route   GET /api/v1/users/:id/dashboard
// @access  Private (Own profile or Admin)
router.get('/:id/dashboard',
  protect,
  validateParams({ id: schemas.objectId }),
  ownProfileOrAdmin,
  async (req, res) => {
    try {
      const userId = req.params.id;

      // Get user with units and meters
      const user = await User.findById(userId)
        .populate({
          path: 'units',
          populate: [
            {
              path: 'estate',
              select: 'name address tariff'
            },
            {
              path: 'meter',
              select: 'meterNumber currentBalance status'
            }
          ]
        })
        .select('-password');

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // Get recent purchases
      const recentPurchases = await Purchase.find({ user: userId })
        .populate('unit', 'unitNumber')
        .sort({ createdAt: -1 })
        .limit(5)
        .select('transactionId amount unitsReceived status createdAt token.value');

      // Get recent incidents
      const recentIncidents = await Incident.find({ 'reporter.user': userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('incidentNumber subject status priority createdAt');

      // Calculate total balance across all units
      let totalBalance = 0;
      let activeMeters = 0;
      let lowBalanceAlerts = 0;

      user.units.forEach(unit => {
        if (unit.meter && unit.meter.status === 'Active') {
          activeMeters++;
          totalBalance += unit.meter.currentBalance.amount;
          if (unit.meter.currentBalance.amount <= 10) {
            lowBalanceAlerts++;
          }
        }
      });

      // Get purchase statistics for the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const purchaseStats = await Purchase.aggregate([
        {
          $match: {
            user: user._id,
            createdAt: { $gte: thirtyDaysAgo },
            status: 'Completed'
          }
        },
        {
          $group: {
            _id: null,
            totalSpent: { $sum: '$amount' },
            totalUnits: { $sum: '$unitsReceived' },
            totalTransactions: { $sum: 1 }
          }
        }
      ]);

      const stats = purchaseStats[0] || {
        totalSpent: 0,
        totalUnits: 0,
        totalTransactions: 0
      };

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
            role: user.role
          },
          units: user.units,
          summary: {
            totalBalance,
            activeMeters,
            lowBalanceAlerts,
            ...stats
          },
          recentActivity: {
            purchases: recentPurchases,
            incidents: recentIncidents
          }
        }
      });

    } catch (error) {
      console.error('Get user dashboard error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error fetching dashboard data'
      });
    }
  }
);

// @desc    Get user purchase history
// @route   GET /api/v1/users/:id/purchases
// @access  Private (Own profile or Admin)
router.get('/:id/purchases',
  protect,
  validateParams({ id: schemas.objectId }),
  ownProfileOrAdmin,
  validateQuery(schemas.pagination),
  async (req, res) => {
    try {
      const { page = 1, limit = 20, status, dateFrom, dateTo } = req.query;

      let query = { user: req.params.id };

      if (status) {
        query.status = status;
      }

      if (dateFrom || dateTo) {
        query.createdAt = {};
        if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
        if (dateTo) query.createdAt.$lte = new Date(dateTo);
      }

      const skip = (page - 1) * limit;
      const purchases = await Purchase.find(query)
        .populate('unit', 'unitNumber estate')
        .populate('meter', 'meterNumber')
        .populate({
          path: 'unit',
          populate: {
            path: 'estate',
            select: 'name'
          }
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Purchase.countDocuments(query);

      res.json({
        success: true,
        count: purchases.length,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        },
        data: purchases
      });

    } catch (error) {
      console.error('Get user purchases error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error fetching purchase history'
      });
    }
  }
);

// @desc    Get user incidents
// @route   GET /api/v1/users/:id/incidents
// @access  Private (Own profile or Admin)
router.get('/:id/incidents',
  protect,
  validateParams({ id: schemas.objectId }),
  ownProfileOrAdmin,
  validateQuery(schemas.pagination),
  async (req, res) => {
    try {
      const { page = 1, limit = 20, status, category, priority } = req.query;

      let query = { 'reporter.user': req.params.id };

      if (status) {
        query.status = status;
      }

      if (category) {
        query.category = category;
      }

      if (priority) {
        query.priority = priority;
      }

      const skip = (page - 1) * limit;
      const incidents = await Incident.find(query)
        .populate('unit', 'unitNumber estate')
        .populate('assignedTo.user', 'firstName lastName')
        .populate({
          path: 'unit',
          populate: {
            path: 'estate',
            select: 'name'
          }
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Incident.countDocuments(query);

      res.json({
        success: true,
        count: incidents.length,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        },
        data: incidents
      });

    } catch (error) {
      console.error('Get user incidents error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error fetching incidents'
      });
    }
  }
);

// @desc    Get user statistics
// @route   GET /api/v1/users/stats/summary
// @access  Private (Admin only)
router.get('/stats/summary',
  protect,
  authorize('system_admin', 'estate_admin'),
  async (req, res) => {
    try {
      const { period = 30, estate } = req.query;
      const dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - parseInt(period));

      // Build match query
      let matchQuery = { createdAt: { $gte: dateFrom } };

      if (req.user.role === 'estate_admin') {
        const units = await Unit.find({
          estate: { $in: req.user.managedEstates }
        }).select('tenant');
        const tenantIds = units.map(unit => unit.tenant).filter(Boolean);
        matchQuery._id = { $in: tenantIds };
      }

      if (estate) {
        const estateUnits = await Unit.find({ estate }).select('tenant');
        const estateTenantIds = estateUnits.map(unit => unit.tenant).filter(Boolean);
        matchQuery._id = { $in: estateTenantIds };
      }

      // User statistics
      const userStats = await User.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 }
          }
        }
      ]);

      // Active users
      const activeUsers = await User.countDocuments({
        ...matchQuery,
        isActive: true,
        lastLogin: { $gte: dateFrom }
      });

      // Total users
      const totalUsers = await User.countDocuments(matchQuery);

      // New registrations
      const newRegistrations = await User.countDocuments({
        createdAt: { $gte: dateFrom },
        ...(req.user.role === 'estate_admin' && { _id: { $in: matchQuery._id } })
      });

      // Verified users
      const verifiedUsers = await User.countDocuments({
        ...matchQuery,
        isVerified: true
      });

      res.json({
        success: true,
        data: {
          summary: {
            totalUsers,
            activeUsers,
            newRegistrations,
            verifiedUsers,
            verificationRate: totalUsers > 0 ? ((verifiedUsers / totalUsers) * 100).toFixed(2) : 0
          },
          roleBreakdown: userStats,
          period: parseInt(period)
        }
      });

    } catch (error) {
      console.error('Get user statistics error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error fetching user statistics'
      });
    }
  }
);

// Helper function to get user activity summary
async function getUserActivitySummary(userId) {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [purchaseCount, incidentCount, lastPurchase, lastIncident] = await Promise.all([
      Purchase.countDocuments({
        user: userId,
        createdAt: { $gte: thirtyDaysAgo }
      }),
      Incident.countDocuments({
        'reporter.user': userId,
        createdAt: { $gte: thirtyDaysAgo }
      }),
      Purchase.findOne({ user: userId })
        .sort({ createdAt: -1 })
        .select('createdAt amount status'),
      Incident.findOne({ 'reporter.user': userId })
        .sort({ createdAt: -1 })
        .select('createdAt subject status')
    ]);

    return {
      recentActivity: {
        purchaseCount,
        incidentCount
      },
      lastActivity: {
        purchase: lastPurchase,
        incident: lastIncident
      }
    };

  } catch (error) {
    console.error('Get user activity summary error:', error);
    return null;
  }
}

// Make helper function available
router.getUserActivitySummary = getUserActivitySummary;

module.exports = router;