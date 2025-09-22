const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/khanyi_vending', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define schemas (simplified versions)
const estateSchema = new mongoose.Schema({
  name: String,
  type: String,
  address: {
    street: String,
    suburb: String,
    city: String,
    province: String,
    postalCode: String,
    country: String
  },
  tariff: {
    rate: Number,
    currency: String,
    unit: String
  },
  totalUnits: Number,
  occupiedUnits: Number,
  isActive: Boolean,
  createdAt: { type: Date, default: Date.now }
});

const unitSchema = new mongoose.Schema({
  unitNumber: String,
  estate: { type: mongoose.Schema.Types.ObjectId, ref: 'Estate' },
  specifications: {
    bedrooms: Number,
    bathrooms: Number,
    area: {
      size: Number,
      unit: String
    },
    floor: Number
  },
  charges: {
    monthlyRent: Number,
    deposit: Number
  },
  status: String,
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: Boolean,
  createdAt: { type: Date, default: Date.now }
});

const meterSchema = new mongoose.Schema({
  meterNumber: String,
  unit: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit' },
  estate: { type: mongoose.Schema.Types.ObjectId, ref: 'Estate' },
  type: String,
  manufacturer: String,
  serialNumber: String,
  installationDate: Date,
  lastReadingDate: Date,
  currentBalance: Number,
  dailyAverageConsumption: Number,
  isActive: Boolean,
  createdAt: { type: Date, default: Date.now }
});

const Estate = mongoose.model('Estate', estateSchema);
const Unit = mongoose.model('Unit', unitSchema);
const Meter = mongoose.model('Meter', meterSchema);

async function addEstatesWithMeters() {
  try {
    console.log('🏗️ Adding new estates with units and meters...');

    // Get existing user for tenant assignment
    const User = mongoose.model('User');
    const existingUser = await User.findOne({ email: 'flutter.test@example.com' });

    if (!existingUser) {
      console.log('❌ Test user not found');
      return;
    }

    // Estate 1: Sunset Gardens
    const sunsetGardens = new Estate({
      name: 'Sunset Gardens Estate',
      type: 'Residential',
      address: {
        street: '45 Sunset Avenue',
        suburb: 'Greenside',
        city: 'Johannesburg',
        province: 'Gauteng',
        postalCode: '2193',
        country: 'South Africa'
      },
      tariff: {
        rate: 3.15,
        currency: 'ZAR',
        unit: 'kWh'
      },
      totalUnits: 24,
      occupiedUnits: 18,
      isActive: true
    });

    // Estate 2: Ocean View Apartments
    const oceanView = new Estate({
      name: 'Ocean View Apartments',
      type: 'Residential',
      address: {
        street: '12 Marine Drive',
        suburb: 'Sea Point',
        city: 'Cape Town',
        province: 'Western Cape',
        postalCode: '8005',
        country: 'South Africa'
      },
      tariff: {
        rate: 2.95,
        currency: 'ZAR',
        unit: 'kWh'
      },
      totalUnits: 36,
      occupiedUnits: 30,
      isActive: true
    });

    // Estate 3: Riverview Complex
    const riverview = new Estate({
      name: 'Riverview Complex',
      type: 'Residential',
      address: {
        street: '88 River Road',
        suburb: 'Morningside',
        city: 'Durban',
        province: 'KwaZulu-Natal',
        postalCode: '4001',
        country: 'South Africa'
      },
      tariff: {
        rate: 2.75,
        currency: 'ZAR',
        unit: 'kWh'
      },
      totalUnits: 18,
      occupiedUnits: 14,
      isActive: true
    });

    // Save estates
    await sunsetGardens.save();
    await oceanView.save();
    await riverview.save();

    console.log('✅ Estates saved successfully');

    // Create units for each estate
    const estates = [
      { estate: sunsetGardens, unitCount: 6, prefix: 'SG' },
      { estate: oceanView, unitCount: 8, prefix: 'OV' },
      { estate: riverview, unitCount: 6, prefix: 'RV' }
    ];

    for (const estateInfo of estates) {
      console.log(`🏠 Creating units for ${estateInfo.estate.name}...`);

      for (let i = 1; i <= estateInfo.unitCount; i++) {
        const unitNumber = `${estateInfo.prefix}${i.toString().padStart(3, '0')}`;

        const unit = new Unit({
          unitNumber: unitNumber,
          estate: estateInfo.estate._id,
          specifications: {
            bedrooms: Math.floor(Math.random() * 3) + 1, // 1-3 bedrooms
            bathrooms: Math.floor(Math.random() * 2) + 1, // 1-2 bathrooms
            area: {
              size: 50 + Math.floor(Math.random() * 100), // 50-150 m²
              unit: 'm²'
            },
            floor: Math.floor(Math.random() * 5) + 1 // 1-5 floors
          },
          charges: {
            monthlyRent: 6000 + Math.floor(Math.random() * 8000), // R6000-R14000
            deposit: 12000 + Math.floor(Math.random() * 16000) // R12000-R28000
          },
          status: Math.random() > 0.3 ? 'Occupied' : 'Available', // 70% occupied
          tenant: Math.random() > 0.3 ? existingUser._id : null,
          isActive: true
        });

        await unit.save();

        // Create meter for each unit
        const meterNumber = `M${estateInfo.prefix}${i.toString().padStart(3, '0')}`;

        const meter = new Meter({
          meterNumber: meterNumber,
          unit: unit._id,
          estate: estateInfo.estate._id,
          type: 'Prepaid',
          manufacturer: ['Landis+Gyr', 'Itron', 'Elster'][Math.floor(Math.random() * 3)],
          serialNumber: `SN${Date.now()}${i}`,
          installationDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000), // Random date in past year
          lastReadingDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date in past month
          currentBalance: Math.floor(Math.random() * 500) + 100, // R100-R600
          dailyAverageConsumption: Math.floor(Math.random() * 20) + 5, // 5-25 kWh per day
          isActive: true
        });

        await meter.save();
      }
    }

    console.log('✅ All estates, units, and meters created successfully!');
    console.log(`
📊 Summary:
• Sunset Gardens Estate (Johannesburg) - 6 units
• Ocean View Apartments (Cape Town) - 8 units
• Riverview Complex (Durban) - 6 units
• Total: 20 new units with meters added

🔌 Each unit has:
• Unique unit number (SG001, OV001, RV001, etc.)
• Associated prepaid meter
• Random specifications (bedrooms, bathrooms, area)
• Realistic pricing and occupancy status

💡 You can now test purchasing electricity for different properties!
    `);

  } catch (error) {
    console.error('❌ Error adding estates:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the script
addEstatesWithMeters();