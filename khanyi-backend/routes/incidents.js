const express = require('express');
const router = express.Router();
const Incident = require('../models/Incident');
const Unit = require('../models/Unit');
const User = require('../models/User');
const { protect, authorize, unitAccess } = require('../middleware/auth');
const { validate, validateQuery, validateParams, schemas } = require('../middleware/validation');

// @desc    Get incidents
// @route   GET /api/v1/incidents
// @access  Private
router.get('/', protect, validateQuery(schemas.pagination), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      priority,
      category,
      assignedTo,
      dateFrom,
      dateTo,
      search
    } = req.query;

    // Build query based on user role
    let query = {};

    if (req.user.role === 'tenant') {
      query['reporter.user'] = req.user._id;
    } else if (req.user.role === 'estate_admin') {
      // Get all units from managed estates
      const units = await Unit.find({
        estate: { $in: req.user.managedEstates },
        isActive: true
      }).select('_id');

      query.$or = [
        { 'reporter.user': req.user._id },
        { unit: { $in: units.map(u => u._id) } }
      ];
    }
    // System admins see all incidents

    // Apply filters
    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    if (category) {
      query.category = category;
    }

    if (assignedTo) {
      query['assignedTo.user'] = assignedTo;
    }

    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    if (search) {
      query.$text = { $search: search };
    }

    const skip = (page - 1) * limit;
    const incidents = await Incident.find(query)
      .populate('reporter.user', 'firstName lastName email phone')
      .populate('unit', 'unitNumber estate')
      .populate('meter', 'meterNumber')
      .populate('assignedTo.user', 'firstName lastName email')
      .populate('resolution.resolvedBy', 'firstName lastName')
      .populate({
        path: 'unit',
        populate: {
          path: 'estate',
          select: 'name address.city'
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
    console.error('Get incidents error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching incidents'
    });
  }
});

// @desc    Get single incident
// @route   GET /api/v1/incidents/:id
// @access  Private
router.get('/:id',
  protect,
  validateParams({ id: schemas.objectId }),
  async (req, res) => {
    try {
      const incident = await Incident.findById(req.params.id)
        .populate('reporter.user', 'firstName lastName email phone')
        .populate('unit', 'unitNumber estate tenant')
        .populate('meter', 'meterNumber serialNumber')
        .populate('purchase', 'transactionId amount status')
        .populate('assignedTo.user', 'firstName lastName email')
        .populate('resolution.resolvedBy', 'firstName lastName email')
        .populate('escalation.escalatedTo', 'firstName lastName email')
        .populate('escalation.escalatedBy', 'firstName lastName email')
        .populate('communications.user', 'firstName lastName')
        .populate({
          path: 'unit',
          populate: {
            path: 'estate',
            select: 'name address management'
          }
        });

      if (!incident) {
        return res.status(404).json({
          success: false,
          error: 'Incident not found'
        });
      }

      // Check access permissions
      let hasAccess = false;

      if (req.user.role === 'system_admin') {
        hasAccess = true;
      } else if (req.user.role === 'tenant') {
        hasAccess = incident.reporter.user._id.toString() === req.user._id.toString();
      } else if (req.user.role === 'estate_admin') {
        if (incident.unit) {
          hasAccess = req.user.managedEstates.some(
            estate => estate.toString() === incident.unit.estate._id.toString()
          );
        }
      }

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to view this incident'
        });
      }

      res.json({
        success: true,
        data: incident
      });

    } catch (error) {
      console.error('Get incident error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error fetching incident'
      });
    }
  }
);

// @desc    Create incident
// @route   POST /api/v1/incidents
// @access  Private
router.post('/',
  protect,
  validate(schemas.createIncident),
  async (req, res) => {
    try {
      const {
        category,
        subcategory,
        priority,
        subject,
        description,
        unit,
        meter,
        purchase
      } = req.body;

      // Validate unit access if unit is specified
      if (unit) {
        const unitDoc = await Unit.findById(unit);
        if (!unitDoc) {
          return res.status(404).json({
            success: false,
            error: 'Unit not found'
          });
        }

        // Check if user has access to this unit
        if (req.user.role === 'tenant') {
          if (!unitDoc.tenant || unitDoc.tenant.toString() !== req.user._id.toString()) {
            return res.status(403).json({
              success: false,
              error: 'Not authorized to create incidents for this unit'
            });
          }
        }
      }

      // Create incident data
      const incidentData = {
        reporter: {
          user: req.user._id,
          name: req.user.fullName,
          phone: req.user.phone,
          email: req.user.email
        },
        category,
        subcategory,
        priority,
        subject,
        description,
        unit,
        meter,
        purchase,
        metadata: {
          source: 'App',
          userAgent: req.get('User-Agent'),
          ipAddress: req.ip
        }
      };

      const incident = await Incident.create(incidentData);

      // Populate the created incident
      const populatedIncident = await Incident.findById(incident._id)
        .populate('reporter.user', 'firstName lastName email phone')
        .populate('unit', 'unitNumber estate')
        .populate({
          path: 'unit',
          populate: {
            path: 'estate',
            select: 'name address.city'
          }
        });

      // Auto-assign based on category (simplified logic)
      setTimeout(async () => {
        try {
          await this.autoAssignIncident(incident._id);
        } catch (error) {
          console.error('Auto-assignment error:', error);
        }
      }, 1000);

      res.status(201).json({
        success: true,
        message: 'Incident created successfully',
        data: populatedIncident
      });

    } catch (error) {
      console.error('Create incident error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error creating incident'
      });
    }
  }
);

// @desc    Update incident
// @route   PUT /api/v1/incidents/:id
// @access  Private (Admin only)
router.put('/:id',
  protect,
  authorize('system_admin', 'estate_admin'),
  validateParams({ id: schemas.objectId }),
  validate(schemas.updateIncident),
  async (req, res) => {
    try {
      const incident = await Incident.findById(req.params.id);

      if (!incident) {
        return res.status(404).json({
          success: false,
          error: 'Incident not found'
        });
      }

      // Check estate access for estate admins
      if (req.user.role === 'estate_admin' && incident.unit) {
        const unit = await Unit.findById(incident.unit).populate('estate');
        const hasAccess = req.user.managedEstates.some(
          estate => estate.toString() === unit.estate._id.toString()
        );

        if (!hasAccess) {
          return res.status(403).json({
            success: false,
            error: 'Not authorized to update incidents for this estate'
          });
        }
      }

      const {
        status,
        priority,
        assignedTo,
        resolution
      } = req.body;

      // Update fields
      if (status) incident.status = status;
      if (priority) incident.priority = priority;

      if (assignedTo) {
        await incident.assign(assignedTo.user, assignedTo.team, req.user._id);
      }

      if (resolution && status === 'Resolved') {
        await incident.resolve(resolution.summary, resolution.details, req.user._id);
      } else {
        await incident.save();
      }

      const updatedIncident = await Incident.findById(incident._id)
        .populate('reporter.user', 'firstName lastName email phone')
        .populate('assignedTo.user', 'firstName lastName email')
        .populate('resolution.resolvedBy', 'firstName lastName email');

      res.json({
        success: true,
        message: 'Incident updated successfully',
        data: updatedIncident
      });

    } catch (error) {
      console.error('Update incident error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error updating incident'
      });
    }
  }
);

// @desc    Add communication to incident
// @route   POST /api/v1/incidents/:id/communications
// @access  Private
router.post('/:id/communications',
  protect,
  validateParams({ id: schemas.objectId }),
  async (req, res) => {
    try {
      const { type, content, direction = 'Internal', isPublic = true } = req.body;

      if (!type || !content) {
        return res.status(400).json({
          success: false,
          error: 'Type and content are required'
        });
      }

      const incident = await Incident.findById(req.params.id);

      if (!incident) {
        return res.status(404).json({
          success: false,
          error: 'Incident not found'
        });
      }

      // Check access
      let hasAccess = false;

      if (req.user.role === 'system_admin') {
        hasAccess = true;
      } else if (req.user.role === 'tenant') {
        hasAccess = incident.reporter.user.toString() === req.user._id.toString();
      } else if (req.user.role === 'estate_admin' && incident.unit) {
        const unit = await Unit.findById(incident.unit).populate('estate');
        hasAccess = req.user.managedEstates.some(
          estate => estate.toString() === unit.estate._id.toString()
        );
      }

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to add communications to this incident'
        });
      }

      await incident.addCommunication(type, content, req.user._id, direction, isPublic);

      res.json({
        success: true,
        message: 'Communication added successfully',
        data: {
          type,
          content,
          timestamp: new Date(),
          user: {
            id: req.user._id,
            name: req.user.fullName
          }
        }
      });

    } catch (error) {
      console.error('Add communication error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error adding communication'
      });
    }
  }
);

// @desc    Escalate incident
// @route   POST /api/v1/incidents/:id/escalate
// @access  Private (Admin only)
router.post('/:id/escalate',
  protect,
  authorize('system_admin', 'estate_admin'),
  validateParams({ id: schemas.objectId }),
  async (req, res) => {
    try {
      const { escalatedTo, reason } = req.body;

      if (!escalatedTo || !reason) {
        return res.status(400).json({
          success: false,
          error: 'Escalated to user and reason are required'
        });
      }

      const incident = await Incident.findById(req.params.id);

      if (!incident) {
        return res.status(404).json({
          success: false,
          error: 'Incident not found'
        });
      }

      // Check estate access for estate admins
      if (req.user.role === 'estate_admin' && incident.unit) {
        const unit = await Unit.findById(incident.unit).populate('estate');
        const hasAccess = req.user.managedEstates.some(
          estate => estate.toString() === unit.estate._id.toString()
        );

        if (!hasAccess) {
          return res.status(403).json({
            success: false,
            error: 'Not authorized to escalate incidents for this estate'
          });
        }
      }

      await incident.escalate(escalatedTo, reason, req.user._id);

      res.json({
        success: true,
        message: 'Incident escalated successfully',
        data: {
          incidentNumber: incident.incidentNumber,
          escalationLevel: incident.escalation.level,
          escalatedTo: escalatedTo,
          reason: reason
        }
      });

    } catch (error) {
      console.error('Escalate incident error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error escalating incident'
      });
    }
  }
);

// @desc    Close incident
// @route   POST /api/v1/incidents/:id/close
// @access  Private (Admin only)
router.post('/:id/close',
  protect,
  authorize('system_admin', 'estate_admin'),
  validateParams({ id: schemas.objectId }),
  async (req, res) => {
    try {
      const { reason = 'Resolved' } = req.body;

      const incident = await Incident.findById(req.params.id);

      if (!incident) {
        return res.status(404).json({
          success: false,
          error: 'Incident not found'
        });
      }

      if (incident.status === 'Closed') {
        return res.status(400).json({
          success: false,
          error: 'Incident is already closed'
        });
      }

      // Check estate access for estate admins
      if (req.user.role === 'estate_admin' && incident.unit) {
        const unit = await Unit.findById(incident.unit).populate('estate');
        const hasAccess = req.user.managedEstates.some(
          estate => estate.toString() === unit.estate._id.toString()
        );

        if (!hasAccess) {
          return res.status(403).json({
            success: false,
            error: 'Not authorized to close incidents for this estate'
          });
        }
      }

      await incident.close(req.user._id, reason);

      res.json({
        success: true,
        message: 'Incident closed successfully',
        data: {
          incidentNumber: incident.incidentNumber,
          status: incident.status,
          closedBy: req.user.fullName,
          reason
        }
      });

    } catch (error) {
      console.error('Close incident error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error closing incident'
      });
    }
  }
);

// @desc    Get incident dashboard statistics
// @route   GET /api/v1/incidents/stats/dashboard
// @access  Private
router.get('/stats/dashboard', protect, async (req, res) => {
  try {
    const isAdmin = req.user.role === 'system_admin';
    const userId = isAdmin ? null : req.user._id;

    const stats = await Incident.getDashboardStats(userId, isAdmin);

    // Additional statistics
    const additionalStats = await this.getAdditionalStats(req.user);

    res.json({
      success: true,
      data: {
        ...stats[0],
        ...additionalStats
      }
    });

  } catch (error) {
    console.error('Get dashboard statistics error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching dashboard statistics'
    });
  }
});

// @desc    Get incident categories
// @route   GET /api/v1/incidents/categories
// @access  Private
router.get('/categories', protect, async (req, res) => {
  try {
    const categories = [
      {
        name: 'Meter Issue',
        subcategories: ['Meter not working', 'Meter reading incorrect', 'Meter damaged']
      },
      {
        name: 'Token Problem',
        subcategories: ['Token not received', 'Token rejected by meter', 'Invalid token']
      },
      {
        name: 'Payment Issue',
        subcategories: ['Payment failed', 'Double charged', 'Refund request']
      },
      {
        name: 'App/System Error',
        subcategories: ['App crashes', 'Login issues', 'Feature not working']
      },
      {
        name: 'Billing Inquiry',
        subcategories: ['Incorrect billing', 'Tariff inquiry', 'Usage dispute']
      },
      {
        name: 'Connection Problem',
        subcategories: ['No electricity', 'Partial power', 'Power fluctuation']
      },
      {
        name: 'General Support',
        subcategories: ['Other']
      }
    ];

    res.json({
      success: true,
      data: categories
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching categories'
    });
  }
});

// Helper function for auto-assignment (simplified)
async function autoAssignIncident(incidentId) {
  try {
    const incident = await Incident.findById(incidentId);
    if (!incident) return;

    // Simple auto-assignment logic based on category
    const assignmentRules = {
      'Meter Issue': 'Technical',
      'Token Problem': 'Technical',
      'Payment Issue': 'Billing',
      'App/System Error': 'Technical',
      'Billing Inquiry': 'Billing',
      'Connection Problem': 'Technical',
      'General Support': 'Support',
      'Emergency': 'Technical',
      'Maintenance Request': 'Technical',
      'Complaint': 'Management'
    };

    const team = assignmentRules[incident.category] || 'Support';

    // Find available team members (simplified - would normally check availability)
    const teamMembers = await User.find({
      role: { $in: ['system_admin', 'estate_admin'] },
      isActive: true
    }).limit(1);

    if (teamMembers.length > 0) {
      await incident.assign(teamMembers[0]._id, team, null);
    }

  } catch (error) {
    console.error('Auto-assignment error:', error);
  }
}

// Helper function for additional statistics
async function getAdditionalStats(user) {
  try {
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    let matchQuery = { createdAt: { $gte: last30Days } };

    if (user.role === 'tenant') {
      matchQuery['reporter.user'] = user._id;
    } else if (user.role === 'estate_admin') {
      const units = await Unit.find({
        estate: { $in: user.managedEstates }
      }).select('_id');
      matchQuery.unit = { $in: units.map(u => u._id) };
    }

    const categoryStats = await Incident.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    const priorityStats = await Incident.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    // Average resolution time
    const avgResolutionTime = await Incident.aggregate([
      {
        $match: {
          ...matchQuery,
          'resolution.resolvedAt': { $exists: true }
        }
      },
      {
        $group: {
          _id: null,
          avgTime: { $avg: '$resolution.resolutionTime' }
        }
      }
    ]);

    return {
      categoryBreakdown: categoryStats,
      priorityBreakdown: priorityStats,
      averageResolutionTime: avgResolutionTime[0]?.avgTime || 0
    };

  } catch (error) {
    console.error('Additional stats error:', error);
    return {};
  }
}

// Make helper functions available
router.autoAssignIncident = autoAssignIncident;
router.getAdditionalStats = getAdditionalStats;

module.exports = router;