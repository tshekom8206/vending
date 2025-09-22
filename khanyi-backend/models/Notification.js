const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // Target user(s)
  recipient: {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    // For broadcast notifications
    criteria: {
      role: [String], // ['tenant', 'estate_admin']
      estate: {
        type: mongoose.Schema.ObjectId,
        ref: 'Estate'
      },
      units: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Unit'
      }],
      balanceBelow: Number, // Target users with balance below this amount
      lastLoginBefore: Date // Target inactive users
    }
  },

  // Notification content
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },

  message: {
    type: String,
    required: [true, 'Notification message is required'],
    maxlength: [500, 'Message cannot exceed 500 characters']
  },

  // Notification type and category
  type: {
    type: String,
    enum: [
      'low_balance',
      'critical_balance',
      'purchase_success',
      'purchase_failed',
      'token_delivery',
      'meter_reading',
      'system_maintenance',
      'payment_reminder',
      'incident_update',
      'promotional',
      'announcement',
      'welcome',
      'security_alert'
    ],
    required: [true, 'Notification type is required']
  },

  category: {
    type: String,
    enum: ['System', 'Billing', 'Support', 'Marketing', 'Security', 'General'],
    required: [true, 'Notification category is required']
  },

  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },

  // Related entities
  relatedEntities: {
    unit: {
      type: mongoose.Schema.ObjectId,
      ref: 'Unit'
    },
    meter: {
      type: mongoose.Schema.ObjectId,
      ref: 'Meter'
    },
    purchase: {
      type: mongoose.Schema.ObjectId,
      ref: 'Purchase'
    },
    incident: {
      type: mongoose.Schema.ObjectId,
      ref: 'Incident'
    },
    estate: {
      type: mongoose.Schema.ObjectId,
      ref: 'Estate'
    }
  },

  // Delivery channels
  channels: {
    inApp: {
      enabled: {
        type: Boolean,
        default: true
      },
      delivered: {
        type: Boolean,
        default: false
      },
      deliveredAt: Date,
      read: {
        type: Boolean,
        default: false
      },
      readAt: Date
    },
    email: {
      enabled: {
        type: Boolean,
        default: false
      },
      delivered: {
        type: Boolean,
        default: false
      },
      deliveredAt: Date,
      opened: {
        type: Boolean,
        default: false
      },
      openedAt: Date,
      subject: String
    },
    sms: {
      enabled: {
        type: Boolean,
        default: false
      },
      delivered: {
        type: Boolean,
        default: false
      },
      deliveredAt: Date,
      phoneNumber: String,
      messageId: String // SMS gateway message ID
    },
    push: {
      enabled: {
        type: Boolean,
        default: true
      },
      delivered: {
        type: Boolean,
        default: false
      },
      deliveredAt: Date,
      clicked: {
        type: Boolean,
        default: false
      },
      clickedAt: Date,
      deviceTokens: [String]
    }
  },

  // Action buttons (for interactive notifications)
  actions: [{
    id: String,
    label: String,
    type: {
      type: String,
      enum: ['URL', 'Deep Link', 'API Call', 'Dismiss']
    },
    value: String, // URL, deep link, or API endpoint
    style: {
      type: String,
      enum: ['Default', 'Primary', 'Destructive'],
      default: 'Default'
    }
  }],

  // Scheduling
  schedule: {
    sendAt: {
      type: Date,
      default: Date.now
    },
    timezone: {
      type: String,
      default: 'Africa/Johannesburg'
    },
    recurring: {
      enabled: {
        type: Boolean,
        default: false
      },
      frequency: {
        type: String,
        enum: ['Daily', 'Weekly', 'Monthly', 'Custom']
      },
      interval: Number, // For custom frequency
      endDate: Date,
      lastSent: Date,
      nextSend: Date
    }
  },

  // Status and tracking
  status: {
    type: String,
    enum: ['Draft', 'Scheduled', 'Sending', 'Sent', 'Failed', 'Cancelled'],
    default: 'Draft'
  },

  // Delivery statistics
  stats: {
    totalRecipients: {
      type: Number,
      default: 0
    },
    deliveryAttempts: {
      type: Number,
      default: 0
    },
    successfulDeliveries: {
      type: Number,
      default: 0
    },
    failedDeliveries: {
      type: Number,
      default: 0
    },
    readCount: {
      type: Number,
      default: 0
    },
    clickCount: {
      type: Number,
      default: 0
    },
    lastDeliveryAttempt: Date
  },

  // Template and personalization
  template: {
    id: String,
    variables: mongoose.Schema.Types.Mixed // Dynamic content variables
  },

  // Metadata
  metadata: {
    source: {
      type: String,
      enum: ['System', 'Admin', 'API', 'Automated'],
      default: 'System'
    },
    tags: [String],
    campaignId: String,
    batchId: String
  },

  // Creator information
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },

  // Expiry and cleanup
  expiresAt: Date,

  // A/B testing
  variant: {
    id: String,
    name: String,
    percentage: Number
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for overall delivery status
notificationSchema.virtual('deliveryStatus').get(function() {
  const channels = this.channels;
  let totalEnabled = 0;
  let totalDelivered = 0;

  Object.values(channels).forEach(channel => {
    if (channel.enabled) {
      totalEnabled++;
      if (channel.delivered) totalDelivered++;
    }
  });

  if (totalEnabled === 0) return 'No Channels';
  if (totalDelivered === 0) return 'Pending';
  if (totalDelivered === totalEnabled) return 'Delivered';
  return 'Partial';
});

// Virtual for engagement rate
notificationSchema.virtual('engagementRate').get(function() {
  if (this.stats.successfulDeliveries === 0) return 0;
  return ((this.stats.readCount + this.stats.clickCount) / this.stats.successfulDeliveries * 100).toFixed(2);
});

// Indexes
notificationSchema.index({ 'recipient.user': 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ status: 1 });
notificationSchema.index({ 'schedule.sendAt': 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ priority: -1, createdAt: -1 });

// Compound indexes
notificationSchema.index({ 'recipient.user': 1, 'channels.inApp.read': 1, createdAt: -1 });
notificationSchema.index({ status: 1, 'schedule.sendAt': 1 });

// TTL index for automatic cleanup of expired notifications
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Pre-save middleware to set expiry date
notificationSchema.pre('save', function(next) {
  if (this.isNew && !this.expiresAt) {
    // Set expiry based on notification type
    const expiryDays = {
      'promotional': 30,
      'announcement': 60,
      'low_balance': 7,
      'critical_balance': 3,
      'system_maintenance': 1,
      'default': 30
    };

    const days = expiryDays[this.type] || expiryDays.default;
    this.expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  }
  next();
});

// Method to mark as read
notificationSchema.methods.markAsRead = function(userId) {
  if (this.recipient.user.toString() === userId.toString()) {
    this.channels.inApp.read = true;
    this.channels.inApp.readAt = new Date();
    this.stats.readCount += 1;
  }
  return this.save();
};

// Method to track action click
notificationSchema.methods.trackClick = function(actionId, userId) {
  if (this.recipient.user.toString() === userId.toString()) {
    this.channels.push.clicked = true;
    this.channels.push.clickedAt = new Date();
    this.stats.clickCount += 1;

    // Log the specific action clicked (could be enhanced with detailed tracking)
    this.metadata.tags.push(`clicked_${actionId}`);
  }
  return this.save();
};

// Method to attempt delivery
notificationSchema.methods.attemptDelivery = async function() {
  this.stats.deliveryAttempts += 1;
  this.stats.lastDeliveryAttempt = new Date();

  let deliverySuccess = false;

  // Simulate delivery attempts (in real implementation, integrate with actual services)
  if (this.channels.inApp.enabled) {
    this.channels.inApp.delivered = true;
    this.channels.inApp.deliveredAt = new Date();
    deliverySuccess = true;
  }

  if (this.channels.email.enabled) {
    // Email delivery logic would go here
    this.channels.email.delivered = true;
    this.channels.email.deliveredAt = new Date();
    deliverySuccess = true;
  }

  if (this.channels.sms.enabled) {
    // SMS delivery logic would go here
    this.channels.sms.delivered = true;
    this.channels.sms.deliveredAt = new Date();
    deliverySuccess = true;
  }

  if (this.channels.push.enabled) {
    // Push notification delivery logic would go here
    this.channels.push.delivered = true;
    this.channels.push.deliveredAt = new Date();
    deliverySuccess = true;
  }

  if (deliverySuccess) {
    this.stats.successfulDeliveries += 1;
    this.status = 'Sent';
  } else {
    this.stats.failedDeliveries += 1;
    this.status = 'Failed';
  }

  return this.save();
};

// Static method to get user notifications
notificationSchema.statics.getUserNotifications = function(userId, options = {}) {
  const {
    limit = 20,
    offset = 0,
    unreadOnly = false,
    type = null,
    category = null
  } = options;

  const query = {
    'recipient.user': userId,
    status: 'Sent'
  };

  if (unreadOnly) {
    query['channels.inApp.read'] = false;
  }

  if (type) {
    query.type = type;
  }

  if (category) {
    query.category = category;
  }

  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(offset)
    .populate('relatedEntities.unit', 'unitNumber')
    .populate('relatedEntities.estate', 'name');
};

// Static method to create balance alert
notificationSchema.statics.createBalanceAlert = async function(meter, type = 'low_balance') {
  const Unit = mongoose.model('Unit');
  const unit = await Unit.findById(meter.unit).populate('tenant estate');

  if (!unit || !unit.tenant) return null;

  const titles = {
    'low_balance': 'Low Electricity Balance',
    'critical_balance': 'Critical: Electricity Balance Very Low'
  };

  const messages = {
    'low_balance': `Your electricity balance is running low. You have ${meter.currentBalance.amount} kWh remaining.`,
    'critical_balance': `Your electricity balance is critically low at ${meter.currentBalance.amount} kWh. Purchase electricity urgently to avoid disconnection.`
  };

  const notification = new this({
    recipient: {
      user: unit.tenant._id
    },
    title: titles[type],
    message: messages[type],
    type,
    category: 'Billing',
    priority: type === 'critical_balance' ? 'Urgent' : 'High',
    relatedEntities: {
      unit: unit._id,
      meter: meter._id,
      estate: unit.estate._id
    },
    channels: {
      inApp: { enabled: true },
      sms: { enabled: true, phoneNumber: unit.tenant.phone },
      push: { enabled: true }
    },
    actions: [{
      id: 'buy_now',
      label: 'Buy Electricity',
      type: 'Deep Link',
      value: `/purchase?unit=${unit._id}&meter=${meter._id}`,
      style: 'Primary'
    }],
    createdBy: null, // System generated
    metadata: {
      source: 'System',
      tags: ['auto-generated', 'balance-alert']
    }
  });

  await notification.save();
  return notification.attemptDelivery();
};

// Static method to create purchase confirmation
notificationSchema.statics.createPurchaseConfirmation = async function(purchase) {
  const Unit = mongoose.model('Unit');
  const unit = await Unit.findById(purchase.unit).populate('tenant');

  const notification = new this({
    recipient: {
      user: unit.tenant._id
    },
    title: 'Electricity Purchase Successful',
    message: `Your purchase of ${purchase.unitsReceived} kWh for R${purchase.amount} has been processed successfully.`,
    type: 'purchase_success',
    category: 'Billing',
    priority: 'Medium',
    relatedEntities: {
      unit: unit._id,
      purchase: purchase._id,
      meter: purchase.meter
    },
    channels: {
      inApp: { enabled: true },
      sms: { enabled: true, phoneNumber: unit.tenant.phone }
    },
    actions: [{
      id: 'view_token',
      label: 'View Token',
      type: 'Deep Link',
      value: `/purchases/${purchase._id}`,
      style: 'Primary'
    }],
    metadata: {
      source: 'System',
      tags: ['auto-generated', 'purchase-confirmation']
    }
  });

  await notification.save();
  return notification.attemptDelivery();
};

module.exports = mongoose.model('Notification', notificationSchema);