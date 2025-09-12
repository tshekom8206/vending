import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:khanyi_vending_app/util/color_category.dart';
import 'package:khanyi_vending_app/util/constant_widget.dart';
import 'package:khanyi_vending_app/view/login/tab_login.dart';
import 'package:khanyi_vending_app/view/login/tab_signUp.dart';

import '../../util/constant.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({Key? key}) : super(key: key);

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen>
    with TickerProviderStateMixin {
  void backClick() {
    Constant.closeApp();
  }

  var tabController;
  var pController;

  @override
  void initState() {
    // TODO: implement initState
    super.initState();
    tabController = TabController(length: 2, vsync: this);
    pController = PageController();
  }

  @override
  void dispose() {
    // TODO: implement dispose
    super.dispose();
    tabController.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () async {
        backClick();
        return false;
      },
      child: Scaffold(
        backgroundColor: bgColor,
        resizeToAvoidBottomInset: false,
        body: SafeArea(
          child: Column(
            children: [
              getVerSpace(40.h),
              Align(
                alignment: Alignment.topLeft,
                child: TabBar(
                  unselectedLabelColor: hintColor,
                  padding: EdgeInsets.symmetric(horizontal: 5.h),
                  labelStyle: TextStyle(
                      fontSize: 16.sp,
                      fontWeight: FontWeight.w600,
                      fontFamily: Constant.fontsFamily,
                      height: 1.5),
                  labelColor: pacificBlue,
                  unselectedLabelStyle: TextStyle(
                      fontSize: 16.sp,
                      fontWeight: FontWeight.w400,
                      fontFamily: Constant.fontsFamily,
                      height: 1.5),
                  indicatorSize: TabBarIndicatorSize.label,
                  indicatorWeight: 2.0,
                  indicatorColor: pacificBlue,
                  isScrollable: true,
                  controller: tabController,
                  tabs: const [
                    Tab(
                      text: "Login ",
                    ),
                    Tab(
                      text: "Sign Up",
                    ),
                  ],
                  onTap: (value) {
                    pController.animateToPage(value,
                        duration: const Duration(milliseconds: 300),
                        curve: Curves.ease);
                  },
                ),
              ),
              getVerSpace(50.h),
              Expanded(
                flex: 1,
                child: PageView(
                  controller: pController,
                  onPageChanged: (value) {
                    tabController.animateTo(value,
                        duration: const Duration(milliseconds: 300),
                        curve: Curves.ease);
                  },
                  children: [TabLogin(pController), TabSignUp(pController)],
                ),
              )
            ],
          ),
        ),
      ),
    );
  }
}
