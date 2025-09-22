const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://khanyi_user:KXl2vKnJUf3nclr8@cluster0.gqkfr.mongodb.net/khanyi_vending';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Estate = require('./models/Estate');
const Unit = require('./models/Unit');

async function cleanupDuplicateEstates() {
  try {
    console.log('🧹 Starting estate cleanup...\n');

    // Get all estates grouped by name
    const estates = await Estate.find({});
    console.log(`📊 Total estates found: ${estates.length}`);

    // Group estates by name
    const estateGroups = {};
    for (const estate of estates) {
      if (!estateGroups[estate.name]) {
        estateGroups[estate.name] = [];
      }
      estateGroups[estate.name].push(estate);
    }

    console.log(`📊 Unique estate names: ${Object.keys(estateGroups).length}\n`);

    // For each estate name, keep only the one with units, remove the rest
    for (const [estateName, groupedEstates] of Object.entries(estateGroups)) {
      if (groupedEstates.length <= 1) {
        console.log(`✅ ${estateName}: Only 1 estate, no duplicates to remove`);
        continue;
      }

      console.log(`🔍 ${estateName}: Found ${groupedEstates.length} duplicates`);

      // Find which estates have units
      const estatesWithUnits = [];
      const estatesWithoutUnits = [];

      for (const estate of groupedEstates) {
        const unitCount = await Unit.countDocuments({ estate: estate._id });
        if (unitCount > 0) {
          estatesWithUnits.push({ estate, unitCount });
          console.log(`   • ${estate._id}: ${unitCount} units - KEEP`);
        } else {
          estatesWithoutUnits.push(estate);
          console.log(`   • ${estate._id}: 0 units - REMOVE`);
        }
      }

      // Remove estates without units
      for (const estate of estatesWithoutUnits) {
        console.log(`🗑️  Removing estate: ${estate._id} (${estate.name})`);
        await Estate.findByIdAndDelete(estate._id);
      }

      // If multiple estates have units, keep the one with the most units
      if (estatesWithUnits.length > 1) {
        // Sort by unit count descending
        estatesWithUnits.sort((a, b) => b.unitCount - a.unitCount);

        // Keep the first one (highest unit count), remove the rest
        const toKeep = estatesWithUnits[0];
        const toRemove = estatesWithUnits.slice(1);

        console.log(`🎯 Multiple estates with units for ${estateName}:`);
        console.log(`   • KEEPING: ${toKeep.estate._id} (${toKeep.unitCount} units)`);

        for (const { estate, unitCount } of toRemove) {
          console.log(`   • REMOVING: ${estate._id} (${unitCount} units)`);

          // First move units to the estate we're keeping
          await Unit.updateMany(
            { estate: estate._id },
            { estate: toKeep.estate._id }
          );
          console.log(`   • Moved ${unitCount} units to ${toKeep.estate._id}`);

          // Then delete the estate
          await Estate.findByIdAndDelete(estate._id);
        }
      }

      console.log('');
    }

    // Final count
    const finalEstates = await Estate.find({});
    console.log(`\n✅ Cleanup completed!`);
    console.log(`📊 Final estate count: ${finalEstates.length}`);

    // Show final summary
    console.log('\n📋 Remaining estates:');
    for (const estate of finalEstates) {
      const unitCount = await Unit.countDocuments({ estate: estate._id });
      console.log(`   • ${estate.name} (${estate.address.city}): ${unitCount} units`);
    }

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    mongoose.connection.close();
  }
}

cleanupDuplicateEstates();