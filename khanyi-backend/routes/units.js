const express = require('express');
const router = express.Router();
const Unit = require('../models/Unit');
const Meter = require('../models/Meter');
const User = require('../models/User');
const { protect, authorize, unitAccess, estateAccess } = require('../middleware/auth');
const { validate, validateQuery, validateParams, schemas } = require('../middleware/validation');

// @desc    Get all units (with filtering)
// @route   GET /api/v1/units
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const {
      estate,
      status,
      tenant,
      minBedrooms,
      maxBedrooms,
      minArea,
      maxArea,
      page = 1,
      limit = 20
    } = req.query;

    // Build query based on user role
    let query = { isActive: true };

    // For tenants, only show their own units
    if (req.user.role === 'tenant') {
      query.tenant = req.user._id;
    }

    // For estate admins, only show units from managed estates
    if (req.user.role === 'estate_admin') {
      query.estate = { $in: req.user.managedEstates };
    }

    // Apply filters
    if (estate) {
      query.estate = estate;
    }

    if (status) {
      query.status = status;
    }

    if (tenant) {
      query.tenant = tenant;
    }

    if (minBedrooms || maxBedrooms) {
      query['specifications.bedrooms'] = {};
      if (minBedrooms) query['specifications.bedrooms'].$gte = parseInt(minBedrooms);
      if (maxBedrooms) query['specifications.bedrooms'].$lte = parseInt(maxBedrooms);
    }

    if (minArea || maxArea) {
      query['specifications.area.size'] = {};
      if (minArea) query['specifications.area.size'].$gte = parseFloat(minArea);
      if (maxArea) query['specifications.area.size'].$lte = parseFloat(maxArea);
    }

    const skip = (page - 1) * limit;
    const units = await Unit.find(query)
      .populate('estate', 'name address tariff')
      .populate('tenant', 'firstName lastName email phone')
      .populate('meter', 'meterNumber currentBalance status')
      .sort({ 'estate.name': 1, unitNumber: 1 })
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
    console.error('Get units error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching units'
    });
  }
});

// @desc    Get single unit
// @route   GET /api/v1/units/:id
// @access  Private (Unit access required)
router.get('/:id',
  protect,
  validateParams({ id: schemas.objectId }),
  unitAccess,
  async (req, res) => {
    try {
      const unit = await Unit.findById(req.params.id)
        .populate('estate', 'name address tariff management amenities')
        .populate('tenant', 'firstName lastName email phone emergencyContact')
        .populate('meter', 'meterNumber serialNumber currentBalance status specifications')
        .populate('createdBy', 'firstName lastName');

      if (!unit) {
        return res.status(404).json({
          success: false,
          error: 'Unit not found'
        });
      }

      res.json({
        success: true,
        data: unit
      });

    } catch (error) {
      console.error('Get unit error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error fetching unit'
      });
    }
  }
);

// @desc    Create unit
// @route   POST /api/v1/units
// @access  Private (System Admin or Estate Admin)
router.post('/',
  protect,
  authorize('system_admin', 'estate_admin'),
  validate(schemas.createUnit),
  estateAccess,
  async (req, res) => {
    try {
      const unitData = {
        ...req.body,
        createdBy: req.user._id
      };

      // Check if unit number already exists in estate
      const existingUnit = await Unit.findOne({
        estate: req.body.estate,
        unitNumber: req.body.unitNumber,
        isActive: true
      });

      if (existingUnit) {
        return res.status(400).json({
          success: false,
          error: `Unit ${req.body.unitNumber} already exists in this estate`
        });
      }

      const unit = await Unit.create(unitData);

      // Automatically create a meter for this unit
      const meterData = {
        meterNumber: `M${unit.unitNumber}${Date.now().toString().slice(-4)}`,
        serialNumber: `SN${unit._id.toString().slice(-8).toUpperCase()}`,
        unit: unit._id,
        specifications: {
          manufacturer: 'Hexing',
          model: 'HXE310',
          type: 'Prepaid',
          maxLoad: { value: 60, unit: 'A' },
          voltage: { value: 220, unit: 'V' },
          phases: 1
        },
        installation: {
          date: new Date(),
          technician: 'System Auto-Generated',
          location: 'Main Distribution Board'
        },
        createdBy: req.user._id
      };

      const meter = await Meter.create(meterData);

      // Update unit with meter reference
      unit.meter = meter._id;
      await unit.save();

      // Populate the created unit
      const populatedUnit = await Unit.findById(unit._id)
        .populate('estate', 'name address')
        .populate('meter', 'meterNumber currentBalance status')
        .populate('createdBy', 'firstName lastName');

      res.status(201).json({
        success: true,
        message: 'Unit and meter created successfully',
        data: populatedUnit
      });

    } catch (error) {
      console.error('Create unit error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error creating unit'
      });
    }
  }
);

// @desc    Update unit
// @route   PUT /api/v1/units/:id
// @access  Private (System Admin or Estate Admin)
router.put('/:id',
  protect,
  authorize('system_admin', 'estate_admin'),
  validateParams({ id: schemas.objectId }),
  unitAccess,
  async (req, res) => {
    try {
      const allowedUpdates = [
        'unitNumber', 'specifications', 'status', 'charges',
        'images', 'amenities'
      ];

      const updates = {};
      allowedUpdates.forEach(field => {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      });

      const unit = await Unit.findByIdAndUpdate(
        req.params.id,
        updates,
        {
          new: true,
          runValidators: true
        }
      ).populate('estate', 'name address')
       .populate('tenant', 'firstName lastName email phone');

      if (!unit) {
        return res.status(404).json({
          success: false,
          error: 'Unit not found'
        });
      }

      res.json({
        success: true,
        message: 'Unit updated successfully',
        data: unit
      });

    } catch (error) {
      console.error('Update unit error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error updating unit'
      });
    }
  }
);

// @desc    Delete unit (soft delete)
// @route   DELETE /api/v1/units/:id
// @access  Private (System Admin only)
router.delete('/:id',
  protect,
  authorize('system_admin'),
  validateParams({ id: schemas.objectId }),
  async (req, res) => {
    try {
      const unit = await Unit.findById(req.params.id);

      if (!unit) {
        return res.status(404).json({
          success: false,
          error: 'Unit not found'
        });
      }

      // Check if unit is occupied
      if (unit.status === 'Occupied' && unit.tenant) {
        return res.status(400).json({
          success: false,
          error: 'Cannot delete occupied unit. Please end lease first.'
        });
      }

      // Soft delete
      unit.isActive = false;
      await unit.save();

      res.json({
        success: true,
        message: 'Unit deleted successfully'
      });

    } catch (error) {
      console.error('Delete unit error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error deleting unit'
      });
    }
  }
);

// @desc    Assign tenant to unit
// @route   POST /api/v1/units/:id/tenant
// @access  Private (System Admin or Estate Admin)
router.post('/:id/tenant',
  protect,
  authorize('system_admin', 'estate_admin'),
  validateParams({ id: schemas.objectId }),
  unitAccess,
  async (req, res) => {
    try {
      const {
        tenantId,
        startDate,
        endDate,
        monthlyRent,
        deposit
      } = req.body;

      if (!tenantId || !startDate || !endDate || !monthlyRent) {
        return res.status(400).json({
          success: false,
          error: 'Tenant ID, lease dates, and monthly rent are required'
        });
      }

      const unit = await Unit.findById(req.params.id);

      if (!unit) {
        return res.status(404).json({
          success: false,
          error: 'Unit not found'
        });
      }

      if (unit.status !== 'Available') {
        return res.status(400).json({
          success: false,
          error: 'Unit is not available for lease'
        });
      }

      // Verify tenant exists and is a tenant
      const tenant = await User.findById(tenantId);
      if (!tenant || tenant.role !== 'tenant') {
        return res.status(400).json({
          success: false,
          error: 'Invalid tenant'
        });
      }

      // Update unit with tenant and lease information
      unit.tenant = tenantId;
      unit.status = 'Occupied';
      unit.lease = {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        monthlyRent: parseFloat(monthlyRent),
        deposit: deposit ? parseFloat(deposit) : 0,
        status: 'Active'
      };

      await unit.save();

      // Add unit to tenant's units array
      await User.findByIdAndUpdate(tenantId, {
        $addToSet: { units: unit._id }
      });

      const updatedUnit = await Unit.findById(req.params.id)
        .populate('tenant', 'firstName lastName email phone')
        .populate('estate', 'name address');

      res.json({
        success: true,
        message: 'Tenant assigned successfully',
        data: updatedUnit
      });

    } catch (error) {
      console.error('Assign tenant error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error assigning tenant'
      });
    }
  }
);

// @desc    Remove tenant from unit
// @route   DELETE /api/v1/units/:id/tenant
// @access  Private (System Admin or Estate Admin)
router.delete('/:id/tenant',
  protect,
  authorize('system_admin', 'estate_admin'),
  validateParams({ id: schemas.objectId }),
  unitAccess,
  async (req, res) => {
    try {
      const { reason = 'Lease ended' } = req.body;

      const unit = await Unit.findById(req.params.id);

      if (!unit) {
        return res.status(404).json({
          success: false,
          error: 'Unit not found'
        });
      }

      if (!unit.tenant) {
        return res.status(400).json({
          success: false,
          error: 'Unit has no assigned tenant'
        });
      }

      const tenantId = unit.tenant;

      // Update unit
      unit.tenant = undefined;
      unit.status = 'Available';
      unit.lease.status = 'Terminated';

      await unit.save();

      // Remove unit from tenant's units array
      await User.findByIdAndUpdate(tenantId, {
        $pull: { units: unit._id }
      });

      res.json({
        success: true,
        message: 'Tenant removed successfully',
        data: { reason }
      });

    } catch (error) {
      console.error('Remove tenant error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error removing tenant'
      });
    }
  }
);

// @desc    Get unit meter information
// @route   GET /api/v1/units/:id/meter
// @access  Private (Unit access required)
router.get('/:id/meter',
  protect,
  validateParams({ id: schemas.objectId }),
  unitAccess,
  async (req, res) => {
    try {
      const meter = await Meter.findOne({ unit: req.params.id })
        .populate('unit', 'unitNumber estate');

      if (!meter) {
        return res.status(404).json({
          success: false,
          error: 'Meter not found for this unit'
        });
      }

      res.json({
        success: true,
        data: meter
      });

    } catch (error) {
      console.error('Get unit meter error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error fetching meter information'
      });
    }
  }
);

// @desc    Create meter for unit
// @route   POST /api/v1/units/:id/meter
// @access  Private (System Admin or Estate Admin)
router.post('/:id/meter',
  protect,
  authorize('system_admin', 'estate_admin'),
  validateParams({ id: schemas.objectId }),
  validate(schemas.createMeter),
  unitAccess,
  async (req, res) => {
    try {
      const unit = await Unit.findById(req.params.id);

      if (!unit) {
        return res.status(404).json({
          success: false,
          error: 'Unit not found'
        });
      }

      // Check if unit already has a meter
      const existingMeter = await Meter.findOne({ unit: req.params.id });
      if (existingMeter) {
        return res.status(400).json({
          success: false,
          error: 'Unit already has a meter assigned'
        });
      }

      const meterData = {
        ...req.body,
        unit: req.params.id,
        createdBy: req.user._id
      };

      const meter = await Meter.create(meterData);

      // Update unit with meter reference
      unit.meter = meter._id;
      await unit.save();

      const populatedMeter = await Meter.findById(meter._id)
        .populate('unit', 'unitNumber estate')
        .populate('createdBy', 'firstName lastName');

      res.status(201).json({
        success: true,
        message: 'Meter created and assigned successfully',
        data: populatedMeter
      });

    } catch (error) {
      console.error('Create meter error:', error);

      if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        return res.status(400).json({
          success: false,
          error: `${field} already exists`
        });
      }

      res.status(500).json({
        success: false,
        error: 'Server error creating meter'
      });
    }
  }
);

// @desc    Add meter reading
// @route   POST /api/v1/units/:id/meter/readings
// @access  Private (Unit access required or System Admin)
router.post('/:id/meter/readings',
  protect,
  validateParams({ id: schemas.objectId }),
  validate(schemas.meterReading),
  async (req, res) => {
    try {
      // Check unit access for tenants and estate admins
      if (req.user.role !== 'system_admin') {
        // Run unit access check middleware
        const unit = await Unit.findById(req.params.id);
        if (!unit) {
          return res.status(404).json({
            success: false,
            error: 'Unit not found'
          });
        }

        // Check access based on role
        if (req.user.role === 'tenant' && unit.tenant?.toString() !== req.user._id.toString()) {
          return res.status(403).json({
            success: false,
            error: 'Not authorized to access this unit'
          });
        }

        if (req.user.role === 'estate_admin') {
          const hasAccess = req.user.managedEstates.some(
            estate => estate.toString() === unit.estate.toString()
          );
          if (!hasAccess) {
            return res.status(403).json({
              success: false,
              error: 'Not authorized to access this unit'
            });
          }
        }
      }

      const meter = await Meter.findOne({ unit: req.params.id });

      if (!meter) {
        return res.status(404).json({
          success: false,
          error: 'Meter not found for this unit'
        });
      }

      const { reading, readBy = 'Manual', notes } = req.body;

      await meter.addReading(reading, readBy, notes);

      res.json({
        success: true,
        message: 'Meter reading added successfully',
        data: {
          reading,
          currentBalance: meter.currentBalance.amount,
          dailyConsumption: meter.dailyAverageConsumption
        }
      });

    } catch (error) {
      console.error('Add meter reading error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error adding meter reading'
      });
    }
  }
);

// @desc    Get unit maintenance history
// @route   GET /api/v1/units/:id/maintenance
// @access  Private (Unit access required)
router.get('/:id/maintenance',
  protect,
  validateParams({ id: schemas.objectId }),
  unitAccess,
  async (req, res) => {
    try {
      const unit = await Unit.findById(req.params.id).select('maintenance');

      if (!unit) {
        return res.status(404).json({
          success: false,
          error: 'Unit not found'
        });
      }

      res.json({
        success: true,
        data: unit.maintenance.sort((a, b) => new Date(b.date) - new Date(a.date))
      });

    } catch (error) {
      console.error('Get maintenance history error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error fetching maintenance history'
      });
    }
  }
);

// @desc    Add maintenance record
// @route   POST /api/v1/units/:id/maintenance
// @access  Private (System Admin or Estate Admin)
router.post('/:id/maintenance',
  protect,
  authorize('system_admin', 'estate_admin'),
  validateParams({ id: schemas.objectId }),
  unitAccess,
  async (req, res) => {
    try {
      const {
        type,
        description,
        cost,
        technician,
        status = 'Scheduled'
      } = req.body;

      if (!type || !description) {
        return res.status(400).json({
          success: false,
          error: 'Type and description are required'
        });
      }

      const unit = await Unit.findById(req.params.id);

      if (!unit) {
        return res.status(404).json({
          success: false,
          error: 'Unit not found'
        });
      }

      const maintenanceRecord = {
        date: new Date(),
        type,
        description,
        cost: cost ? parseFloat(cost) : 0,
        technician,
        status
      };

      unit.maintenance.push(maintenanceRecord);
      await unit.save();

      res.json({
        success: true,
        message: 'Maintenance record added successfully',
        data: maintenanceRecord
      });

    } catch (error) {
      console.error('Add maintenance record error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error adding maintenance record'
      });
    }
  }
);

module.exports = router;