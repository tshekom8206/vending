const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://khanyi_user:KXl2vKnJUf3nclr8@cluster0.gqkfr.mongodb.net/khanyi_vending';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Estate = require('./models/Estate');
const Unit = require('./models/Unit');

async function checkEstatesAndUnits() {
  try {
    console.log('🔍 Checking estates and their units...\n');

    // Get all estates
    const estates = await Estate.find({});
    console.log(`📊 Total estates in database: ${estates.length}\n`);

    for (const estate of estates) {
      // Count units for this estate
      const unitCount = await Unit.countDocuments({ estate: estate._id });

      console.log(`🏢 ${estate.name}`);
      console.log(`   ID: ${estate._id}`);
      console.log(`   Units: ${unitCount}`);
      console.log(`   Type: ${estate.type}`);
      console.log(`   Location: ${estate.address.city}, ${estate.address.province}`);
      console.log('   ---');
    }

    // Show estates WITH units
    console.log('\n✅ Estates with units:');
    let estatesWithUnits = 0;

    for (const estate of estates) {
      const unitCount = await Unit.countDocuments({ estate: estate._id });
      if (unitCount > 0) {
        estatesWithUnits++;
        console.log(`   • ${estate.name} (${unitCount} units)`);
      }
    }

    if (estatesWithUnits === 0) {
      console.log('   No estates have units currently.');
    }

    // Show estates WITHOUT units
    console.log('\n❌ Estates without units:');
    let estatesWithoutUnits = 0;

    for (const estate of estates) {
      const unitCount = await Unit.countDocuments({ estate: estate._id });
      if (unitCount === 0) {
        estatesWithoutUnits++;
        console.log(`   • ${estate.name}`);
      }
    }

    console.log(`\n📈 Summary:`);
    console.log(`   • Total estates: ${estates.length}`);
    console.log(`   • Estates with units: ${estatesWithUnits}`);
    console.log(`   • Estates without units: ${estatesWithoutUnits}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkEstatesAndUnits();