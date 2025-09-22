# Flutter App Testing Guide

## Prerequisites
✅ Backend server running on http://localhost:3000
✅ MongoDB Atlas connected
✅ Flutter SDK installed and in PATH

## Testing Steps

### 1. Setup Dependencies
```bash
cd /Users/refiloebutjie/Downloads/vending
flutter pub get
```

### 2. Run Flutter Doctor
```bash
flutter doctor
```
Ensure all checks pass (at least Android/iOS toolchain available).

### 3. Launch App
```bash
# For iOS Simulator
flutter run -d ios

# For Android Emulator
flutter run -d android

# For Chrome (Web)
flutter run -d chrome --web-port 8080
```

### 4. Test Authentication Flow

#### Registration Test:
1. Navigate to Sign Up tab
2. Fill in form:
   - First Name: `Test`
   - Last Name: `User`
   - Email: `test.flutter@example.com`
   - Phone: `+27123456789` (must be SA format)
   - ID Number: `9001014800089`
   - Password: `TestPassword123`
   - Confirm Password: `TestPassword123`
3. Tap "Sign Up"
4. Should see success and navigate to home screen

#### Login Test:
1. Navigate to Login tab
2. Enter credentials:
   - Email: `flutter.test@example.com`
   - Password: `FlutterTest123`
3. Tap "Login"
4. Should navigate to home screen

### 5. Test API Integration

#### Home Screen:
- Should load estate data from backend
- Location should show "Johannesburg, South Africa"
- Should see "Waterfall Gardens Estate" in data

#### Purchase Flow:
1. Tap "Purchase Electricity"
2. Select Waterfall Gardens Estate
3. Choose unit and meter
4. Enter amount (e.g., R100)
5. Should calculate kWh at R2.85/kWh
6. Process purchase
7. Should receive electricity token

### 6. Backend API Endpoints Being Used

- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User authentication
- `GET /api/v1/estates` - Load estates/complexes
- `GET /api/v1/estates/:id/units` - Load units for estate
- `POST /api/v1/purchases` - Create electricity purchase
- `GET /api/v1/purchases` - Get purchase history

### 7. Expected Behaviors

#### Success Cases:
- Authentication redirects to home screen
- API data populates lists and dropdowns
- Purchase generates valid electricity tokens
- Error handling shows user-friendly messages

#### Error Cases:
- Invalid credentials show error message
- Network errors show retry options
- Validation errors highlight form fields

### 8. Network Configuration

The Flutter app is configured to call:
- Base URL: `http://localhost:3000/api/v1`
- Timeout: 30 seconds
- Auto token refresh on 401 errors

### 9. Debugging

#### Check API Calls:
Look for console logs showing HTTP requests/responses

#### Backend Logs:
Monitor terminal running `npm start` for API calls

#### Flutter Logs:
Watch `flutter run` output for errors

## Known Configurations

- **CORS**: Enabled for localhost
- **JWT**: 7-day access tokens, 30-day refresh tokens
- **Phone Validation**: Must match SA format (+27XXXXXXXXX)
- **Password**: Min 6 characters
- **ID Validation**: SA ID number format

## Troubleshooting

### Flutter Command Not Found:
```bash
export PATH="$PATH:[FLUTTER_DIRECTORY]/bin"
# Or add to ~/.bashrc or ~/.zshrc
```

### Network Issues:
- Ensure backend is running on port 3000
- Check firewall settings
- Use physical device IP instead of localhost if testing on device

### Build Issues:
```bash
flutter clean
flutter pub get
flutter run
```

The app is fully integrated and ready for testing! 🚀