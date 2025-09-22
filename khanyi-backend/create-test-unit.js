const mongoose = require('mongoose');
require('dotenv').config();

const unitSchema = new mongoose.Schema({
  unitNumber: { type: String, required: true },
  estate: { type: mongoose.Schema.Types.ObjectId, ref: 'Estate', required: true },
  specifications: {
    bedrooms: Number,
    bathrooms: Number,
    area: {
      size: Number,
      unit: { type: String, default: 'm²' }
    },
    floor: Number
  },
  charges: {
    monthlyRent: Number,
    deposit: Number
  },
  status: { type: String, enum: ['Available', 'Occupied', 'Maintenance'], default: 'Available' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const meterSchema = new mongoose.Schema({
  meterNumber: { type: String, required: true, unique: true },
  serialNumber: { type: String, required: true },
  unit: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit' },
  specifications: {
    manufacturer: String,
    model: String,
    type: { type: String, enum: ['Prepaid', 'Postpaid', 'Smart'], default: 'Prepaid' },
    maxLoad: { value: Number, unit: { type: String, default: 'A' } },
    voltage: { value: { type: Number, default: 220 }, unit: { type: String, default: 'V' } },
    phases: { type: Number, enum: [1, 3], default: 1 }
  },
  installation: {
    date: Date,
    technician: String,
    location: String
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

async function createTestData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const Unit = mongoose.model('Unit', unitSchema);
    const Meter = mongoose.model('Meter', meterSchema);

    // Create unit without meter reference first
    const unit = new Unit({
      unitNumber: 'A101',
      estate: '68c667630d67efa69ce761e1',
      specifications: {
        bedrooms: 2,
        bathrooms: 1,
        area: { size: 75, unit: 'm²' },
        floor: 1
      },
      charges: {
        monthlyRent: 8500,
        deposit: 17000
      },
      status: 'Available',
      createdBy: '68c667630d67efa69ce761da'
    });

    await unit.save();
    console.log('Created unit:', unit._id.toString());

    // Create meter with unit reference
    const meter = new Meter({
      meterNumber: 'M001A101',
      serialNumber: 'SN123456789',
      unit: unit._id,
      specifications: {
        manufacturer: 'Landis+Gyr',
        model: 'E650',
        type: 'Prepaid',
        maxLoad: { value: 60, unit: 'A' },
        voltage: { value: 220, unit: 'V' },
        phases: 1
      },
      installation: {
        date: new Date(),
        technician: 'Test Technician',
        location: 'Main DB Board'
      },
      createdBy: '68c667630d67efa69ce761da'
    });

    await meter.save();
    console.log('Created meter:', meter._id.toString());

    // Update unit with meter reference
    unit.meter = meter._id;
    await unit.save();

    console.log('\n=== TEST DATA CREATED ===');
    console.log('Unit ID for Flutter app:', unit._id.toString());
    console.log('Meter ID for Flutter app:', meter._id.toString());
    console.log('Unit Number:', unit.unitNumber);
    console.log('Meter Number:', meter.meterNumber);

    process.exit(0);
  } catch (error) {
    console.error('Error creating test data:', error);
    process.exit(1);
  }
}

createTestData();