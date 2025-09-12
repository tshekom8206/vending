import 'package:flutter/material.dart';
import 'package:khanyi_vending_app/view/home/home_screen.dart';
import 'package:khanyi_vending_app/view/intro/intro_screen.dart';
import 'package:khanyi_vending_app/view/login/forgot_screen.dart';
import 'package:khanyi_vending_app/view/login/login_screen.dart';
import 'package:khanyi_vending_app/view/login/pass_change_screen.dart';
import 'package:khanyi_vending_app/view/login/reset_screen.dart';
import 'package:khanyi_vending_app/view/login/verification_screen.dart';

import '../splash_screen.dart';
import 'app_routes.dart';

class AppPages {
  static const initialRoute = Routes.homeRoute;
  static Map<String, WidgetBuilder> routes = {
    Routes.homeRoute: (context) => const SplashScreen(),
    Routes.introRoute: (context) => const IntroScreen(),
    Routes.loginRoute: (context) => const LoginScreen(),
    Routes.homeScreenRoute: (context) => const HomeScreen(),
    Routes.forgotRoute: (context) => const ForgotScreen(),
    Routes.resetRoute: (context) => const ResetScreen(),
    Routes.passChangeRoute: (context) => const PassChangeScreen(),
    Routes.verificationRoute: (context) => const VerificationScreen()
  };
}
