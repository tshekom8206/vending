const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
  incidentNumber: {
    type: String,
    unique: true,
    default: () => `INC${Date.now().toString().slice(-8)}${Math.random().toString(36).substr(2, 3).toUpperCase()}`
  },

  // Reporter information
  reporter: {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Reporter user reference is required']
    },
    name: String, // Cache for display
    phone: String, // Cache for display
    email: String // Cache for display
  },

  // Incident classification
  category: {
    type: String,
    enum: [
      'Meter Issue',
      'Token Problem',
      'Payment Issue',
      'App/System Error',
      'Billing Inquiry',
      'Connection Problem',
      'General Support',
      'Emergency',
      'Maintenance Request',
      'Complaint'
    ],
    required: [true, 'Incident category is required']
  },

  subcategory: {
    type: String,
    enum: [
      // Meter Issues
      'Meter not working', 'Meter reading incorrect', 'Meter damaged',
      // Token Problems
      'Token not received', 'Token rejected by meter', 'Invalid token',
      // Payment Issues
      'Payment failed', 'Double charged', 'Refund request',
      // App/System Errors
      'App crashes', 'Login issues', 'Feature not working',
      // Billing
      'Incorrect billing', 'Tariff inquiry', 'Usage dispute',
      // Connection
      'No electricity', 'Partial power', 'Power fluctuation',
      // Other
      'Other'
    ]
  },

  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical', 'Emergency'],
    default: 'Medium'
  },

  severity: {
    type: String,
    enum: ['Minor', 'Major', 'Critical'],
    default: 'Minor'
  },

  // Related entities
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

  // Incident details
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    maxlength: [200, 'Subject cannot exceed 200 characters']
  },

  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },

  // Status and workflow
  status: {
    type: String,
    enum: [
      'Open',
      'In Progress',
      'Pending Customer',
      'Pending Internal',
      'Escalated',
      'Resolved',
      'Closed',
      'Cancelled'
    ],
    default: 'Open'
  },

  resolution: {
    summary: String,
    details: String,
    resolvedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    resolvedAt: Date,
    resolutionTime: Number, // minutes from creation to resolution
    customerSatisfaction: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      feedback: String,
      ratedAt: Date
    }
  },

  // Assignment and handling
  assignedTo: {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    team: {
      type: String,
      enum: ['Support', 'Technical', 'Billing', 'Management']
    },
    assignedAt: Date,
    assignedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }
  },

  // SLA tracking
  sla: {
    responseTime: Number, // minutes
    resolutionTime: Number, // minutes
    responseDeadline: Date,
    resolutionDeadline: Date,
    isBreached: {
      type: Boolean,
      default: false
    }
  },

  // Communication log
  communications: [{
    type: {
      type: String,
      enum: ['Note', 'Email', 'SMS', 'Phone Call', 'WhatsApp']
    },
    direction: {
      type: String,
      enum: ['Inbound', 'Outbound', 'Internal']
    },
    content: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    isPublic: {
      type: Boolean,
      default: true
    }
  }],

  // File attachments
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    url: String,
    uploadedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Tags for organization
  tags: [String],

  // Escalation information
  escalation: {
    level: {
      type: Number,
      default: 0
    },
    escalatedTo: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    escalatedAt: Date,
    escalatedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    reason: String
  },

  // System tracking
  metadata: {
    source: {
      type: String,
      enum: ['App', 'Web', 'Phone', 'Email', 'WhatsApp', 'Walk-in'],
      default: 'App'
    },
    channel: String,
    userAgent: String,
    ipAddress: String,
    deviceInfo: String
  },

  // Auto-close settings
  autoClose: {
    enabled: {
      type: Boolean,
      default: true
    },
    days: {
      type: Number,
      default: 7
    },
    warningDays: {
      type: Number,
      default: 5
    }
  },

  // Related incidents
  relatedIncidents: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Incident'
  }],

  // Follow-up information
  followUp: {
    required: {
      type: Boolean,
      default: false
    },
    scheduledDate: Date,
    completedDate: Date,
    notes: String
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for age in hours
incidentSchema.virtual('ageInHours').get(function() {
  const now = new Date();
  const diffMs = now - this.createdAt;
  return Math.floor(diffMs / (1000 * 60 * 60));
});

// Virtual for time to resolution
incidentSchema.virtual('timeToResolution').get(function() {
  if (!this.resolution.resolvedAt) return null;

  const diffMs = this.resolution.resolvedAt - this.createdAt;
  return Math.floor(diffMs / (1000 * 60)); // minutes
});

// Virtual for SLA status
incidentSchema.virtual('slaStatus').get(function() {
  const now = new Date();

  if (this.sla.isBreached) return 'Breached';

  if (this.sla.resolutionDeadline && now > this.sla.resolutionDeadline) {
    return 'Overdue';
  }

  if (this.sla.responseDeadline && now > this.sla.responseDeadline && this.status === 'Open') {
    return 'Response Overdue';
  }

  return 'On Track';
});

// Indexes
incidentSchema.index({ incidentNumber: 1 });
incidentSchema.index({ 'reporter.user': 1 });
incidentSchema.index({ status: 1 });
incidentSchema.index({ priority: 1 });
incidentSchema.index({ category: 1 });
incidentSchema.index({ 'assignedTo.user': 1 });
incidentSchema.index({ createdAt: -1 });
incidentSchema.index({ unit: 1 });
incidentSchema.index({ meter: 1 });

// Compound indexes
incidentSchema.index({ status: 1, priority: -1, createdAt: -1 });
incidentSchema.index({ 'assignedTo.user': 1, status: 1 });

// Pre-save middleware to set SLA deadlines
incidentSchema.pre('save', function(next) {
  if (this.isNew && !this.sla.responseDeadline) {
    const now = new Date();

    // Set response times based on priority
    const responseMinutes = {
      'Emergency': 15,
      'Critical': 60,
      'High': 240, // 4 hours
      'Medium': 480, // 8 hours
      'Low': 1440 // 24 hours
    };

    const resolutionHours = {
      'Emergency': 2,
      'Critical': 8,
      'High': 24,
      'Medium': 72,
      'Low': 168 // 1 week
    };

    this.sla.responseTime = responseMinutes[this.priority];
    this.sla.resolutionTime = resolutionHours[this.priority] * 60; // convert to minutes

    this.sla.responseDeadline = new Date(now.getTime() + (this.sla.responseTime * 60 * 1000));
    this.sla.resolutionDeadline = new Date(now.getTime() + (this.sla.resolutionTime * 60 * 1000));
  }

  next();
});

// Method to add communication
incidentSchema.methods.addCommunication = function(type, content, user, direction = 'Internal', isPublic = true) {
  this.communications.push({
    type,
    content,
    user,
    direction,
    isPublic
  });

  return this.save();
};

// Method to escalate incident
incidentSchema.methods.escalate = function(escalatedTo, reason, escalatedBy) {
  this.escalation.level += 1;
  this.escalation.escalatedTo = escalatedTo;
  this.escalation.escalatedAt = new Date();
  this.escalation.escalatedBy = escalatedBy;
  this.escalation.reason = reason;

  this.priority = this.priority === 'Low' ? 'Medium' :
                  this.priority === 'Medium' ? 'High' :
                  this.priority === 'High' ? 'Critical' : 'Emergency';

  this.addCommunication('Note', `Incident escalated to level ${this.escalation.level}. Reason: ${reason}`, escalatedBy);

  return this.save();
};

// Method to resolve incident
incidentSchema.methods.resolve = function(summary, details, resolvedBy) {
  this.status = 'Resolved';
  this.resolution.summary = summary;
  this.resolution.details = details;
  this.resolution.resolvedBy = resolvedBy;
  this.resolution.resolvedAt = new Date();

  const diffMs = this.resolution.resolvedAt - this.createdAt;
  this.resolution.resolutionTime = Math.floor(diffMs / (1000 * 60)); // minutes

  this.addCommunication('Note', `Incident resolved: ${summary}`, resolvedBy);

  return this.save();
};

// Method to close incident
incidentSchema.methods.close = function(closedBy, reason = 'Resolved') {
  this.status = 'Closed';
  this.addCommunication('Note', `Incident closed. Reason: ${reason}`, closedBy);

  return this.save();
};

// Method to assign incident
incidentSchema.methods.assign = function(assignedTo, team, assignedBy) {
  this.assignedTo.user = assignedTo;
  this.assignedTo.team = team;
  this.assignedTo.assignedAt = new Date();
  this.assignedTo.assignedBy = assignedBy;

  if (this.status === 'Open') {
    this.status = 'In Progress';
  }

  this.addCommunication('Note', `Incident assigned to ${team} team`, assignedBy);

  return this.save();
};

// Static method to get dashboard stats
incidentSchema.statics.getDashboardStats = function(userId = null, isAdmin = false) {
  const matchCondition = {};

  if (!isAdmin && userId) {
    matchCondition['reporter.user'] = mongoose.Types.ObjectId(userId);
  }

  return this.aggregate([
    { $match: matchCondition },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: null,
        statusCounts: {
          $push: {
            status: '$_id',
            count: '$count'
          }
        },
        total: { $sum: '$count' }
      }
    }
  ]);
};

module.exports = mongoose.model('Incident', incidentSchema);