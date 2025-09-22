const express = require('express');
const router = express.Router();
const Joi = require('joi');
const Notification = require('../models/Notification');
const Unit = require('../models/Unit');
const Meter = require('../models/Meter');
const { protect, authorize } = require('../middleware/auth');
const { validate, validateQuery, validateParams, schemas } = require('../middleware/validation');

// @desc    Get user notifications
// @route   GET /api/v1/notifications
// @access  Private
router.get('/', protect, validateQuery(schemas.pagination), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      unreadOnly = false,
      type,
      category,
      priority
    } = req.query;

    const options = {
      limit: parseInt(limit),
      offset: (page - 1) * limit,
      unreadOnly: unreadOnly === 'true',
      type,
      category
    };

    // Add priority filter
    if (priority) {
      options.priority = priority;
    }

    const notifications = await Notification.getUserNotifications(req.user._id, options);
    console.log('🔥 NOTIFICATIONS ROUTE: notifications type:', typeof notifications);
    console.log('🔥 NOTIFICATIONS ROUTE: notifications instanceof Array:', notifications instanceof Array);
    console.log('🔥 NOTIFICATIONS ROUTE: notifications.length:', notifications?.length);

    const total = await Notification.countDocuments({
      'recipient.user': req.user._id,
      status: 'Sent',
      ...(unreadOnly === 'true' && { 'channels.inApp.read': false }),
      ...(type && { type }),
      ...(category && { category }),
      ...(priority && { priority })
    });

    const response = {
      success: true,
      count: notifications.length,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      },
      data: notifications
    };

    console.log('🔥 NOTIFICATIONS ROUTE: sending response:', JSON.stringify(response, null, 2));
    res.json(response);

  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching notifications'
    });
  }
});

// @desc    Get unread notification count
// @route   GET /api/v1/notifications/unread-count
// @access  Private
router.get('/unread-count', protect, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      'recipient.user': req.user._id,
      'channels.inApp.read': false,
      status: 'Sent'
    });

    res.json({
      success: true,
      data: { count }
    });

  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching unread count'
    });
  }
});

// @desc    Get single notification
// @route   GET /api/v1/notifications/:id
// @access  Private
router.get('/:id',
  protect,
  validateParams({ id: schemas.objectId }),
  async (req, res) => {
    try {
      const notification = await Notification.findById(req.params.id)
        .populate('relatedEntities.unit', 'unitNumber estate')
        .populate('relatedEntities.estate', 'name address.city')
        .populate('relatedEntities.purchase', 'transactionId amount status')
        .populate('relatedEntities.incident', 'incidentNumber subject status')
        .populate('createdBy', 'firstName lastName');

      if (!notification) {
        return res.status(404).json({
          success: false,
          error: 'Notification not found'
        });
      }

      // Check if user has access to this notification
      if (notification.recipient.user.toString() !== req.user._id.toString() &&
          req.user.role !== 'system_admin') {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to view this notification'
        });
      }

      // Mark as read if it's the recipient viewing it
      if (notification.recipient.user.toString() === req.user._id.toString() &&
          !notification.channels.inApp.read) {
        await notification.markAsRead(req.user._id);
      }

      res.json({
        success: true,
        data: notification
      });

    } catch (error) {
      console.error('Get notification error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error fetching notification'
      });
    }
  }
);

// @desc    Mark notification as read
// @route   PUT /api/v1/notifications/:id/read
// @access  Private
router.put('/:id/read',
  protect,
  validateParams({ id: schemas.objectId }),
  async (req, res) => {
    try {
      const notification = await Notification.findById(req.params.id);

      if (!notification) {
        return res.status(404).json({
          success: false,
          error: 'Notification not found'
        });
      }

      // Check if user has access
      if (notification.recipient.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to modify this notification'
        });
      }

      if (notification.channels.inApp.read) {
        return res.status(400).json({
          success: false,
          error: 'Notification is already marked as read'
        });
      }

      await notification.markAsRead(req.user._id);

      res.json({
        success: true,
        message: 'Notification marked as read',
        data: {
          id: notification._id,
          readAt: notification.channels.inApp.readAt
        }
      });

    } catch (error) {
      console.error('Mark notification as read error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error marking notification as read'
      });
    }
  }
);

// @desc    Mark all notifications as read
// @route   PUT /api/v1/notifications/read-all
// @access  Private
router.put('/read-all', protect, async (req, res) => {
  try {
    const result = await Notification.updateMany(
      {
        'recipient.user': req.user._id,
        'channels.inApp.read': false,
        status: 'Sent'
      },
      {
        $set: {
          'channels.inApp.read': true,
          'channels.inApp.readAt': new Date()
        },
        $inc: {
          'stats.readCount': 1
        }
      }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} notifications marked as read`,
      data: {
        updatedCount: result.modifiedCount
      }
    });

  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error marking notifications as read'
    });
  }
});

// @desc    Track notification action click
// @route   POST /api/v1/notifications/:id/action/:actionId
// @access  Private
router.post('/:id/action/:actionId',
  protect,
  validateParams({
    id: schemas.objectId,
    actionId: Joi.string().required()
  }),
  async (req, res) => {
    try {
      const notification = await Notification.findById(req.params.id);

      if (!notification) {
        return res.status(404).json({
          success: false,
          error: 'Notification not found'
        });
      }

      // Check if user has access
      if (notification.recipient.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to interact with this notification'
        });
      }

      // Find the action
      const action = notification.actions.find(a => a.id === req.params.actionId);

      if (!action) {
        return res.status(404).json({
          success: false,
          error: 'Action not found'
        });
      }

      await notification.trackClick(req.params.actionId, req.user._id);

      res.json({
        success: true,
        message: 'Action tracked successfully',
        data: {
          actionId: req.params.actionId,
          actionType: action.type,
          actionValue: action.value
        }
      });

    } catch (error) {
      console.error('Track notification action error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error tracking action'
      });
    }
  }
);

// @desc    Get notification statistics
// @route   GET /api/v1/notifications/stats/summary
// @access  Private
router.get('/stats/summary', protect, async (req, res) => {
  try {
    const { period = 30 } = req.query;
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - parseInt(period));

    const stats = await Notification.aggregate([
      {
        $match: {
          'recipient.user': req.user._id,
          createdAt: { $gte: dateFrom }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          read: {
            $sum: {
              $cond: ['$channels.inApp.read', 1, 0]
            }
          },
          unread: {
            $sum: {
              $cond: ['$channels.inApp.read', 0, 1]
            }
          }
        }
      }
    ]);

    // Type breakdown
    const typeStats = await Notification.aggregate([
      {
        $match: {
          'recipient.user': req.user._id,
          createdAt: { $gte: dateFrom }
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    // Priority breakdown
    const priorityStats = await Notification.aggregate([
      {
        $match: {
          'recipient.user': req.user._id,
          createdAt: { $gte: dateFrom }
        }
      },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        summary: stats[0] || { total: 0, read: 0, unread: 0 },
        typeBreakdown: typeStats,
        priorityBreakdown: priorityStats,
        period: parseInt(period)
      }
    });

  } catch (error) {
    console.error('Get notification statistics error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching notification statistics'
    });
  }
});

// @desc    Create notification (Admin only)
// @route   POST /api/v1/notifications
// @access  Private (Admin only)
router.post('/',
  protect,
  authorize('system_admin', 'estate_admin'),
  async (req, res) => {
    try {
      const {
        recipient,
        title,
        message,
        type,
        category,
        priority = 'Medium',
        relatedEntities,
        channels,
        actions,
        schedule
      } = req.body;

      // Validate required fields
      if (!title || !message || !type || !category) {
        return res.status(400).json({
          success: false,
          error: 'Title, message, type, and category are required'
        });
      }

      // Validate recipient
      if (!recipient || (!recipient.user && !recipient.criteria)) {
        return res.status(400).json({
          success: false,
          error: 'Recipient user or criteria is required'
        });
      }

      // For estate admins, ensure they can only send to their estates
      if (req.user.role === 'estate_admin') {
        if (recipient.criteria && recipient.criteria.estate) {
          const hasAccess = req.user.managedEstates.some(
            estate => estate.toString() === recipient.criteria.estate.toString()
          );

          if (!hasAccess) {
            return res.status(403).json({
              success: false,
              error: 'Not authorized to send notifications for this estate'
            });
          }
        }
      }

      const notificationData = {
        recipient,
        title,
        message,
        type,
        category,
        priority,
        relatedEntities: relatedEntities || {},
        channels: channels || {
          inApp: { enabled: true },
          email: { enabled: false },
          sms: { enabled: false },
          push: { enabled: true }
        },
        actions: actions || [],
        schedule: schedule || { sendAt: new Date() },
        createdBy: req.user._id,
        metadata: {
          source: 'Admin',
          tags: ['manual']
        }
      };

      const notification = await Notification.create(notificationData);

      // If it's for immediate delivery, attempt delivery
      if (!schedule || new Date(schedule.sendAt) <= new Date()) {
        setTimeout(async () => {
          try {
            await notification.attemptDelivery();
          } catch (error) {
            console.error('Notification delivery error:', error);
          }
        }, 1000);
      }

      res.status(201).json({
        success: true,
        message: 'Notification created successfully',
        data: notification
      });

    } catch (error) {
      console.error('Create notification error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error creating notification'
      });
    }
  }
);

// @desc    Send broadcast notification
// @route   POST /api/v1/notifications/broadcast
// @access  Private (Admin only)
router.post('/broadcast',
  protect,
  authorize('system_admin', 'estate_admin'),
  async (req, res) => {
    try {
      const {
        title,
        message,
        type,
        category,
        priority = 'Medium',
        targetCriteria,
        actions
      } = req.body;

      if (!title || !message || !type || !category || !targetCriteria) {
        return res.status(400).json({
          success: false,
          error: 'Title, message, type, category, and target criteria are required'
        });
      }

      // Build user query based on criteria
      let userQuery = { isActive: true };

      if (targetCriteria.role) {
        userQuery.role = { $in: Array.isArray(targetCriteria.role) ? targetCriteria.role : [targetCriteria.role] };
      }

      if (targetCriteria.estate && req.user.role === 'estate_admin') {
        // Ensure estate admin can only broadcast to their estates
        const hasAccess = req.user.managedEstates.some(
          estate => estate.toString() === targetCriteria.estate.toString()
        );

        if (!hasAccess) {
          return res.status(403).json({
            success: false,
            error: 'Not authorized to broadcast to this estate'
          });
        }

        // Get users from units in the estate
        const units = await Unit.find({ estate: targetCriteria.estate, tenant: { $exists: true } })
          .populate('tenant')
          .select('tenant');

        const tenantIds = units.map(unit => unit.tenant._id);
        userQuery._id = { $in: tenantIds };
      }

      // Get target users
      const targetUsers = await User.find(userQuery).select('_id firstName lastName email phone');

      if (targetUsers.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No users match the target criteria'
        });
      }

      // Create notifications for each target user
      const notifications = [];
      const batchId = `BATCH_${Date.now()}`;

      for (const user of targetUsers) {
        const notification = new Notification({
          recipient: {
            user: user._id
          },
          title,
          message,
          type,
          category,
          priority,
          channels: {
            inApp: { enabled: true },
            email: { enabled: true, subject: title },
            sms: { enabled: true, phoneNumber: user.phone },
            push: { enabled: true }
          },
          actions: actions || [],
          createdBy: req.user._id,
          metadata: {
            source: 'Broadcast',
            tags: ['broadcast', 'bulk'],
            batchId
          }
        });

        notifications.push(notification);
      }

      // Bulk insert notifications
      const createdNotifications = await Notification.insertMany(notifications);

      // Trigger delivery for all notifications (in batches to avoid overwhelming the system)
      const batchSize = 10;
      for (let i = 0; i < createdNotifications.length; i += batchSize) {
        const batch = createdNotifications.slice(i, i + batchSize);

        setTimeout(async () => {
          for (const notification of batch) {
            try {
              await notification.attemptDelivery();
            } catch (error) {
              console.error(`Delivery failed for notification ${notification._id}:`, error);
            }
          }
        }, (i / batchSize) * 1000); // Stagger batches by 1 second
      }

      res.json({
        success: true,
        message: 'Broadcast notification sent successfully',
        data: {
          batchId,
          targetUserCount: targetUsers.length,
          notificationsCreated: createdNotifications.length,
          estimatedDeliveryTime: `${Math.ceil(createdNotifications.length / batchSize)} seconds`
        }
      });

    } catch (error) {
      console.error('Broadcast notification error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error sending broadcast notification'
      });
    }
  }
);

// @desc    Create balance alert notification
// @route   POST /api/v1/notifications/balance-alert
// @access  Private (System use)
router.post('/balance-alert',
  protect,
  authorize('system_admin'),
  async (req, res) => {
    try {
      const { meterId, alertType = 'low_balance' } = req.body;

      if (!meterId) {
        return res.status(400).json({
          success: false,
          error: 'Meter ID is required'
        });
      }

      const meter = await Meter.findById(meterId)
        .populate({
          path: 'unit',
          populate: {
            path: 'tenant estate',
            select: 'firstName lastName email phone name address'
          }
        });

      if (!meter) {
        return res.status(404).json({
          success: false,
          error: 'Meter not found'
        });
      }

      if (!meter.unit.tenant) {
        return res.status(400).json({
          success: false,
          error: 'No tenant assigned to this unit'
        });
      }

      const notification = await Notification.createBalanceAlert(meter, alertType);

      res.json({
        success: true,
        message: 'Balance alert notification created successfully',
        data: {
          notificationId: notification._id,
          meterNumber: meter.meterNumber,
          currentBalance: meter.currentBalance.amount,
          tenant: meter.unit.tenant.fullName
        }
      });

    } catch (error) {
      console.error('Create balance alert error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error creating balance alert'
      });
    }
  }
);

// @desc    Get notification templates
// @route   GET /api/v1/notifications/templates
// @access  Private (Admin only)
router.get('/templates',
  protect,
  authorize('system_admin', 'estate_admin'),
  async (req, res) => {
    try {
      const templates = [
        {
          id: 'welcome',
          name: 'Welcome New Tenant',
          title: 'Welcome to {{estate_name}}!',
          message: 'Welcome to {{estate_name}}, {{tenant_name}}! Your unit {{unit_number}} is now ready. Download our app to manage your electricity purchases.',
          type: 'welcome',
          category: 'System',
          variables: ['estate_name', 'tenant_name', 'unit_number']
        },
        {
          id: 'low_balance',
          name: 'Low Balance Alert',
          title: 'Low Electricity Balance',
          message: 'Your electricity balance is running low at {{balance}} kWh. Purchase more electricity to avoid disconnection.',
          type: 'low_balance',
          category: 'Billing',
          variables: ['balance']
        },
        {
          id: 'purchase_success',
          name: 'Purchase Confirmation',
          title: 'Electricity Purchase Successful',
          message: 'Your purchase of {{units}} kWh for {{amount}} has been successful. Token: {{token}}',
          type: 'purchase_success',
          category: 'Billing',
          variables: ['units', 'amount', 'token']
        },
        {
          id: 'maintenance_notice',
          name: 'Maintenance Notice',
          title: 'Scheduled Maintenance - {{estate_name}}',
          message: 'Scheduled maintenance will be performed on {{date}} from {{start_time}} to {{end_time}}. Electricity may be temporarily unavailable.',
          type: 'system_maintenance',
          category: 'System',
          variables: ['estate_name', 'date', 'start_time', 'end_time']
        },
        {
          id: 'payment_reminder',
          name: 'Payment Reminder',
          title: 'Rent Payment Reminder',
          message: 'Your rent payment of {{amount}} is due on {{due_date}}. Please ensure payment is made on time.',
          type: 'payment_reminder',
          category: 'Billing',
          variables: ['amount', 'due_date']
        }
      ];

      res.json({
        success: true,
        data: templates
      });

    } catch (error) {
      console.error('Get notification templates error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error fetching templates'
      });
    }
  }
);

module.exports = router;