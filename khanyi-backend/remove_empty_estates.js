const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://khanyi_user:KXl2vKnJUf3nclr8@cluster0.gqkfr.mongodb.net/khanyi_vending';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Estate = require('./models/Estate');
const Unit = require('./models/Unit');

async function removeEmptyEstates() {
  try {
    console.log('🧹 Removing estates without units...\n');

    const estates = await Estate.find({});
    console.log(`📊 Total estates: ${estates.length}`);

    let removedCount = 0;
    let keptCount = 0;

    for (const estate of estates) {
      const unitCount = await Unit.countDocuments({ estate: estate._id });

      if (unitCount === 0) {
        console.log(`🗑️  Removing: ${estate.name} (${estate._id}) - 0 units`);
        await Estate.findByIdAndDelete(estate._id);
        removedCount++;
      } else {
        console.log(`✅ Keeping: ${estate.name} (${estate._id}) - ${unitCount} units`);
        keptCount++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   • Estates removed: ${removedCount}`);
    console.log(`   • Estates kept: ${keptCount}`);

    // Show final estates with units
    const finalEstates = await Estate.find({});
    console.log(`\n🏢 Final estates with units:`);
    for (const estate of finalEstates) {
      const unitCount = await Unit.countDocuments({ estate: estate._id });
      console.log(`   • ${estate.name} (${estate.address.city}): ${unitCount} units`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

removeEmptyEstates();