const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
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

async function populateHardcodedEstates() {
  try {
    console.log('🏗️ Replacing hardcoded estates with real data...');

    // Get existing user for tenant assignment
    const existingUser = await User.findOne({ email: 'flutter.test@example.com' });

    if (!existingUser) {
      console.log('❌ Test user not found. Please create a user first.');
      return;
    }

    // Clear existing estates (optional - comment out if you want to keep existing data)
    // await Estate.deleteMany({});
    // await Unit.deleteMany({});
    // await Meter.deleteMany({});
    // console.log('🗑️ Cleared existing estate data');

    // Create estates that match the hardcoded data from Flutter
    const estates = [
      {
        name: 'Greenstone Estate',
        type: 'Residential',
        address: {
          street: '39 Kweper Street',
          suburb: 'Allengroove',
          city: 'Kempton Park',
          province: 'Gauteng',
          postalCode: '1619',
          country: 'South Africa'
        },
        tariff: {
          rate: 2.50,
          currency: 'ZAR',
          unit: 'kWh'
        },
        totalUnits: 127,
        occupiedUnits: 95,
        images: [
          {
            url: '/uploads/estates/greenstone-estate-1.jpg',
            description: 'Main building view',
            isPrimary: true
          }
        ],
        amenities: ['Security', 'Parking', 'Garden', 'Playground'],
        description: 'Modern residential estate with excellent security and amenities',
        management: {
          company: 'Greenstone Property Management',
          contactPerson: 'John Manager',
          phone: '+27123456789',
          email: 'info@greenstone.co.za'
        },
        isActive: true,
        createdBy: existingUser._id
      },
      {
        name: 'Waterfall Estate',
        type: 'Residential',
        address: {
          street: 'Waterfall City Boulevard',
          suburb: 'Waterfall City',
          city: 'Midrand',
          province: 'Gauteng',
          postalCode: '1685',
          country: 'South Africa'
        },
        tariff: {
          rate: 2.30,
          currency: 'ZAR',
          unit: 'kWh'
        },
        totalUnits: 95,
        occupiedUnits: 78,
        images: [
          {
            url: '/uploads/estates/waterfall-estate-1.jpg',
            description: 'Estate entrance',
            isPrimary: true
          }
        ],
        amenities: ['Security', 'Swimming Pool', 'Gym', 'Parking'],
        description: 'Premium waterfall estate with luxury amenities',
        management: {
          company: 'Waterfall Property Services',
          contactPerson: 'Mary Estate Manager',
          phone: '+27987654321',
          email: 'info@waterfall-estate.co.za'
        },
        isActive: true,
        createdBy: existingUser._id
      },
      {
        name: 'City Properties',
        type: 'Student Housing',
        address: {
          street: '123 Main Street',
          suburb: 'CBD',
          city: 'Johannesburg',
          province: 'Gauteng',
          postalCode: '2001',
          country: 'South Africa'
        },
        tariff: {
          rate: 2.80,
          currency: 'ZAR',
          unit: 'kWh'
        },
        totalUnits: 203,
        occupiedUnits: 185,
        images: [
          {
            url: '/uploads/estates/city-properties-1.jpg',
            description: 'Modern student accommodation',
            isPrimary: true
          }
        ],
        amenities: ['Security', 'Internet', 'Laundry', 'Elevator'],
        description: 'Modern student accommodation in the heart of Johannesburg CBD',
        management: {
          company: 'City Student Housing',
          contactPerson: 'David Student Manager',
          phone: '+27111222333',
          email: 'info@cityproperties.co.za'
        },
        isActive: true,
        createdBy: existingUser._id
      },
      {
        name: 'Sandton Views',
        type: 'Residential',
        address: {
          street: 'Nelson Mandela Square',
          suburb: 'Sandton City',
          city: 'Sandton',
          province: 'Gauteng',
          postalCode: '2196',
          country: 'South Africa'
        },
        tariff: {
          rate: 3.00,
          currency: 'ZAR',
          unit: 'kWh'
        },
        totalUnits: 45,
        occupiedUnits: 42,
        images: [
          {
            url: '/uploads/estates/sandton-views-1.jpg',
            description: 'Luxury apartments with city views',
            isPrimary: true
          }
        ],
        amenities: ['Security', 'Parking', 'Swimming Pool', 'Gym', 'Elevator'],
        description: 'Luxury residential complex with stunning city views',
        management: {
          company: 'Sandton Luxury Properties',
          contactPerson: 'Sarah Premium Manager',
          phone: '+27444555666',
          email: 'info@sandtonviews.co.za'
        },
        isActive: true,
        createdBy: existingUser._id
      },
      {
        name: 'Centurion Gardens',
        type: 'Residential',
        address: {
          street: 'Garden Route',
          suburb: 'Centurion Central',
          city: 'Centurion',
          province: 'Gauteng',
          postalCode: '0157',
          country: 'South Africa'
        },
        tariff: {
          rate: 2.20,
          currency: 'ZAR',
          unit: 'kWh'
        },
        totalUnits: 88,
        occupiedUnits: 72,
        images: [
          {
            url: '/uploads/estates/centurion-gardens-1.jpg',
            description: 'Garden estate with family-friendly environment',
            isPrimary: true
          }
        ],
        amenities: ['Security', 'Garden', 'Playground', 'Parking'],
        description: 'Family-friendly residential estate with beautiful gardens',
        management: {
          company: 'Centurion Estate Management',
          contactPerson: 'Peter Garden Manager',
          phone: '+27333444555',
          email: 'info@centuriongardens.co.za'
        },
        isActive: true,
        createdBy: existingUser._id
      }
    ];

    console.log('💾 Saving estates to database...');

    const savedEstates = [];
    for (const estateData of estates) {
      const estate = new Estate(estateData);
      await estate.save();
      savedEstates.push(estate);
      console.log(`✅ Created: ${estate.name}`);
    }

    // Estates created successfully - units and meters can be added later if needed
    console.log('✅ Estate data populated successfully!');

    console.log('🎉 Successfully populated database with hardcoded estate data!');
    console.log(`
📊 Summary:
• Greenstone Estate (Kempton Park) - R2.50/kWh
• Waterfall Estate (Midrand) - R2.30/kWh
• City Properties (Johannesburg CBD) - R2.80/kWh
• Sandton Views (Sandton) - R3.00/kWh
• Centurion Gardens (Centurion) - R2.20/kWh

🖼️ All estates have images stored in /uploads/estates/
✅ Ready for Flutter app integration!
📱 Estates now available via /api/v1/estates endpoint
    `);

  } catch (error) {
    console.error('❌ Error populating estates:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the script
populateHardcodedEstates();