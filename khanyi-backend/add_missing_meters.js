const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://khanyi_user:KXl2vKnJUf3nclr8@cluster0.gqkfr.mongodb.net/khanyi_vending';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Estate = require('./models/Estate');
const Unit = require('./models/Unit');
const Meter = require('./models/Meter');

async function addMissingMeters() {
  try {
    console.log('🔌 Adding missing meters for units...\n');

    // Find all units that don't have meters
    const unitsWithoutMeters = await Unit.find({ meter: null }).populate('estate');
    console.log(`📊 Found ${unitsWithoutMeters.length} units without meters\n`);

    for (const unit of unitsWithoutMeters) {
      console.log(`🔧 Creating meter for unit: ${unit.unitNumber} (${unit.estate.name})`);

      // Generate meter number based on unit number
      const meterNumber = `M${unit.unitNumber}`;

      // Create meter
      const meter = new Meter({
        meterNumber: meterNumber,
        serialNumber: `SN${Date.now()}${Math.floor(Math.random() * 1000)}`,
        unit: unit._id,
        specifications: {
          manufacturer: 'Landis+Gyr',
          model: 'E650',
          type: 'Prepaid',
          maxLoad: {
            value: 60,
            unit: 'A'
          },
          voltage: {
            value: 220,
            unit: 'V'
          },
          phases: 1
        },
        installation: {
          date: new Date(),
          technician: 'Auto Installation',
          location: 'Main electrical panel',
          accessInstructions: 'Located in main electrical panel'
        },
        currentBalance: {
          amount: Math.floor(Math.random() * 500) + 100, // R100-R600
          units: 'kWh',
          lastUpdated: new Date()
        },
        status: 'Active',
        isActive: true,
        createdBy: unit.createdBy
      });

      // Save meter
      await meter.save();

      // Update unit to reference the meter
      unit.meter = meter._id;
      await unit.save();

      console.log(`✅ Created meter ${meterNumber} for unit ${unit.unitNumber}`);
    }

    console.log(`\n🎉 Successfully created ${unitsWithoutMeters.length} meters!`);

    // Verify all units now have meters
    const unitsStillWithoutMeters = await Unit.find({ meter: null });
    console.log(`📊 Units still without meters: ${unitsStillWithoutMeters.length}`);

  } catch (error) {
    console.error('❌ Error creating meters:', error);
  } finally {
    mongoose.connection.close();
  }
}

addMissingMeters();