const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Estate = require('../models/Estate');
const Unit = require('../models/Unit');
const Meter = require('../models/Meter');
const Purchase = require('../models/Purchase');
const Incident = require('../models/Incident');
const Notification = require('../models/Notification');

const initDatabase = async () => {
  try {
    console.log('🚀 Starting database initialization...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');

    // Clear existing data (optional - comment out for production)
    console.log('🧹 Clearing existing collections...');
    await User.deleteMany({});
    await Estate.deleteMany({});
    await Unit.deleteMany({});
    await Meter.deleteMany({});
    await Purchase.deleteMany({});
    await Incident.deleteMany({});
    await Notification.deleteMany({});
    console.log('✅ Collections cleared');

    // Create System Admin User
    console.log('👤 Creating system admin user...');
    const adminPassword = await bcrypt.hash('admin123', 12);
    const systemAdmin = await User.create({
      firstName: 'System',
      lastName: 'Administrator',
      email: 'admin@khanyisolutions.com',
      phone: '+27123456789',
      password: adminPassword,
      role: 'system_admin',
      idNumber: '8001010001088',
      address: {
        street: '123 Admin Street',
        city: 'Johannesburg',
        province: 'Gauteng',
        postalCode: '2196',
        country: 'South Africa'
      },
      isActive: true,
      isVerified: true
    });
    console.log(`✅ System admin created: ${systemAdmin.email}`);

    // Create Sample Estate
    console.log('🏢 Creating sample estate...');
    const estate = await Estate.create({
      name: 'Waterfall Gardens Estate',
      description: 'Premium residential estate in the heart of Waterfall City',
      type: 'Residential',
      address: {
        street: '1 Waterfall Drive',
        suburb: 'Waterfall City',
        city: 'Midrand',
        province: 'Gauteng',
        postalCode: '1685',
        country: 'South Africa'
      },
      coordinates: {
        latitude: -25.9842,
        longitude: 28.1291
      },
      tariff: {
        rate: 2.85, // R2.85 per kWh
        currency: 'ZAR',
        unit: 'kWh'
      },
      management: {
        company: 'Waterfall Gardens Management',
        contactPerson: 'Estate Manager',
        phone: '+27119876543',
        email: 'info@waterfallgardens.co.za'
      },
      amenities: [
        'Swimming Pool',
        'Gym',
        'Playground',
        'Security',
        'Garden',
        'Parking'
      ],
      totalUnits: 150,
      createdBy: systemAdmin._id,
      isActive: true
    });
    console.log(`✅ Estate created: ${estate.name}`);

    // Create Estate Admin
    console.log('👤 Creating estate admin user...');
    const estateAdminPassword = await bcrypt.hash('estate123', 12);
    const estateAdmin = await User.create({
      firstName: 'Estate',
      lastName: 'Manager',
      email: 'manager@waterfallgardens.co.za',
      phone: '+27119876543',
      password: estateAdminPassword,
      role: 'estate_admin',
      idNumber: '7505150002083',
      address: {
        street: '1 Waterfall Drive',
        city: 'Midrand',
        province: 'Gauteng',
        postalCode: '1685',
        country: 'South Africa'
      },
      isActive: true,
      isVerified: true
    });
    console.log(`✅ Estate admin created: ${estateAdmin.email}`);

    // Add admin to estate
    await Estate.findByIdAndUpdate(estate._id, {
      $push: {
        administrators: {
          user: estateAdmin._id,
          permissions: ['manage_units', 'manage_tenants', 'view_reports', 'manage_incidents']
        }
      }
    });

    // Create Sample Units (without meters first)
    console.log('🏠 Creating sample units...');
    const units = [];
    const unitTypes = [
      { name: 'Studio', bedrooms: 0, bathrooms: 1 },
      { name: '1 Bedroom', bedrooms: 1, bathrooms: 1 },
      { name: '2 Bedroom', bedrooms: 2, bathrooms: 2 },
      { name: '3 Bedroom', bedrooms: 3, bathrooms: 2 }
    ];
    const blocks = ['A', 'B', 'C', 'D'];

    // First, create a placeholder unit to use for temp meter
    const placeholderUnit = await Unit.create({
      unitNumber: 'TEMP000',
      estate: estate._id,
      specifications: {
        bedrooms: 1,
        bathrooms: 1,
        area: { size: 50, unit: 'm²' },
        floor: 1
      },
      charges: {
        monthlyRent: 1000,
        deposit: 2000
      },
      status: 'Available',
      createdBy: systemAdmin._id,
      isActive: false
    });

    // Create a placeholder meter
    const placeholderMeter = await Meter.create({
      meterNumber: 'PLACEHOLDER000',
      serialNumber: 'SN000000000',
      unit: placeholderUnit._id,
      specifications: {
        manufacturer: 'Placeholder',
        model: 'TEMP',
        type: 'Prepaid'
      },
      installation: {
        date: new Date(),
        technician: 'System'
      },
      balance: {
        current: 0,
        currency: 'ZAR'
      },
      tariff: {
        rate: estate.tariff.rate,
        currency: 'ZAR'
      },
      createdBy: systemAdmin._id,
      isActive: false
    });

    for (let block of blocks) {
      for (let floor = 1; floor <= 10; floor++) {
        for (let unit = 1; unit <= 4; unit++) {
          const unitNumber = `${block}${floor.toString().padStart(2, '0')}${unit}`;
          const unitType = unitTypes[Math.floor(Math.random() * unitTypes.length)];
          const area = Math.floor(Math.random() * 100) + 50; // 50-150 sqm
          const monthlyRent = Math.floor(Math.random() * 5000) + 5000; // R5000-R10000

          units.push({
            unitNumber,
            estate: estate._id,
            specifications: {
              bedrooms: unitType.bedrooms,
              bathrooms: unitType.bathrooms,
              area: { size: area, unit: 'm²' },
              floor: floor
            },
            charges: {
              monthlyRent: monthlyRent,
              deposit: monthlyRent * 2
            },
            status: Math.random() > 0.3 ? 'Occupied' : 'Available', // 70% occupied
            meter: placeholderMeter._id, // Temporary assignment
            createdBy: systemAdmin._id,
            isActive: true
          });
        }
      }
    }

    const createdUnits = await Unit.insertMany(units);
    console.log(`✅ Created ${createdUnits.length} units`);

    // Now create real meters for each unit and update unit references
    console.log('⚡ Creating real meters for units...');
    for (let i = 0; i < createdUnits.length; i++) {
      const unit = createdUnits[i];
      const manufacturers = ['Hexing', 'Landis+Gyr', 'Itron'];
      const manufacturer = manufacturers[Math.floor(Math.random() * manufacturers.length)];
      const serialNum = `SN${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`;

      const realMeter = await Meter.create({
        meterNumber: `WG${String(unit.unitNumber).padStart(6, '0')}`,
        serialNumber: serialNum,
        unit: unit._id,
        specifications: {
          manufacturer: manufacturer,
          model: `Model-${Math.floor(Math.random() * 1000)}`,
          type: 'Prepaid',
          maxLoad: { value: 60, unit: 'A' },
          voltage: { value: 230, unit: 'V' }
        },
        installation: {
          date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000), // Random date in past year
          technician: 'Installation Team'
        },
        balance: {
          current: Math.floor(Math.random() * 500), // R0-R500
          currency: 'ZAR'
        },
        tariff: {
          rate: estate.tariff.rate,
          currency: 'ZAR'
        },
        createdBy: systemAdmin._id,
        isActive: true
      });

      // Update unit with real meter reference
      await Unit.findByIdAndUpdate(unit._id, { meter: realMeter._id });
      createdUnits[i].meter = realMeter._id;
    }
    console.log(`✅ Created meters for ${createdUnits.length} units`);

    // Clean up placeholder meter and unit
    await Meter.findByIdAndDelete(placeholderMeter._id);
    await Unit.findByIdAndDelete(placeholderUnit._id);

    // Create Sample Tenants
    console.log('👥 Creating sample tenants...');
    const occupiedUnits = createdUnits.filter(unit => unit.status === 'Occupied');

    for (let i = 0; i < Math.min(50, occupiedUnits.length); i++) {
      const unit = occupiedUnits[i];

      // Create tenant
      const tenantPassword = await bcrypt.hash('tenant123', 12);
      const tenant = await User.create({
        firstName: `Tenant${i + 1}`,
        lastName: `Surname${i + 1}`,
        email: `tenant${i + 1}@example.com`,
        phone: `+2711${String(Math.floor(Math.random() * 9000000) + 1000000)}`,
        password: tenantPassword,
        role: 'tenant',
        idNumber: `${Math.floor(Math.random() * 90) + 10}${String(Math.floor(Math.random() * 9000000000) + 1000000000)}`,
        address: {
          street: `Unit ${unit.unitNumber}, 1 Waterfall Drive`,
          city: 'Midrand',
          province: 'Gauteng',
          postalCode: '1685',
          country: 'South Africa'
        },
        isActive: true,
        isVerified: true
      });

      // Assign tenant to unit and set lease information
      await Unit.findByIdAndUpdate(unit._id, {
        tenant: tenant._id,
        lease: {
          startDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000), // Random date in past year
          endDate: new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000), // Random date in next year
          monthlyRent: unit.charges.monthlyRent,
          deposit: unit.charges.deposit,
          status: 'Active'
        }
      });

      // Create some purchase history (meter already exists)
      if (Math.random() > 0.5) {
        const purchaseAmount = [50, 100, 150, 200, 250][Math.floor(Math.random() * 5)];
        await Purchase.create({
          user: tenant._id,
          unit: unit._id,
          meter: unit.meter,
          amount: {
            requested: purchaseAmount,
            final: purchaseAmount,
            currency: 'ZAR'
          },
          electricity: {
            units: Math.floor(purchaseAmount / estate.tariff.rate),
            rate: estate.tariff.rate,
            token: `${Math.floor(Math.random() * 90000000000000000000) + 10000000000000000000}`
          },
          status: 'Completed',
          payment: {
            method: 'Card',
            reference: `PAY${Date.now()}${Math.floor(Math.random() * 1000)}`,
            status: 'Successful'
          },
          delivery: {
            method: 'SMS',
            status: 'Delivered'
          },
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random date in past week
        });
      }
    }
    console.log(`✅ Created ${Math.min(50, occupiedUnits.length)} tenants`);

    // Create Sample Incidents
    console.log('🎫 Creating sample incidents...');
    const incidentTypes = ['token_not_received', 'meter_fault', 'payment_issue', 'account_query', 'technical_support'];
    const priorities = ['low', 'medium', 'high', 'critical'];
    const statuses = ['Open', 'In Progress', 'Resolved', 'Closed'];

    const allTenants = await User.find({ role: 'tenant' });

    for (let i = 0; i < 20; i++) {
      const tenant = allTenants[Math.floor(Math.random() * allTenants.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      await Incident.create({
        ticketNumber: `INC${Date.now()}${String(i).padStart(3, '0')}`,
        user: tenant._id,
        category: incidentTypes[Math.floor(Math.random() * incidentTypes.length)],
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        status,
        title: `Sample incident ${i + 1}`,
        description: `This is a sample incident description for testing purposes.`,
        assignedTo: status !== 'Open' ? estateAdmin._id : null,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date in past month
        updatedAt: new Date()
      });
    }
    console.log('✅ Created 20 sample incidents');

    // Create Sample Notifications
    console.log('📢 Creating sample notifications...');
    const notificationTypes = ['balance_alert', 'system_maintenance', 'payment_confirmation', 'incident_update'];

    for (let i = 0; i < 30; i++) {
      const tenant = allTenants[Math.floor(Math.random() * allTenants.length)];

      await Notification.create({
        user: tenant._id,
        type: notificationTypes[Math.floor(Math.random() * notificationTypes.length)],
        title: `Sample Notification ${i + 1}`,
        message: `This is a sample notification message for testing purposes.`,
        isRead: Math.random() > 0.6, // 40% read
        delivery: {
          sms: {
            status: Math.random() > 0.1 ? 'Sent' : 'Failed',
            attempts: 1
          },
          email: {
            status: Math.random() > 0.1 ? 'Sent' : 'Failed',
            attempts: 1
          },
          push: {
            status: Math.random() > 0.1 ? 'Sent' : 'Failed',
            attempts: 1
          }
        },
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random date in past week
      });
    }
    console.log('✅ Created 30 sample notifications');

    // Create Indexes for Performance
    console.log('📊 Creating database indexes...');

    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ phone: 1 }, { unique: true });
    await User.collection.createIndex({ idNumber: 1 }, { unique: true });
    await Estate.collection.createIndex({ name: 1 });
    await Estate.collection.createIndex({ "address.province": 1, "address.city": 1 });
    await Unit.collection.createIndex({ unitNumber: 1, estate: 1 }, { unique: true });
    await Meter.collection.createIndex({ meterNumber: 1 }, { unique: true });
    await Purchase.collection.createIndex({ user: 1, createdAt: -1 });
    await Incident.collection.createIndex({ user: 1, status: 1, createdAt: -1 });
    await Notification.collection.createIndex({ user: 1, isRead: 1, createdAt: -1 });

    console.log('✅ Database indexes created');

    // Summary
    console.log('\n🎉 Database initialization completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`👤 Users: ${await User.countDocuments()}`);
    console.log(`🏢 Estates: ${await Estate.countDocuments()}`);
    console.log(`🏠 Units: ${await Unit.countDocuments()}`);
    console.log(`⚡ Meters: ${await Meter.countDocuments()}`);
    console.log(`💳 Purchases: ${await Purchase.countDocuments()}`);
    console.log(`🎫 Incidents: ${await Incident.countDocuments()}`);
    console.log(`📢 Notifications: ${await Notification.countDocuments()}`);

    console.log('\n🔐 Login Credentials:');
    console.log('System Admin: admin@khanyisolutions.com / admin123');
    console.log('Estate Admin: manager@waterfallgardens.co.za / estate123');
    console.log('Sample Tenant: tenant1@example.com / tenant123');

    process.exit(0);

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
};

initDatabase();