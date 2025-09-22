const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function createSystemAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/khanyi-vending');
    console.log('Connected to MongoDB');

    // Create system admin user
    const adminUser = new User({
      firstName: 'System',
      lastName: 'Admin',
      email: 'admin@khanyi.com',
      phone: '+27123456789',
      idNumber: '9999999999999',
      password: 'admin123',
      role: 'system_admin',
      address: {
        street: '123 Admin Street',
        city: 'Johannesburg',
        province: 'Gauteng',
        postalCode: '2000',
        country: 'South Africa'
      },
      isActive: true,
      isVerified: true
    });

    await adminUser.save();
    console.log('✅ System admin user created successfully!');
    console.log('Email: admin@khanyi.com');
    console.log('Password: admin123');
    console.log('Role: system_admin');

  } catch (error) {
    if (error.code === 11000) {
      console.log('ℹ️  User already exists, trying to update role...');
      await User.findOneAndUpdate(
        { email: 'admin@khanyi.com' },
        { role: 'system_admin', isActive: true, isVerified: true }
      );
      console.log('✅ Updated existing user to system_admin role');
    } else {
      console.error('❌ Error creating admin user:', error.message);
    }
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
}

createSystemAdmin();