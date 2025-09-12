import 'package:flutter/services.dart';

Color bgColor = "#FEFEFE".toColor();
Color pacificBlue = "#198754".toColor();  // Main green color for primary elements
Color hintColor = "#565858".toColor();
Color borderColor = "#DFDFDF".toColor();
Color errorColor = "#DC3545".toColor();  // Red accent for errors and alerts
Color shadowColor = "#24819498".toColor();
Color lightPacific = "#D1E7DD".toColor();  // Light green for backgrounds
Color regularBlack = "#000000".toColor();
Color regularWhite = "#FFFFFF".toColor();
Color tabbarBackground = "#F6F6F6".toColor();
Color selectTabColor = "#198754".toColor();  // Green for selected tabs
Color dividerColor = "#F1F1F1".toColor();
Color accentRed = "#DC3545".toColor();  // Subtle red accent color
Color lightRed = "#F8D7DA".toColor();  // Light red for backgrounds

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
