const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB Atlas using the same connection string from check_user_unit.js
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://khanyi_user:KXl2vKnJUf3nclr8@cluster0.gqkfr.mongodb.net/khanyi_vending';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Import existing models
const Estate = require('./models/Estate');
const Unit = require('./models/Unit');
const Meter = require('./models/Meter');
const User = require('./models/User');

async function addEstatesWithMeters() {
  try {
    console.log('🏗️ Adding new estates with units and meters...');

    // Get existing user for tenant assignment
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
      isActive: true,
      createdBy: existingUser._id
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
      isActive: true,
      createdBy: existingUser._id
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
      isActive: true,
      createdBy: existingUser._id
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
        const meterNumber = `M${estateInfo.prefix}${i.toString().padStart(3, '0')}`;

        // Create meter first
        const manufacturers = ['Landis+Gyr', 'Itron', 'Elster'];
        const models = ['E650', 'A3000', 'AS230'];
        const randomManufacturer = manufacturers[Math.floor(Math.random() * manufacturers.length)];
        const randomModel = models[Math.floor(Math.random() * models.length)];

        // Create unit first without meter reference
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
          isActive: true,
          createdBy: existingUser._id
        });

        // Create temporary meter to get its ID
        const tempMeter = new Meter({
          meterNumber: meterNumber,
          serialNumber: `SN${Date.now()}${i}`,
          unit: unit._id, // We'll set this after unit is saved
          specifications: {
            manufacturer: randomManufacturer,
            model: randomModel,
            type: 'Prepaid',
            maxLoad: {
              value: 20 + Math.floor(Math.random() * 40), // 20-60A
              unit: 'A'
            },
            voltage: {
              value: 220,
              unit: 'V'
            },
            phases: 1
          },
          installation: {
            date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000), // Random date in past year
            technician: 'Installation Team',
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
          createdBy: existingUser._id
        });

        // Set meter reference in unit before saving
        unit.meter = tempMeter._id;

        // Save both
        await unit.save();
        await tempMeter.save();
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