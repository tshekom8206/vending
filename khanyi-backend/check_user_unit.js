const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb+srv://khanyi_user:KXl2vKnJUf3nclr8@cluster0.gqkfr.mongodb.net/khanyi_vending');

// Define schemas
const userSchema = new mongoose.Schema({}, { strict: false, collection: 'users' });
const unitSchema = new mongoose.Schema({}, { strict: false, collection: 'units' });
const meterSchema = new mongoose.Schema({}, { strict: false, collection: 'meters' });

const User = mongoose.model('User', userSchema);
const Unit = mongoose.model('Unit', unitSchema);
const Meter = mongoose.model('Meter', meterSchema);

async function checkUserUnit() {
  try {
    console.log('=== CHECKING USER ===');
    const user = await User.findOne({ email: 'flutter.test@example.com' });
    console.log('User found:', user ? { id: user._id, email: user.email } : 'NOT FOUND');

    if (user) {
      console.log('\n=== CHECKING UNITS FOR USER ===');
      const unit = await Unit.findOne({ tenant: user._id });
      console.log('Unit found:', unit ? { id: unit._id, unitNumber: unit.unitNumber, estate: unit.estate } : 'NO UNIT ASSIGNED');

      if (unit) {
        console.log('\n=== CHECKING METER FOR UNIT ===');
        const meter = await Meter.findOne({ unit: unit._id });
        console.log('Meter found:', meter ? { id: meter._id, meterNumber: meter.meterNumber } : 'NO METER ASSIGNED');
      }
    }

    console.log('\n=== SUMMARY ===');
    if (!user) {
      console.log('❌ User not found in database');
    } else if (!unit) {
      console.log('❌ User exists but NO UNIT assigned');
    } else if (!meter) {
      console.log('⚠️  User and Unit exist but NO METER assigned');
    } else {
      console.log('✅ User, Unit, and Meter all properly configured');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkUserUnit();