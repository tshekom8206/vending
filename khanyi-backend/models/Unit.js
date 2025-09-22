const mongoose = require('mongoose');

const unitSchema = new mongoose.Schema({
  unitNumber: {
    type: String,
    required: [true, 'Unit number is required'],
    trim: true,
    maxlength: [20, 'Unit number cannot be more than 20 characters']
  },

  estate: {
    type: mongoose.Schema.ObjectId,
    ref: 'Estate',
    required: [true, 'Estate reference is required']
  },

  // Unit specifications
  specifications: {
    bedrooms: {
      type: Number,
      min: [0, 'Bedrooms cannot be negative'],
      max: [10, 'Bedrooms cannot exceed 10']
    },
    bathrooms: {
      type: Number,
      min: [0, 'Bathrooms cannot be negative'],
      max: [10, 'Bathrooms cannot exceed 10']
    },
    area: {
      size: Number, // in square meters
      unit: {
        type: String,
        default: 'm²'
      }
    },
    floor: Number,
    hasBalcony: {
      type: Boolean,
      default: false
    },
    hasGarden: {
      type: Boolean,
      default: false
    },
    parking: {
      spaces: {
        type: Number,
        default: 0
      },
      covered: {
        type: Boolean,
        default: false
      }
    }
  },

  // Current tenant information
  tenant: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },

  // Lease information
  lease: {
    startDate: Date,
    endDate: Date,
    monthlyRent: Number,
    deposit: Number,
    status: {
      type: String,
      enum: ['Active', 'Expired', 'Terminated', 'Pending'],
      default: 'Pending'
    }
  },

  // Unit status
  status: {
    type: String,
    enum: ['Available', 'Occupied', 'Maintenance', 'Reserved'],
    default: 'Available'
  },

  // Rent and charges
  charges: {
    monthlyRent: {
      type: Number,
      min: [0, 'Monthly rent cannot be negative']
    },
    deposit: Number,
    additionalCharges: [{
      description: String,
      amount: Number,
      frequency: {
        type: String,
        enum: ['Monthly', 'Quarterly', 'Annually', 'Once-off']
      }
    }]
  },

  // Electricity meter information
  meter: {
    type: mongoose.Schema.ObjectId,
    ref: 'Meter',
    required: false,
    default: undefined
    // Note: Meter will be created after unit creation due to circular dependency
  },

  // Unit images
  images: [{
    url: String,
    description: String,
    room: String, // bedroom1, bathroom, kitchen, etc.
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],

  // Maintenance and inspection history
  maintenance: [{
    date: Date,
    type: {
      type: String,
      enum: ['Routine', 'Emergency', 'Requested', 'Preventive']
    },
    description: String,
    cost: Number,
    status: {
      type: String,
      enum: ['Scheduled', 'In Progress', 'Completed', 'Cancelled']
    },
    technician: String
  }],

  // Unit amenities specific to this unit
  amenities: [{
    type: String,
    enum: [
      'Air Conditioning', 'Heating', 'Built-in Wardrobes',
      'Dishwasher', 'Washing Machine Connection', 'Study Nook',
      'Fireplace', 'Solar Geyser', 'Fiber Internet Ready'
    ]
  }],

  // Inspection records
  inspections: [{
    date: Date,
    type: {
      type: String,
      enum: ['Move-in', 'Move-out', 'Routine', 'Complaint']
    },
    inspector: String,
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    notes: String,
    photos: [String],
    issues: [{
      description: String,
      severity: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical']
      },
      resolved: {
        type: Boolean,
        default: false
      }
    }]
  }],

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

// Virtual for full unit identifier (Estate Name + Unit Number)
unitSchema.virtual('fullIdentifier').get(function() {
  return `${this.estate?.name || 'Unknown Estate'} - ${this.unitNumber}`;
});

// Virtual for lease status
unitSchema.virtual('leaseStatus').get(function() {
  if (!this.lease || !this.lease.endDate) return 'No Lease';

  const now = new Date();
  const endDate = new Date(this.lease.endDate);
  const daysUntilExpiry = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));

  if (daysUntilExpiry < 0) return 'Expired';
  if (daysUntilExpiry <= 30) return 'Expiring Soon';
  return 'Active';
});

// Virtual for unit description
unitSchema.virtual('description').get(function() {
  const { bedrooms, bathrooms, area } = this.specifications;
  let desc = '';

  if (bedrooms) desc += `${bedrooms} bed`;
  if (bathrooms) desc += `${desc ? ', ' : ''}${bathrooms} bath`;
  if (area && area.size) desc += `${desc ? ', ' : ''}${area.size}${area.unit}`;

  return desc || 'Unit';
});

// Compound indexes for better performance
unitSchema.index({ estate: 1, unitNumber: 1 }, { unique: true });
unitSchema.index({ estate: 1, status: 1 });
unitSchema.index({ tenant: 1 });
unitSchema.index({ 'lease.status': 1 });
unitSchema.index({ isActive: 1 });

// Pre-save middleware to update estate unit counts
unitSchema.post('save', async function() {
  const Estate = mongoose.model('Estate');
  const totalUnits = await mongoose.model('Unit').countDocuments({ estate: this.estate, isActive: true });
  const occupiedUnits = await mongoose.model('Unit').countDocuments({
    estate: this.estate,
    status: 'Occupied',
    isActive: true
  });

  await Estate.findByIdAndUpdate(this.estate, {
    totalUnits,
    occupiedUnits
  });
});

// Pre-remove middleware to update estate unit counts
unitSchema.post('deleteOne', { document: true }, async function() {
  const Estate = mongoose.model('Estate');
  const totalUnits = await mongoose.model('Unit').countDocuments({ estate: this.estate, isActive: true });
  const occupiedUnits = await mongoose.model('Unit').countDocuments({
    estate: this.estate,
    status: 'Occupied',
    isActive: true
  });

  await Estate.findByIdAndUpdate(this.estate, {
    totalUnits,
    occupiedUnits
  });
});

// Method to check if unit is available for lease
unitSchema.methods.isAvailable = function() {
  return this.status === 'Available' && this.isActive;
};

// Method to calculate remaining lease days
unitSchema.methods.getRemainingLeaseDays = function() {
  if (!this.lease || !this.lease.endDate) return null;

  const now = new Date();
  const endDate = new Date(this.lease.endDate);
  const diffTime = endDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays > 0 ? diffDays : 0;
};

module.exports = mongoose.model('Unit', unitSchema);