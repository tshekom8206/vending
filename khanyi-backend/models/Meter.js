const mongoose = require('mongoose');

const meterSchema = new mongoose.Schema({
  meterNumber: {
    type: String,
    required: [true, 'Meter number is required'],
    unique: true,
    trim: true,
    maxlength: [20, 'Meter number cannot be more than 20 characters'],
    match: [/^[A-Z0-9]+$/, 'Meter number must contain only uppercase letters and numbers']
  },

  serialNumber: {
    type: String,
    required: [true, 'Serial number is required'],
    unique: true,
    trim: true,
    maxlength: [50, 'Serial number cannot be more than 50 characters']
  },

  unit: {
    type: mongoose.Schema.ObjectId,
    ref: 'Unit',
    required: [true, 'Unit reference is required']
  },

  // Meter specifications
  specifications: {
    manufacturer: {
      type: String,
      required: [true, 'Manufacturer is required']
    },
    model: {
      type: String,
      required: [true, 'Model is required']
    },
    type: {
      type: String,
      enum: ['Prepaid', 'Postpaid', 'Smart'],
      default: 'Prepaid'
    },
    maxLoad: {
      value: Number, // in Amperes
      unit: {
        type: String,
        default: 'A'
      }
    },
    voltage: {
      value: {
        type: Number,
        default: 220
      },
      unit: {
        type: String,
        default: 'V'
      }
    },
    phases: {
      type: Number,
      enum: [1, 3],
      default: 1
    }
  },

  // Installation information
  installation: {
    date: {
      type: Date,
      required: [true, 'Installation date is required']
    },
    technician: String,
    location: String, // Physical location within the unit
    accessInstructions: String // Instructions for meter readers
  },

  // Current meter status
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Faulty', 'Maintenance', 'Disconnected'],
    default: 'Active'
  },

  // Current balance and consumption
  currentBalance: {
    amount: {
      type: Number,
      default: 0,
      min: [0, 'Balance cannot be negative']
    },
    units: {
      type: String,
      default: 'kWh'
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },

  // Meter readings history
  readings: [{
    date: {
      type: Date,
      default: Date.now
    },
    reading: {
      type: Number,
      required: true
    },
    consumption: Number, // kWh consumed since last reading
    readBy: {
      type: String,
      enum: ['Manual', 'Automatic', 'Tenant', 'System'],
      default: 'Manual'
    },
    notes: String
  }],

  // Alerts and thresholds
  alerts: {
    lowBalanceThreshold: {
      type: Number,
      default: 10 // kWh
    },
    criticalBalanceThreshold: {
      type: Number,
      default: 2 // kWh
    },
    highConsumptionThreshold: {
      type: Number,
      default: 100 // kWh per day
    },
    emailAlerts: {
      type: Boolean,
      default: true
    },
    smsAlerts: {
      type: Boolean,
      default: true
    }
  },

  // Maintenance history
  maintenance: [{
    date: Date,
    type: {
      type: String,
      enum: ['Routine', 'Emergency', 'Calibration', 'Replacement']
    },
    description: String,
    technician: String,
    cost: Number,
    nextServiceDate: Date,
    status: {
      type: String,
      enum: ['Scheduled', 'Completed', 'Cancelled']
    }
  }],

  // Calibration information
  calibration: {
    lastDate: Date,
    nextDue: Date,
    certificateNumber: String,
    accuracy: Number, // percentage
    notes: String
  },

  // Tariff information (can override estate tariff)
  customTariff: {
    rate: Number,
    currency: {
      type: String,
      default: 'ZAR'
    },
    unit: {
      type: String,
      default: 'kWh'
    },
    effectiveDate: Date,
    reason: String // Reason for custom tariff
  },

  // Communication settings (for smart meters)
  communication: {
    type: {
      type: String,
      enum: ['None', 'GSM', 'WiFi', 'Ethernet', 'PLC'],
      default: 'None'
    },
    connectionStatus: {
      type: String,
      enum: ['Connected', 'Disconnected', 'Error'],
      default: 'Disconnected'
    },
    lastCommunication: Date,
    ipAddress: String,
    signalStrength: Number // for wireless connections
  },

  // System information
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for current consumption rate (daily average)
meterSchema.virtual('dailyAverageConsumption').get(function() {
  if (!this.readings || this.readings.length < 2) return 0;

  const recent30Days = this.readings.filter(reading => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return reading.date >= thirtyDaysAgo;
  });

  if (recent30Days.length < 2) return 0;

  const totalConsumption = recent30Days.reduce((sum, reading) => sum + (reading.consumption || 0), 0);
  return totalConsumption / recent30Days.length;
});

// Virtual for balance status
meterSchema.virtual('balanceStatus').get(function() {
  const balance = this.currentBalance.amount;
  const { criticalBalanceThreshold, lowBalanceThreshold } = this.alerts;

  if (balance <= criticalBalanceThreshold) return 'Critical';
  if (balance <= lowBalanceThreshold) return 'Low';
  return 'Normal';
});

// Virtual for days remaining at current consumption rate
meterSchema.virtual('estimatedDaysRemaining').get(function() {
  const dailyConsumption = this.dailyAverageConsumption;
  if (dailyConsumption <= 0) return null;

  return Math.floor(this.currentBalance.amount / dailyConsumption);
});

// Indexes for performance
meterSchema.index({ meterNumber: 1 });
meterSchema.index({ serialNumber: 1 });
meterSchema.index({ unit: 1 });
meterSchema.index({ status: 1 });
meterSchema.index({ 'currentBalance.amount': 1 });
meterSchema.index({ 'readings.date': -1 });

// Method to add a new reading
meterSchema.methods.addReading = function(reading, readBy = 'Manual', notes = '') {
  if (!this.readings) this.readings = [];
  const lastReading = this.readings.length > 0 ? this.readings[this.readings.length - 1] : null;
  const consumption = lastReading ? Math.max(0, reading - lastReading.reading) : 0;

  this.readings.push({
    reading,
    consumption,
    readBy,
    notes
  });

  // Update current balance based on consumption
  if (consumption > 0) {
    this.currentBalance.amount = Math.max(0, this.currentBalance.amount - consumption);
    this.currentBalance.lastUpdated = new Date();
  }

  return this.save();
};

// Method to add electricity units (after purchase)
meterSchema.methods.addElectricity = function(units) {
  this.currentBalance.amount += units;
  this.currentBalance.lastUpdated = new Date();
  return this.save();
};

// Method to check if meter needs maintenance
meterSchema.methods.needsMaintenance = function() {
  const lastMaintenance = this.maintenance.length > 0
    ? this.maintenance[this.maintenance.length - 1]
    : null;

  if (!lastMaintenance) return true;

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  return lastMaintenance.date < sixMonthsAgo;
};

// Method to get monthly consumption
meterSchema.methods.getMonthlyConsumption = function(year, month) {
  if (!this.readings) return 0;

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const monthlyReadings = this.readings.filter(reading =>
    reading.date >= startDate && reading.date <= endDate
  );

  return monthlyReadings.reduce((total, reading) => total + (reading.consumption || 0), 0);
};

module.exports = mongoose.model('Meter', meterSchema);