# Khanyi Vending System - Database Configuration

## MongoDB Atlas Connection Details

**Connection String**:
```
mongodb+srv://khanyiadmin:khanyiadmin123@vendingcluster0.u7seoi4.mongodb.net/?retryWrites=true&w=majority&appName=VendingCluster0
```

**Database Credentials**:
- **Username**: khanyiadmin
- **Password**: khanyiadmin123
- **Cluster**: VendingCluster0
- **Database Name**: khanyi_vending

## Environment Variables

Add these to your `.env` file:

```env
MONGODB_URI=mongodb+srv://khanyiadmin:khanyiadmin123@vendingcluster0.u7seoi4.mongodb.net/khanyi_vending?retryWrites=true&w=majority&appName=VendingCluster0
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
NODE_ENV=development
PORT=3000
```

## Database Collections

The following collections will be created automatically by Mongoose when the first document is inserted:

### 1. **users**
- User accounts (tenants, estate admins, system admins)
- Authentication and profile information
- South African compliance (ID numbers, phone numbers)

### 2. **estates**
- Residential estate/complex information
- Location, amenities, tariff settings
- Administrator assignments

### 3. **units**
- Individual apartment/unit information
- Tenant assignments and occupancy tracking
- Meter associations

### 4. **meters**
- Electricity meter information
- Balance tracking and reading history
- Token generation settings

### 5. **purchases**
- Electricity purchase transactions
- Token generation and delivery status
- Payment and refund tracking

### 6. **incidents**
- Support tickets and issue tracking
- SLA management and escalation
- Communication history

### 7. **notifications**
- System notifications and alerts
- Balance alerts and broadcast messages
- Delivery status tracking

## Indexes

The following indexes are automatically created for performance:

- `users`: email (unique), phoneNumber (unique), idNumber (unique)
- `estates`: name, location.province, location.city
- `units`: unitNumber, estateId, tenantId
- `meters`: meterNumber (unique), unitId
- `purchases`: userId, status, createdAt
- `incidents`: userId, status, priority, createdAt
- `notifications`: userId, type, isRead, createdAt

## Connection Test

Use this script to test the connection:

```javascript
const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://khanyiadmin:khanyiadmin123@vendingcluster0.u7seoi4.mongodb.net/khanyi_vending?retryWrites=true&w=majority&appName=VendingCluster0';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error('❌ MongoDB connection error:', err));
```