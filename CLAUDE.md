# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Flutter real estate application using the GetX state management pattern. Despite the project name `real_estate_app`, the repository is in a directory called `khanyi_vending_app`, suggesting it may have been repurposed or is a template.

## Development Commands

```bash
# Run the app in debug mode
flutter run

# Build for Android
flutter build apk

# Build for iOS
flutter build ios

# Run tests
flutter test

# Analyze code (linting)
flutter analyze

# Get dependencies
flutter pub get

# Clean build cache
flutter clean
```

## Architecture

The application follows a standard Flutter + GetX architecture:

### Directory Structure
- `lib/view/` - UI screens organized by feature areas:
  - `intro/` - Onboarding screens
  - `login/` - Authentication screens  
  - `home/` - Main app screens with tabbed navigation
- `lib/controller/` - GetX controllers for state management
- `lib/model/` - Data models
- `lib/util/` - Utilities, constants, and helper widgets
- `lib/routes/` - Navigation routing configuration
- `assets/images/` - Image assets
- `fonts/` - Custom font files (SF UI Text)

### Navigation
- Uses GetX routing with centralized route definitions in `lib/routes/`
- Routes are defined in `app_routes.dart` and mapped in `app_pages.dart`
- Initial route is splash screen at "/"

### State Management
- Uses GetX controllers extending `GetxController`
- Controllers handle UI state and business logic for each screen
- Reactive programming with `.obs` observables and `update()` calls

### Key Dependencies
- `get: ^4.6.5` - State management and navigation
- `flutter_screenutil: ^5.5.3+2` - Responsive UI scaling
- `shared_preferences: ^2.0.15` - Local data storage
- `flutter_svg: ^1.1.4` - SVG image support
- `pinput: ^2.2.9` - PIN input widget
- `syncfusion_flutter_sliders: ^20.3.48` - Range slider components

### Design Constants
- Default screen size: 414x896 (iPhone 11 Pro dimensions)
- Custom font family: "SF UI Text" with weights 400, 500, 600, 700
- Currency display: "ETH" (Ethereum)
- Asset path: `assets/images/`

## Development Notes

- The app uses responsive design with ScreenUtil for consistent scaling across devices
- Controllers are organized by screen/feature with clear naming conventions
- Navigation uses GetX routing system rather than Flutter's default Navigator
- No linting rules are currently active (flutter_lints is commented out in pubspec.yaml)
- The project structure suggests a real estate/property listing app with features like saved properties, filters, bookings, and messaging