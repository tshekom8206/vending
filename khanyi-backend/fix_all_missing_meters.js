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

async function fixAllMissingMeters() {
  try {
    console.log('🔌 Checking all units for meters...\n');

    // Find all units
    const allUnits = await Unit.find({}).populate('estate').populate('meter');
    console.log(`📊 Total units: ${allUnits.length}\n`);

    let unitsWithoutMeters = [];
    let unitsWithMeters = [];

    for (const unit of allUnits) {
      if (!unit.meter) {
        unitsWithoutMeters.push(unit);
        console.log(`❌ Unit ${unit.unitNumber} (${unit.estate.name}): NO METER`);
      } else {
        unitsWithMeters.push(unit);
        console.log(`✅ Unit ${unit.unitNumber} (${unit.estate.name}): Has meter ${unit.meter.meterNumber}`);
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   • Units with meters: ${unitsWithMeters.length}`);
    console.log(`   • Units without meters: ${unitsWithoutMeters.length}\n`);

    // Create meters for units without them
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

    console.log(`\n🎉 Successfully processed all units!`);
    console.log(`📊 Created ${unitsWithoutMeters.length} new meters`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixAllMissingMeters();