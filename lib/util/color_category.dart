import 'package:flutter/services.dart';

// Enhanced Color Palette with Modern Design
Color bgColor = "#FEFEFE".toColor();
Color pacificBlue =
    "#198754".toColor(); // Main green color for primary elements
Color hintColor = "#565858".toColor();
Color borderColor = "#DFDFDF".toColor();
Color errorColor = "#DC3545".toColor(); // Red accent for errors and alerts
Color shadowColor = "#24819498".toColor();
Color lightPacific = "#D1E7DD".toColor(); // Light green for backgrounds
Color regularBlack = "#000000".toColor();
Color regularWhite = "#FFFFFF".toColor();
Color tabbarBackground = "#F6F6F6".toColor();
Color selectTabColor = "#198754".toColor(); // Green for selected tabs
Color dividerColor = "#F1F1F1".toColor();
Color accentRed = "#DC3545".toColor(); // Subtle red accent color
Color lightRed = "#F8D7DA".toColor(); // Light red for backgrounds

// Modern Enhanced Colors
Color primaryGradientStart = "#198754".toColor();
Color primaryGradientEnd = "#20C997".toColor();
Color secondaryGradientStart = "#6C5CE7".toColor();
Color secondaryGradientEnd = "#A29BFE".toColor();
Color accentGradientStart = "#FD79A8".toColor();
Color accentGradientEnd = "#FDCB6E".toColor();

// Glassmorphism Colors
Color glassWhite = "#FFFFFF".toColor().withOpacity(0.25);
Color glassBorder = "#FFFFFF".toColor().withOpacity(0.18);
Color glassShadow = "#000000".toColor().withOpacity(0.1);

// Modern Neutral Colors
Color surfaceColor = "#F8F9FA".toColor();
Color cardColor = "#FFFFFF".toColor();
Color textPrimary = "#2D3436".toColor();
Color textSecondary = "#636E72".toColor();
Color textTertiary = "#B2BEC3".toColor();

// Status Colors
Color successColor = "#00B894".toColor();
Color warningColor = "#FDCB6E".toColor();
Color infoColor = "#74B9FF".toColor();
Color dangerColor = "#E17055".toColor();

extension ColorExtension on String {
  toColor() {
    var hexColor = replaceAll("#", "");
    if (hexColor.length == 6) {
      hexColor = "FF$hexColor";
    }
    if (hexColor.length == 8) {
      return Color(int.parse("0x$hexColor"));
    }
  }
}

setStatusBarColor(Color color) {
  SystemChrome.setSystemUIOverlayStyle(SystemUiOverlayStyle(
    statusBarColor: color,
  ));
}
