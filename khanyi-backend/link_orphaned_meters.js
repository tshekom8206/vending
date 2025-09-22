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

async function linkOrphanedMeters() {
  try {
    console.log('🔗 Linking orphaned meters to units...\n');

    // Find units without meters
    const unitsWithoutMeters = await Unit.find({ meter: null }).populate('estate');
    console.log(`📊 Units without meters: ${unitsWithoutMeters.length}`);

    for (const unit of unitsWithoutMeters) {
      console.log(`🔍 Looking for meter for unit: ${unit.unitNumber} (${unit.estate.name})`);

      // Generate expected meter number
      const expectedMeterNumber = `M${unit.unitNumber}`;

      // Look for existing meter with this number
      const existingMeter = await Meter.findOne({ meterNumber: expectedMeterNumber });

      if (existingMeter) {
        console.log(`🔗 Found existing meter ${expectedMeterNumber}, linking to unit ${unit.unitNumber}`);

        // Update the meter to reference this unit
        existingMeter.unit = unit._id;
        await existingMeter.save();

        // Update the unit to reference this meter
        unit.meter = existingMeter._id;
        await unit.save();

        console.log(`✅ Successfully linked meter ${expectedMeterNumber} to unit ${unit.unitNumber}`);
      } else {
        console.log(`❌ No existing meter found for ${expectedMeterNumber}`);

        // Create a new meter with a unique number
        const uniqueMeterNumber = `M${unit.unitNumber}_${Date.now()}`;

        const newMeter = new Meter({
          meterNumber: uniqueMeterNumber,
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
            amount: Math.floor(Math.random() * 500) + 100,
            units: 'kWh',
            lastUpdated: new Date()
          },
          status: 'Active',
          isActive: true,
          createdBy: unit.createdBy
        });

        await newMeter.save();

        // Update unit to reference the new meter
        unit.meter = newMeter._id;
        await unit.save();

        console.log(`✅ Created new meter ${uniqueMeterNumber} for unit ${unit.unitNumber}`);
      }
    }

    console.log(`\n🎉 Finished processing all units!`);

    // Final verification
    const stillWithoutMeters = await Unit.find({ meter: null });
    console.log(`📊 Units still without meters: ${stillWithoutMeters.length}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

linkOrphanedMeters();