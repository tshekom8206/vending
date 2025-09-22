const express = require('express');
const router = express.Router();
const Purchase = require('../models/Purchase');
const Unit = require('../models/Unit');
const Meter = require('../models/Meter');
const Notification = require('../models/Notification');
const { protect, authorize, unitAccess } = require('../middleware/auth');
const { validate, validateQuery, validateParams, schemas } = require('../middleware/validation');
const TokenGenerator = require('../utils/tokenGenerator');

// @desc    Get user's purchase history
// @route   GET /api/v1/purchases
// @access  Private
router.get('/', protect, validateQuery(schemas.pagination), async (req, res) => {
  try {
    const { page = 1, limit = 20, status, unit, dateFrom, dateTo } = req.query;

    // Build query based on user role
    let query = {};

    if (req.user.role === 'tenant') {
      query.user = req.user._id;
    } else if (req.user.role === 'estate_admin') {
      // Get all units from managed estates
      const units = await Unit.find({
        estate: { $in: req.user.managedEstates },
        isActive: true
      }).select('_id');

      query.unit = { $in: units.map(u => u._id) };
    }
    // System admins see all purchases

    // Apply filters
    if (status) {
      query.status = status;
    }

    if (unit) {
      query.unit = unit;
    }

    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    const skip = (page - 1) * limit;
    const purchases = await Purchase.find(query)
      .populate('user', 'firstName lastName email phone')
      .populate('unit', 'unitNumber estate')
      .populate('meter', 'meterNumber')
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
    console.error('Get purchases error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching purchases'
    });
  }
});

// @desc    Get single purchase
// @route   GET /api/v1/purchases/:id
// @access  Private
router.get('/:id',
  protect,
  validateParams({ id: schemas.objectId }),
  async (req, res) => {
    try {
      const purchase = await Purchase.findById(req.params.id)
        .populate('user', 'firstName lastName email phone')
        .populate('unit', 'unitNumber estate')
        .populate('meter', 'meterNumber serialNumber')
        .populate({
          path: 'unit',
          populate: {
            path: 'estate',
            select: 'name address tariff'
          }
        });

      if (!purchase) {
        return res.status(404).json({
          success: false,
          error: 'Purchase not found'
        });
      }

      // Check access permissions
      if (req.user.role === 'tenant' && purchase.user._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to view this purchase'
        });
      }

      if (req.user.role === 'estate_admin') {
        const hasAccess = req.user.managedEstates.some(
          estate => estate.toString() === purchase.unit.estate._id.toString()
        );

        if (!hasAccess) {
          return res.status(403).json({
            success: false,
            error: 'Not authorized to view this purchase'
          });
        }
      }

      res.json({
        success: true,
        data: purchase
      });

    } catch (error) {
      console.error('Get purchase error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error fetching purchase'
      });
    }
  }
);

// @desc    Purchase electricity
// @route   POST /api/v1/purchases
// @access  Private
router.post('/',
  protect,
  validate(schemas.purchaseElectricity),
  async (req, res) => {
    try {
      const { unit: unitId, amount, payment, delivery } = req.body;

      // Verify unit exists and user has access
      const unit = await Unit.findById(unitId)
        .populate('estate', 'name tariff')
        .populate('tenant', 'firstName lastName email phone');

      if (!unit) {
        return res.status(404).json({
          success: false,
          error: 'Unit not found'
        });
      }

      // Check unit access
      if (req.user.role === 'tenant') {
        if (!unit.tenant || unit.tenant._id.toString() !== req.user._id.toString()) {
          return res.status(403).json({
            success: false,
            error: 'Not authorized to purchase for this unit'
          });
        }
      } else if (req.user.role === 'estate_admin') {
        const hasAccess = req.user.managedEstates.some(
          estate => estate.toString() === unit.estate._id.toString()
        );

        if (!hasAccess) {
          return res.status(403).json({
            success: false,
            error: 'Not authorized to purchase for this unit'
          });
        }
      }

      // Get meter information
      const meter = await Meter.findOne({ unit: unitId });

      if (!meter) {
        return res.status(404).json({
          success: false,
          error: 'Meter not found for this unit'
        });
      }

      if (meter.status !== 'Active') {
        return res.status(400).json({
          success: false,
          error: 'Meter is not active for purchases'
        });
      }

      // Validate amount limits
      if (amount < 10) {
        return res.status(400).json({
          success: false,
          error: 'Minimum purchase amount is R10'
        });
      }

      if (amount > 5000) {
        return res.status(400).json({
          success: false,
          error: 'Maximum purchase amount is R5000'
        });
      }

      // Calculate units and fees
      const tariffRate = unit.estate.tariff.rate;
      const unitsReceived = TokenGenerator.calculateKwhFromAmount(amount, tariffRate);

      if (unitsReceived <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Purchase amount too low after fees'
        });
      }

      // Generate electricity token
      const tokenData = TokenGenerator.generateElectricityToken(
        amount,
        meter.meterNumber,
        {
          tariffRate,
          vendorId: '1234', // This could be dynamic based on meter manufacturer
          tokenType: meter.specifications.type === 'Smart' ? 'Smart' : 'STS'
        }
      );

      // Create purchase record
      const purchaseData = {
        user: req.user._id,
        unit: unitId,
        meter: meter._id,
        amount,
        unitsReceived,
        tariffRate,
        token: {
          value: tokenData.token,
          type: tokenData.metadata.tokenType,
          expiryDate: tokenData.expiryDate
        },
        payment: {
          method: payment.method,
          reference: payment.reference || TokenGenerator.generatePaymentReference(req.user._id, unitId),
          status: 'Pending'
        },
        delivery: {
          method: delivery?.method || 'SMS',
          destination: delivery?.destination || req.user.phone || req.user.email
        },
        metadata: {
          userAgent: req.get('User-Agent'),
          ipAddress: req.ip,
          platform: req.body.platform || 'API'
        }
      };

      const purchase = await Purchase.create(purchaseData);

      // Simulate payment processing (in real implementation, integrate with payment gateway)
      setTimeout(async () => {
        try {
          await processPayment(purchase._id);
        } catch (error) {
          console.error('Background payment processing error:', error);
        }
      }, 1000);

      // Return immediate response
      const populatedPurchase = await Purchase.findById(purchase._id)
        .populate('unit', 'unitNumber estate')
        .populate('meter', 'meterNumber')
        .populate({
          path: 'unit',
          populate: {
            path: 'estate',
            select: 'name'
          }
        });

      res.status(201).json({
        success: true,
        message: 'Purchase initiated successfully',
        data: {
          transactionId: purchase.transactionId,
          amount: purchase.amount,
          unitsReceived: purchase.unitsReceived,
          token: tokenData.formattedToken,
          status: purchase.status,
          unit: populatedPurchase.unit,
          meter: populatedPurchase.meter,
          estimatedDelivery: '2-5 minutes'
        }
      });

    } catch (error) {
      console.error('Purchase electricity error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error processing purchase'
      });
    }
  }
);

// @desc    Retry token delivery
// @route   POST /api/v1/purchases/:id/retry-delivery
// @access  Private
router.post('/:id/retry-delivery',
  protect,
  validateParams({ id: schemas.objectId }),
  async (req, res) => {
    try {
      const purchase = await Purchase.findById(req.params.id)
        .populate('user', 'firstName lastName email phone');

      if (!purchase) {
        return res.status(404).json({
          success: false,
          error: 'Purchase not found'
        });
      }

      // Check access
      if (req.user.role === 'tenant' && purchase.user._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to retry delivery for this purchase'
        });
      }

      if (purchase.status !== 'Completed') {
        return res.status(400).json({
          success: false,
          error: 'Can only retry delivery for completed purchases'
        });
      }

      if (purchase.delivery.attempts >= purchase.delivery.maxAttempts) {
        return res.status(400).json({
          success: false,
          error: 'Maximum delivery attempts exceeded'
        });
      }

      await purchase.retryDelivery();

      // Simulate delivery (in real implementation, send actual SMS/email)
      setTimeout(async () => {
        try {
          purchase.delivery.deliveredAt = new Date();
          await purchase.save();
        } catch (error) {
          console.error('Delivery simulation error:', error);
        }
      }, 2000);

      res.json({
        success: true,
        message: 'Token delivery retry initiated',
        data: {
          transactionId: purchase.transactionId,
          deliveryMethod: purchase.delivery.method,
          destination: purchase.delivery.destination,
          attempt: purchase.delivery.attempts
        }
      });

    } catch (error) {
      console.error('Retry delivery error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Server error retrying delivery'
      });
    }
  }
);

// @desc    Process refund
// @route   POST /api/v1/purchases/:id/refund
// @access  Private (Admin only)
router.post('/:id/refund',
  protect,
  authorize('system_admin', 'estate_admin'),
  validateParams({ id: schemas.objectId }),
  async (req, res) => {
    try {
      const { reason, refundAmount } = req.body;

      if (!reason) {
        return res.status(400).json({
          success: false,
          error: 'Refund reason is required'
        });
      }

      const purchase = await Purchase.findById(req.params.id)
        .populate('unit', 'estate')
        .populate('user', 'firstName lastName email');

      if (!purchase) {
        return res.status(404).json({
          success: false,
          error: 'Purchase not found'
        });
      }

      // Check estate access for estate admins
      if (req.user.role === 'estate_admin') {
        const hasAccess = req.user.managedEstates.some(
          estate => estate.toString() === purchase.unit.estate.toString()
        );

        if (!hasAccess) {
          return res.status(403).json({
            success: false,
            error: 'Not authorized to process refunds for this estate'
          });
        }
      }

      if (purchase.status === 'Refunded') {
        return res.status(400).json({
          success: false,
          error: 'Purchase has already been refunded'
        });
      }

      if (purchase.status !== 'Completed' && purchase.status !== 'Failed') {
        return res.status(400).json({
          success: false,
          error: 'Can only refund completed or failed purchases'
        });
      }

      await purchase.processRefund(reason, req.user._id, refundAmount);

      res.json({
        success: true,
        message: 'Refund processed successfully',
        data: {
          transactionId: purchase.transactionId,
          refundAmount: purchase.refund.amount,
          refundReference: purchase.refund.refundReference,
          reason: purchase.refund.reason
        }
      });

    } catch (error) {
      console.error('Process refund error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error processing refund'
      });
    }
  }
);

// @desc    Get purchase statistics
// @route   GET /api/v1/purchases/statistics
// @access  Private
router.get('/stats/summary',
  protect,
  async (req, res) => {
    try {
      const { period = 30, estate } = req.query;
      const dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - parseInt(period));

      let matchStage = {
        createdAt: { $gte: dateFrom },
        status: 'Completed'
      };

      // Apply role-based filtering
      if (req.user.role === 'tenant') {
        matchStage.user = req.user._id;
      } else if (req.user.role === 'estate_admin') {
        const units = await Unit.find({
          estate: { $in: req.user.managedEstates }
        }).select('_id');
        matchStage.unit = { $in: units.map(u => u._id) };
      }

      if (estate) {
        const estateUnits = await Unit.find({ estate }).select('_id');
        matchStage.unit = { $in: estateUnits.map(u => u._id) };
      }

      const stats = await Purchase.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalPurchases: { $sum: 1 },
            totalAmount: { $sum: '$amount' },
            totalUnits: { $sum: '$unitsReceived' },
            averageAmount: { $avg: '$amount' },
            averageUnits: { $avg: '$unitsReceived' }
          }
        }
      ]);

      // Daily breakdown
      const dailyStats = await Purchase.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$createdAt'
              }
            },
            purchases: { $sum: 1 },
            amount: { $sum: '$amount' },
            units: { $sum: '$unitsReceived' }
          }
        },
        { $sort: { '_id': 1 } }
      ]);

      // Payment method breakdown
      const paymentMethods = await Purchase.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$payment.method',
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' }
          }
        }
      ]);

      res.json({
        success: true,
        data: {
          summary: stats[0] || {
            totalPurchases: 0,
            totalAmount: 0,
            totalUnits: 0,
            averageAmount: 0,
            averageUnits: 0
          },
          dailyBreakdown: dailyStats,
          paymentMethods,
          period: parseInt(period)
        }
      });

    } catch (error) {
      console.error('Get purchase statistics error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error fetching statistics'
      });
    }
  }
);

// @desc    Mark token as used
// @route   POST /api/v1/purchases/:id/use-token
// @access  Private (System use - could be called by meter integration)
router.post('/:id/use-token',
  protect,
  authorize('system_admin', 'estate_admin'),
  validateParams({ id: schemas.objectId }),
  async (req, res) => {
    try {
      const purchase = await Purchase.findById(req.params.id);

      if (!purchase) {
        return res.status(404).json({
          success: false,
          error: 'Purchase not found'
        });
      }

      if (purchase.token.isUsed) {
        return res.status(400).json({
          success: false,
          error: 'Token has already been used'
        });
      }

      if (new Date() > new Date(purchase.token.expiryDate)) {
        return res.status(400).json({
          success: false,
          error: 'Token has expired'
        });
      }

      await purchase.useToken();

      // Update meter balance
      const meter = await Meter.findById(purchase.meter);
      if (meter) {
        await meter.addElectricity(purchase.unitsReceived);
      }

      res.json({
        success: true,
        message: 'Token marked as used successfully',
        data: {
          transactionId: purchase.transactionId,
          unitsAdded: purchase.unitsReceived,
          usedAt: purchase.token.usedDate
        }
      });

    } catch (error) {
      console.error('Use token error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error marking token as used'
      });
    }
  }
);

// Helper function to process payment (would be called asynchronously)
async function processPayment(purchaseId) {
  try {
    const purchase = await Purchase.findById(purchaseId);

    if (!purchase) {
      return;
    }

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate payment success (90% success rate)
    const paymentSuccess = Math.random() > 0.1;

    if (paymentSuccess) {
      purchase.payment.status = 'Completed';
      purchase.payment.paidAt = new Date();
      purchase.status = 'Completed';

      // Add units to meter
      const meter = await Meter.findById(purchase.meter);
      if (meter) {
        await meter.addElectricity(purchase.unitsReceived);
      }

      // Create success notification
      await Notification.createPurchaseConfirmation(purchase);

      // Simulate token delivery
      setTimeout(async () => {
        purchase.delivery.deliveredAt = new Date();
        purchase.delivery.delivered = true;
        await purchase.save();
      }, 1000);

    } else {
      purchase.payment.status = 'Failed';
      purchase.payment.failureReason = 'Insufficient funds';
      purchase.status = 'Failed';
    }

    await purchase.save();

  } catch (error) {
    console.error('Payment processing error:', error);
  }
}

// Make processPayment available as a method
router.processPayment = processPayment;

module.exports = router;