const mongoose = require('mongoose');

const estateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Estate name is required'],
    trim: true,
    maxlength: [100, 'Estate name cannot be more than 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  type: {
    type: String,
    enum: ['Residential', 'Student Housing', 'Mixed Use'],
    required: [true, 'Estate type is required']
  },

  // Location information
  address: {
    street: {
      type: String,
      required: [true, 'Street address is required']
    },
    suburb: String,
    city: {
      type: String,
      required: [true, 'City is required']
    },
    province: {
      type: String,
      required: [true, 'Province is required']
    },
    postalCode: {
      type: String,
      match: [/^\d{4}$/, 'Please add a valid postal code (4 digits)']
    },
    country: {
      type: String,
      default: 'South Africa'
    }
  },

  // GPS coordinates for mobile app location services
  coordinates: {
    latitude: {
      type: Number,
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      min: -180,
      max: 180
    }
  },

  // Electricity tariff information
  tariff: {
    rate: {
      type: Number,
      required: [true, 'Tariff rate is required'],
      min: [0, 'Tariff rate cannot be negative']
    },
    currency: {
      type: String,
      default: 'ZAR'
    },
    unit: {
      type: String,
      default: 'kWh'
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },

  // Estate management information
  management: {
    company: String,
    contactPerson: String,
    phone: String,
    email: String,
    emergencyContact: String
  },

  // Estate amenities and features
  amenities: [{
    type: String,
    enum: [
      'Security', 'Parking', 'Swimming Pool', 'Gym', 'Garden',
      'Playground', 'Laundry', 'Internet', 'Generator Backup',
      'Water Backup', 'Elevator', 'Wheelchair Access'
    ]
  }],

  // Operating hours for office/management
  operatingHours: {
    weekdays: {
      open: String,
      close: String
    },
    weekends: {
      open: String,
      close: String
    }
  },

  // Estate status and metadata
  isActive: {
    type: Boolean,
    default: true
  },
  totalUnits: {
    type: Number,
    default: 0
  },
  occupiedUnits: {
    type: Number,
    default: 0
  },

  // Images
  images: [{
    url: String,
    description: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],

  // System information
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },

  // Estate administrators
  administrators: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    permissions: [{
      type: String,
      enum: ['manage_units', 'manage_tenants', 'view_reports', 'manage_incidents']
    }],
    assignedDate: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full address
estateSchema.virtual('fullAddress').get(function() {
  const { street, suburb, city, province, postalCode } = this.address;
  let address = street;
  if (suburb) address += `, ${suburb}`;
  address += `, ${city}`;
  if (province) address += `, ${province}`;
  if (postalCode) address += ` ${postalCode}`;
  return address;
});

// Virtual for occupancy rate
estateSchema.virtual('occupancyRate').get(function() {
  if (this.totalUnits === 0) return 0;
  return Math.round((this.occupiedUnits / this.totalUnits) * 100);
});

// Virtual for formatted tariff
estateSchema.virtual('formattedTariff').get(function() {
  if (!this.tariff || !this.tariff.rate || !this.tariff.currency || !this.tariff.unit) {
    return 'N/A';
  }
  return `${this.tariff.currency}${this.tariff.rate.toFixed(2)}/${this.tariff.unit}`;
});

// Indexes for better performance
estateSchema.index({ 'address.city': 1 });
estateSchema.index({ 'address.province': 1 });
estateSchema.index({ type: 1 });
estateSchema.index({ isActive: 1 });
estateSchema.index({ name: 'text', description: 'text' });

// Pre-save middleware to ensure only one primary image
estateSchema.pre('save', function(next) {
  if (this.images && this.images.length > 0) {
    let primaryCount = 0;
    this.images.forEach(image => {
      if (image.isPrimary) primaryCount++;
    });

    // If no primary image is set, make the first one primary
    if (primaryCount === 0) {
      this.images[0].isPrimary = true;
    }

    // If multiple primary images, keep only the first one
    if (primaryCount > 1) {
      let firstPrimaryFound = false;
      this.images.forEach(image => {
        if (image.isPrimary && firstPrimaryFound) {
          image.isPrimary = false;
        } else if (image.isPrimary) {
          firstPrimaryFound = true;
        }
      });
    }
  }
  next();
});

module.exports = mongoose.model('Estate', estateSchema);