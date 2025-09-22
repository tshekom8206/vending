import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';
import 'package:khanyi_vending_app/routes/app_routes.dart';
import 'package:khanyi_vending_app/util/color_category.dart';
import 'package:khanyi_vending_app/util/constant.dart';
import 'package:khanyi_vending_app/util/constant_widget.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({Key? key}) : super(key: key);

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _getIsFirst();
  }

  _getIsFirst() async {
    // For debugging - always go through intro first, then check if signed in
    Timer(const Duration(seconds: 2), () {
      Get.offAllNamed(Routes.introRoute);
    });
  }

  @override
  Widget build(BuildContext context) {
    Constant.setupSize(context);
    return Scaffold(
      backgroundColor: bgColor,
      body: SafeArea(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            getAssetImage("splash_logo.png", width: 120.h, height: 120.h),
          ],
        ),
      ),
    );
  }
}
