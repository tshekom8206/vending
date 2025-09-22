#!/bin/bash

# Flutter App Testing Script
# Run this after Flutter is properly installed

echo "🚀 Starting Flutter App Testing..."
echo ""

# Check if Flutter is available
if ! command -v flutter &> /dev/null; then
    echo "❌ Flutter not found in PATH"
    echo "Please install Flutter and add to PATH:"
    echo "export PATH=\"\$PATH:[FLUTTER_DIRECTORY]/bin\""
    exit 1
fi

echo "✅ Flutter found: $(flutter --version | head -n1)"
echo ""

# Check Flutter setup
echo "🔍 Running Flutter Doctor..."
flutter doctor

echo ""
echo "📦 Getting dependencies..."
flutter pub get

echo ""
echo "🏗️  Building Flutter app..."

# Try to run on available devices
echo "📱 Available devices:"
flutter devices

echo ""
echo "To run the app, use one of these commands:"
echo "  flutter run -d ios        # iOS Simulator"
echo "  flutter run -d android    # Android Emulator"
echo "  flutter run -d chrome     # Chrome Browser"
echo "  flutter run -d macos      # macOS Desktop"
echo ""

# Check if backend is running
echo "🔌 Checking backend status..."
if curl -s http://localhost:3000/health > /dev/null; then
    echo "✅ Backend server is running on port 3000"
else
    echo "❌ Backend server not responding"
    echo "Please start backend: cd khanyi-backend && npm start"
fi

echo ""
echo "🎯 Ready to test! See FLUTTER_TESTING_GUIDE.md for full testing instructions"