# Khanyi Vending Backend API

A comprehensive Node.js backend API for the Khanyi Solutions Electricity Vending application, designed to manage residential complexes, electricity purchases, and tenant services in South Africa.

## 🚀 Features

### Core Functionality
- **User Management**: Multi-role authentication (tenant, estate_admin, system_admin)
- **Estate Management**: Residential complex management with units and meters
- **Electricity Vending**: Secure token generation and purchase processing
- **Support System**: Incident management with SLA tracking
- **Notifications**: Multi-channel notification system (SMS, Email, Push, In-App)
- **Reporting**: Comprehensive analytics and reporting

### Security Features
- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- Input validation and sanitization
- Rate limiting and CORS protection
- Password hashing with bcrypt
- Secure electricity token generation

### South African Compliance
- South African phone number validation (+27xxxxxxxxx)
- SA ID number validation (13 digits)
- Postal code validation (4 digits)
- ZAR currency support
- Tariff rate management

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd khanyi-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Copy the `.env` file and configure your settings:
   ```bash
   cp .env .env.local
   ```

   Update the following variables:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/khanyi_vending

   # JWT
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   JWT_EXPIRE=7d
   JWT_REFRESH_EXPIRE=30d

   # Server
   PORT=3000
   NODE_ENV=development
   ```

4. **Start MongoDB**
   ```bash
   # Using MongoDB service
   sudo systemctl start mongod

   # Or using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

5. **Run the application**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## 📚 API Documentation

The API is organized into the following main endpoints:

### Authentication (`/api/v1/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `POST /refresh` - Refresh access token
- `GET /me` - Get current user profile
- `PUT /profile` - Update user profile
- `PUT /password` - Change password
- `POST /forgot-password` - Request password reset
- `POST /reset-password/:token` - Reset password

### Estates (`/api/v1/estates`)
- `GET /` - List all estates (with search/filter)
- `GET /:id` - Get single estate
- `POST /` - Create estate (Admin only)
- `PUT /:id` - Update estate
- `DELETE /:id` - Delete estate (Admin only)
- `GET /:id/units` - Get estate units
- `GET /:id/statistics` - Get estate statistics
- `POST /:id/administrators` - Add estate administrator
- `DELETE /:id/administrators/:userId` - Remove administrator

### Units (`/api/v1/units`)
- `GET /` - List units (role-based filtering)
- `GET /:id` - Get single unit
- `POST /` - Create unit
- `PUT /:id` - Update unit
- `DELETE /:id` - Delete unit (Admin only)
- `POST /:id/tenant` - Assign tenant to unit
- `DELETE /:id/tenant` - Remove tenant from unit
- `GET /:id/meter` - Get unit meter information
- `POST /:id/meter` - Create meter for unit
- `POST /:id/meter/readings` - Add meter reading
- `GET /:id/maintenance` - Get maintenance history
- `POST /:id/maintenance` - Add maintenance record

### Purchases (`/api/v1/purchases`)
- `GET /` - Get purchase history
- `GET /:id` - Get single purchase
- `POST /` - Purchase electricity
- `POST /:id/retry-delivery` - Retry token delivery
- `POST /:id/refund` - Process refund (Admin only)
- `POST /:id/use-token` - Mark token as used
- `GET /stats/summary` - Get purchase statistics

### Incidents (`/api/v1/incidents`)
- `GET /` - List incidents
- `GET /:id` - Get single incident
- `POST /` - Create incident
- `PUT /:id` - Update incident (Admin only)
- `POST /:id/communications` - Add communication
- `POST /:id/escalate` - Escalate incident
- `POST /:id/close` - Close incident
- `GET /stats/dashboard` - Get dashboard statistics
- `GET /categories` - Get incident categories

### Notifications (`/api/v1/notifications`)
- `GET /` - Get user notifications
- `GET /:id` - Get single notification
- `PUT /:id/read` - Mark notification as read
- `PUT /read-all` - Mark all notifications as read
- `POST /:id/action/:actionId` - Track action click
- `GET /stats/summary` - Get notification statistics
- `POST /` - Create notification (Admin only)
- `POST /broadcast` - Send broadcast notification
- `POST /balance-alert` - Create balance alert
- `GET /templates` - Get notification templates

### Users (`/api/v1/users`)
- `GET /` - List users (Admin only)
- `GET /:id` - Get single user
- `PUT /:id` - Update user
- `DELETE /:id` - Deactivate user (Admin only)
- `GET /:id/dashboard` - Get user dashboard
- `GET /:id/purchases` - Get user purchase history
- `GET /:id/incidents` - Get user incidents
- `GET /stats/summary` - Get user statistics

## 🏗️ Project Structure

```
khanyi-backend/
├── models/           # Mongoose data models
│   ├── User.js
│   ├── Estate.js
│   ├── Unit.js
│   ├── Meter.js
│   ├── Purchase.js
│   ├── Incident.js
│   └── Notification.js
├── routes/           # API route handlers
│   ├── auth.js
│   ├── estates.js
│   ├── units.js
│   ├── purchases.js
│   ├── incidents.js
│   ├── notifications.js
│   └── users.js
├── middleware/       # Custom middleware
│   ├── auth.js
│   └── validation.js
├── utils/           # Utility functions
│   └── tokenGenerator.js
├── server.js        # Main application file
└── .env            # Environment variables
```

## 🔐 Authentication & Authorization

The API uses JWT-based authentication with role-based access control:

### Roles
- **tenant**: Can access own units, purchase electricity, create incidents
- **estate_admin**: Can manage assigned estates and their units/tenants
- **system_admin**: Full access to all resources

### Protected Routes
Most endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## 💳 Electricity Token Generation

The system generates STS-compliant electricity tokens with the following features:
- SHA-256 based token generation
- 20-digit token format
- 30-day expiry period
- Secure token validation
- Support for multiple meter manufacturers

### Token Format
```
Format: XXXX XXXX XXXX XXXX XXXX
Example: 1234 5678 9012 3456 7890
```

## 📊 Database Models

### Key Relationships
- **Estate** → **Units** (One-to-Many)
- **Unit** → **Meter** (One-to-One)
- **Unit** → **User** (Tenant relationship)
- **User** → **Purchases** (One-to-Many)
- **User** → **Incidents** (One-to-Many)

### Indexes
All models include appropriate indexes for optimal query performance:
- User: email, phone, idNumber
- Estate: location, type, tariff
- Unit: estate + unitNumber, tenant
- Purchase: user, transactionId, date
- Incident: reporter, status, priority

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment | development |
| `MONGODB_URI` | MongoDB connection string | Required |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRE` | Access token expiry | 7d |
| `JWT_REFRESH_EXPIRE` | Refresh token expiry | 30d |
| `TOKEN_SECRET` | Electricity token secret | Required |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | 900000 |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 |

## 🚦 Rate Limiting

API endpoints are protected with rate limiting:
- **Default**: 100 requests per 15 minutes per IP
- **Authentication endpoints**: Additional protection
- **Purchase endpoints**: Lower limits for security

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- --grep "Authentication"

# Run tests with coverage
npm run test:coverage
```

## 📈 Monitoring

### Health Check
```
GET /health
```

Returns API status and system information.

### Logging
The application uses structured logging with different levels:
- **ERROR**: Application errors
- **WARN**: Warning conditions
- **INFO**: General information
- **DEBUG**: Detailed debugging (development only)

## 🔄 Error Handling

All API responses follow a consistent format:

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message",
  "details": [ ... ] // For validation errors
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `429` - Too Many Requests
- `500` - Internal Server Error

## 🚀 Deployment

### Production Checklist
- [ ] Set strong JWT secrets
- [ ] Configure MongoDB with authentication
- [ ] Set up SSL/TLS certificates
- [ ] Configure environment variables
- [ ] Set up monitoring and logging
- [ ] Configure backups
- [ ] Set up reverse proxy (nginx)
- [ ] Configure firewall rules

### Docker Deployment
```bash
# Build image
docker build -t khanyi-backend .

# Run container
docker run -d -p 3000:3000 --env-file .env khanyi-backend
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Email: support@khanyisolutions.com
- Documentation: [API Docs](https://docs.khanyisolutions.com)
- Issues: [GitHub Issues](https://github.com/khanyi/backend/issues)

## 🔄 Version History

### v1.0.0 (Current)
- Initial release
- Complete API implementation
- Authentication and authorization
- Electricity vending system
- Incident management
- Notification system
- Comprehensive documentation