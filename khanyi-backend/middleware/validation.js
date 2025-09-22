const Joi = require('joi');

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: errors
      });
    }

    next();
  };
};

// Query parameter validation
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        error: 'Query Validation Error',
        details: errors
      });
    }

    req.query = value;
    next();
  };
};

// Parameter validation
const validateParams = (schemaObj) => {
  return (req, res, next) => {
    try {
      // Convert the schema object to a Joi schema
      const schema = Joi.object(schemaObj);
      const { error } = schema.validate(req.params);

      if (error) {
        return res.status(400).json({
          success: false,
          error: 'Parameter Validation Error',
          details: error.details[0].message
        });
      }

      next();
    } catch (validationError) {
      console.error('Parameter validation middleware error:', validationError);
      next(); // Skip validation if there's an error
    }
  };
};

// Common validation schemas
const schemas = {
  // MongoDB ObjectId validation
  objectId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),

  // South African phone number
  phoneNumber: Joi.string().regex(/^\+27[0-9]{9}$/).required().messages({
    'string.pattern.base': 'Phone number must be a valid South African number (+27xxxxxxxxx)'
  }),

  // South African ID number
  idNumber: Joi.string().regex(/^\d{13}$/).required().messages({
    'string.pattern.base': 'ID number must be 13 digits'
  }),

  // Email validation
  email: Joi.string().email().lowercase().required(),

  // Password validation
  password: Joi.string().min(6).max(128).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'string.max': 'Password cannot exceed 128 characters'
  }),

  // Pagination
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sort: Joi.string().default('-createdAt')
  }),

  // User registration
  register: Joi.object({
    firstName: Joi.string().trim().max(50).required(),
    lastName: Joi.string().trim().max(50).required(),
    email: Joi.string().email().lowercase().required(),
    phone: Joi.string().regex(/^\+27[0-9]{9}$/).required(),
    idNumber: Joi.string().regex(/^\d{13}$/).required(),
    password: Joi.string().min(6).max(128).required(),
    address: Joi.object({
      street: Joi.string().trim().max(200),
      city: Joi.string().trim().max(100),
      province: Joi.string().trim().max(100),
      postalCode: Joi.string().regex(/^\d{4}$/)
    })
  }),

  // User login
  login: Joi.object({
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().required()
  }),

  // Estate creation
  createEstate: Joi.object({
    name: Joi.string().trim().max(100).required(),
    description: Joi.string().trim().max(500),
    type: Joi.string().valid('Residential', 'Student Housing', 'Mixed Use').required(),
    address: Joi.object({
      street: Joi.string().trim().required(),
      suburb: Joi.string().trim(),
      city: Joi.string().trim().required(),
      province: Joi.string().trim().required(),
      postalCode: Joi.string().regex(/^\d{4}$/)
    }).required(),
    coordinates: Joi.object({
      latitude: Joi.number().min(-90).max(90),
      longitude: Joi.number().min(-180).max(180)
    }),
    tariff: Joi.object({
      rate: Joi.number().min(0).required(),
      currency: Joi.string().default('ZAR'),
      unit: Joi.string().default('kWh')
    }).required(),
    management: Joi.object({
      company: Joi.string().trim(),
      contactPerson: Joi.string().trim(),
      phone: Joi.string(),
      email: Joi.string().email()
    }),
    amenities: Joi.array().items(
      Joi.string().valid(
        'Security', 'Parking', 'Swimming Pool', 'Gym', 'Garden',
        'Playground', 'Laundry', 'Internet', 'Generator Backup',
        'Water Backup', 'Elevator', 'Wheelchair Access'
      )
    )
  }),

  // Unit creation
  createUnit: Joi.object({
    unitNumber: Joi.string().trim().max(20).required(),
    estate: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
    specifications: Joi.object({
      bedrooms: Joi.number().integer().min(0).max(10),
      bathrooms: Joi.number().integer().min(0).max(10),
      area: Joi.object({
        size: Joi.number().min(0),
        unit: Joi.string().default('m²')
      }),
      floor: Joi.number().integer(),
      hasBalcony: Joi.boolean().default(false),
      hasGarden: Joi.boolean().default(false),
      parking: Joi.object({
        spaces: Joi.number().integer().min(0).default(0),
        covered: Joi.boolean().default(false)
      })
    }),
    charges: Joi.object({
      monthlyRent: Joi.number().min(0),
      deposit: Joi.number().min(0)
    })
  }),

  // Meter creation
  createMeter: Joi.object({
    meterNumber: Joi.string().trim().max(20).regex(/^[A-Z0-9]+$/).required(),
    serialNumber: Joi.string().trim().max(50).required(),
    unit: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
    specifications: Joi.object({
      manufacturer: Joi.string().trim().required(),
      model: Joi.string().trim().required(),
      type: Joi.string().valid('Prepaid', 'Postpaid', 'Smart').default('Prepaid'),
      maxLoad: Joi.object({
        value: Joi.number().min(0),
        unit: Joi.string().default('A')
      }),
      voltage: Joi.object({
        value: Joi.number().default(220),
        unit: Joi.string().default('V')
      }),
      phases: Joi.number().valid(1, 3).default(1)
    }).required(),
    installation: Joi.object({
      date: Joi.date().required(),
      technician: Joi.string().trim(),
      location: Joi.string().trim()
    }).required()
  }),

  // Purchase electricity
  purchaseElectricity: Joi.object({
    unit: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
    amount: Joi.number().min(1).max(10000).required(),
    payment: Joi.object({
      method: Joi.string().valid('Card', 'EFT', 'Mobile Money', 'Cash', 'Wallet').required(),
      reference: Joi.string().trim()
    }).required(),
    delivery: Joi.object({
      method: Joi.string().valid('SMS', 'Email', 'App Push', 'USSD').default('SMS'),
      destination: Joi.string().required()
    })
  }),

  // Create incident
  createIncident: Joi.object({
    category: Joi.string().valid(
      'Meter Issue', 'Token Problem', 'Payment Issue', 'App/System Error',
      'Billing Inquiry', 'Connection Problem', 'General Support',
      'Emergency', 'Maintenance Request', 'Complaint'
    ).required(),
    subcategory: Joi.string(),
    priority: Joi.string().valid('Low', 'Medium', 'High', 'Critical', 'Emergency').default('Medium'),
    subject: Joi.string().trim().max(200).required(),
    description: Joi.string().trim().max(2000).required(),
    unit: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
    meter: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
    purchase: Joi.string().regex(/^[0-9a-fA-F]{24}$/)
  }),

  // Update incident
  updateIncident: Joi.object({
    status: Joi.string().valid(
      'Open', 'In Progress', 'Pending Customer', 'Pending Internal',
      'Escalated', 'Resolved', 'Closed', 'Cancelled'
    ),
    priority: Joi.string().valid('Low', 'Medium', 'High', 'Critical', 'Emergency'),
    assignedTo: Joi.object({
      user: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
      team: Joi.string().valid('Support', 'Technical', 'Billing', 'Management')
    }),
    resolution: Joi.object({
      summary: Joi.string().trim(),
      details: Joi.string().trim()
    })
  }),

  // Meter reading
  meterReading: Joi.object({
    reading: Joi.number().min(0).required(),
    readBy: Joi.string().valid('Manual', 'Automatic', 'Tenant', 'System').default('Manual'),
    notes: Joi.string().trim().max(500)
  }),

  // Search and filter
  searchEstates: Joi.object({
    q: Joi.string().trim().max(100),
    city: Joi.string().trim(),
    province: Joi.string().trim(),
    type: Joi.string().valid('Residential', 'Student Housing', 'Mixed Use'),
    minTariff: Joi.number().min(0),
    maxTariff: Joi.number().min(0),
    amenities: Joi.array().items(Joi.string()),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(50).default(20)
  }),

  // Date range validation
  dateRange: Joi.object({
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso().min(Joi.ref('startDate'))
  }),

  // Update user profile
  updateProfile: Joi.object({
    firstName: Joi.string().trim().max(50),
    lastName: Joi.string().trim().max(50),
    phone: Joi.string().regex(/^\+27[0-9]{9}$/),
    address: Joi.object({
      street: Joi.string().trim().max(200),
      city: Joi.string().trim().max(100),
      province: Joi.string().trim().max(100),
      postalCode: Joi.string().regex(/^\d{4}$/)
    }),
    emergencyContact: Joi.object({
      name: Joi.string().trim().max(100),
      phone: Joi.string().regex(/^\+27[0-9]{9}$/),
      relationship: Joi.string().trim().max(50)
    }),
    notifications: Joi.object({
      email: Joi.boolean(),
      sms: Joi.boolean(),
      push: Joi.boolean(),
      lowBalance: Joi.boolean(),
      systemUpdates: Joi.boolean()
    })
  }),

  // Change password
  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).max(128).required(),
    confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
  })
};

// Custom validation for file uploads
const validateFileUpload = (allowedTypes = [], maxSize = 5 * 1024 * 1024) => {
  return (req, res, next) => {
    if (!req.file && !req.files) {
      return next();
    }

    const files = req.files || [req.file];

    for (const file of files) {
      if (allowedTypes.length > 0 && !allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          success: false,
          error: `File type ${file.mimetype} is not allowed. Allowed types: ${allowedTypes.join(', ')}`
        });
      }

      if (file.size > maxSize) {
        return res.status(400).json({
          success: false,
          error: `File size exceeds maximum limit of ${maxSize / (1024 * 1024)}MB`
        });
      }
    }

    next();
  };
};

module.exports = {
  validate,
  validateQuery,
  validateParams,
  validateFileUpload,
  schemas
};