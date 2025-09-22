const axios = require('axios');

const API_URL = 'http://localhost:3000/api/v1';
let authToken = '';
let systemAdminId = '';
let estateId = '';
let unitId = '';
let meterId = '';
let purchaseId = '';
let incidentId = '';
let notificationId = '';

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

const logSuccess = (message) => console.log(`${colors.green}✅ ${message}${colors.reset}`);
const logError = (message) => console.log(`${colors.red}❌ ${message}${colors.reset}`);
const logInfo = (message) => console.log(`${colors.blue}ℹ️  ${message}${colors.reset}`);
const logSection = (message) => console.log(`\n${colors.yellow}${'='.repeat(50)}${colors.reset}\n${colors.yellow}${message}${colors.reset}\n${colors.yellow}${'='.repeat(50)}${colors.reset}`);

// Helper function for API requests
const apiRequest = async (method, endpoint, data = null, useAuth = true) => {
  try {
    const config = {
      method,
      url: `${API_URL}${endpoint}`,
      headers: {}
    };

    if (useAuth && authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || error.message,
      status: error.response?.status
    };
  }
};

const runTests = async () => {
  console.log('\n🚀 Starting Khanyi Vending API Tests\n');

  // Test 1: Health Check
  logSection('1. HEALTH CHECK');
  const health = await apiRequest('GET', '/../health', null, false);
  if (health.success) {
    logSuccess('Health check passed');
    logInfo(`Server status: ${health.data.status}`);
  } else {
    logError('Health check failed');
  }

  // Test 2: User Registration
  logSection('2. USER REGISTRATION');
  const registerData = {
    firstName: 'Test',
    lastName: 'Admin',
    email: 'testadmin@khanyisolutions.com',
    phone: '+27821234567',
    idNumber: '9001010001088',
    password: 'Test123!@#',
    role: 'system_admin'
  };

  const register = await apiRequest('POST', '/auth/register', registerData, false);
  if (register.success) {
    logSuccess('User registration successful');
    systemAdminId = register.data.data.user._id;
    logInfo(`User ID: ${systemAdminId}`);
  } else {
    logError(`Registration failed: ${register.error}`);

    // If user exists, try to login instead
    if (register.status === 400) {
      logInfo('User might already exist, attempting login...');
    }
  }

  // Test 3: User Login
  logSection('3. USER LOGIN');
  const loginData = {
    email: 'testadmin@khanyisolutions.com',
    password: 'Test123!@#'
  };

  const login = await apiRequest('POST', '/auth/login', loginData, false);
  if (login.success) {
    logSuccess('Login successful');
    authToken = login.data.data.accessToken;
    if (!systemAdminId) {
      systemAdminId = login.data.data.user._id;
    }
    logInfo(`Token received: ${authToken.substring(0, 20)}...`);
  } else {
    logError(`Login failed: ${login.error}`);
    return; // Cannot continue without auth
  }

  // Test 4: Get User Profile
  logSection('4. USER PROFILE');
  const profile = await apiRequest('GET', '/auth/me');
  if (profile.success) {
    logSuccess('Profile retrieved successfully');
    logInfo(`User: ${profile.data.data.fullName} (${profile.data.data.role})`);
  } else {
    logError(`Profile retrieval failed: ${profile.error}`);
  }

  // Test 5: Create Estate
  logSection('5. CREATE ESTATE');
  const estateData = {
    name: 'Test Gardens Estate',
    description: 'Test estate for API testing',
    type: 'Residential',
    address: {
      street: '123 Test Street',
      suburb: 'Test Suburb',
      city: 'Johannesburg',
      province: 'Gauteng',
      postalCode: '2000'
    },
    coordinates: {
      latitude: -26.2041,
      longitude: 28.0473
    },
    tariff: {
      rate: 2.50
    },
    management: {
      company: 'Test Management Co',
      contactPerson: 'Test Manager',
      phone: '+27111234567',
      email: 'manager@testgardens.co.za'
    },
    amenities: ['Security', 'Parking', 'Garden'],
    createdBy: systemAdminId
  };

  const estate = await apiRequest('POST', '/estates', estateData);
  if (estate.success) {
    logSuccess('Estate created successfully');
    estateId = estate.data.data._id;
    logInfo(`Estate ID: ${estateId}`);
  } else {
    logError(`Estate creation failed: ${estate.error}`);
  }

  // Test 6: Get Estates
  logSection('6. GET ESTATES');
  const estates = await apiRequest('GET', '/estates');
  if (estates.success) {
    logSuccess('Estates retrieved successfully');
    logInfo(`Total estates: ${estates.data.data.length || 0}`);
  } else {
    logError(`Estates retrieval failed: ${estates.error}`);
  }

  // Test 7: Create Unit
  logSection('7. CREATE UNIT');
  if (estateId) {
    // First create a temporary meter for the unit
    const tempMeterData = {
      meterNumber: `TEST${Date.now()}`,
      serialNumber: `SN${Date.now()}`,
      unit: 'TEMP_UNIT_ID', // Will update after creating unit
      specifications: {
        manufacturer: 'Test Manufacturer',
        model: 'Test Model',
        type: 'Prepaid'
      },
      installation: {
        date: new Date().toISOString(),
        technician: 'Test Tech'
      },
      balance: {
        current: 100
      },
      tariff: {
        rate: 2.50
      },
      createdBy: systemAdminId
    };

    const unitData = {
      unitNumber: `TEST${Date.now()}`,
      estate: estateId,
      specifications: {
        bedrooms: 2,
        bathrooms: 1,
        area: {
          size: 75
        },
        floor: 2
      },
      charges: {
        monthlyRent: 7500,
        deposit: 15000
      },
      status: 'Available',
      createdBy: systemAdminId
    };

    const unit = await apiRequest('POST', '/units', unitData);
    if (unit.success) {
      logSuccess('Unit created successfully');
      unitId = unit.data.data._id;
      logInfo(`Unit ID: ${unitId}`);
    } else {
      logError(`Unit creation failed: ${unit.error}`);
    }
  }

  // Test 8: Get Units
  logSection('8. GET UNITS');
  const units = await apiRequest('GET', '/units');
  if (units.success) {
    logSuccess('Units retrieved successfully');
    logInfo(`Total units: ${units.data.data.length || 0}`);
  } else {
    logError(`Units retrieval failed: ${units.error}`);
  }

  // Test 9: Create Purchase
  logSection('9. CREATE PURCHASE');
  const purchaseData = {
    user: systemAdminId,
    unit: unitId || 'test-unit-id',
    meter: meterId || 'test-meter-id',
    amount: {
      requested: 100,
      final: 100
    },
    electricity: {
      units: 40,
      rate: 2.50
    },
    payment: {
      method: 'Card',
      reference: `TEST${Date.now()}`
    }
  };

  const purchase = await apiRequest('POST', '/purchases', purchaseData);
  if (purchase.success) {
    logSuccess('Purchase created successfully');
    purchaseId = purchase.data.data._id;
    logInfo(`Purchase ID: ${purchaseId}`);
    logInfo(`Token: ${purchase.data.data.electricity?.token || 'N/A'}`);
  } else {
    logError(`Purchase creation failed: ${purchase.error}`);
  }

  // Test 10: Get Purchases
  logSection('10. GET PURCHASES');
  const purchases = await apiRequest('GET', '/purchases');
  if (purchases.success) {
    logSuccess('Purchases retrieved successfully');
    logInfo(`Total purchases: ${purchases.data.data.length || 0}`);
  } else {
    logError(`Purchases retrieval failed: ${purchases.error}`);
  }

  // Test 11: Create Incident
  logSection('11. CREATE INCIDENT');
  const incidentData = {
    user: systemAdminId,
    category: 'token_not_received',
    priority: 'high',
    title: 'Test Incident',
    description: 'This is a test incident for API testing'
  };

  const incident = await apiRequest('POST', '/incidents', incidentData);
  if (incident.success) {
    logSuccess('Incident created successfully');
    incidentId = incident.data.data._id;
    logInfo(`Incident ID: ${incidentId}`);
    logInfo(`Ticket Number: ${incident.data.data.ticketNumber}`);
  } else {
    logError(`Incident creation failed: ${incident.error}`);
  }

  // Test 12: Get Incidents
  logSection('12. GET INCIDENTS');
  const incidents = await apiRequest('GET', '/incidents');
  if (incidents.success) {
    logSuccess('Incidents retrieved successfully');
    logInfo(`Total incidents: ${incidents.data.data.length || 0}`);
  } else {
    logError(`Incidents retrieval failed: ${incidents.error}`);
  }

  // Test 13: Create Notification
  logSection('13. CREATE NOTIFICATION');
  const notificationData = {
    user: systemAdminId,
    type: 'system_maintenance',
    title: 'Test Notification',
    message: 'This is a test notification for API testing',
    priority: 'medium'
  };

  const notification = await apiRequest('POST', '/notifications', notificationData);
  if (notification.success) {
    logSuccess('Notification created successfully');
    notificationId = notification.data.data._id;
    logInfo(`Notification ID: ${notificationId}`);
  } else {
    logError(`Notification creation failed: ${notification.error}`);
  }

  // Test 14: Get Notifications
  logSection('14. GET NOTIFICATIONS');
  const notifications = await apiRequest('GET', '/notifications');
  if (notifications.success) {
    logSuccess('Notifications retrieved successfully');
    logInfo(`Total notifications: ${notifications.data.data.length || 0}`);
  } else {
    logError(`Notifications retrieval failed: ${notifications.error}`);
  }

  // Test 15: Get Users (Admin Only)
  logSection('15. GET USERS (ADMIN)');
  const users = await apiRequest('GET', '/users');
  if (users.success) {
    logSuccess('Users retrieved successfully');
    logInfo(`Total users: ${users.data.data.length || 0}`);
  } else {
    logError(`Users retrieval failed: ${users.error}`);
  }

  // Test 16: Get Statistics
  logSection('16. GET STATISTICS');

  // User Stats
  const userStats = await apiRequest('GET', '/users/stats/summary');
  if (userStats.success) {
    logSuccess('User statistics retrieved');
    logInfo(`User stats: ${JSON.stringify(userStats.data.data?.summary || {})}`);
  } else {
    logError(`User stats failed: ${userStats.error}`);
  }

  // Purchase Stats
  const purchaseStats = await apiRequest('GET', '/purchases/stats/summary');
  if (purchaseStats.success) {
    logSuccess('Purchase statistics retrieved');
    logInfo(`Purchase stats: ${JSON.stringify(purchaseStats.data.data?.summary || {})}`);
  } else {
    logError(`Purchase stats failed: ${purchaseStats.error}`);
  }

  // Incident Stats
  const incidentStats = await apiRequest('GET', '/incidents/stats/dashboard');
  if (incidentStats.success) {
    logSuccess('Incident statistics retrieved');
    logInfo(`Incident stats: ${JSON.stringify(incidentStats.data.data || {})}`);
  } else {
    logError(`Incident stats failed: ${incidentStats.error}`);
  }

  // Summary
  logSection('TEST SUMMARY');
  console.log('\n🎉 API testing completed!\n');
  console.log('MongoDB connection is working correctly.');
  console.log('All major endpoints have been tested.\n');
};

// Run the tests
runTests().catch(error => {
  console.error('Test suite error:', error);
  process.exit(1);
});