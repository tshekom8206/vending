import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';
import 'package:khanyi_vending_app/datafile/datafile.dart';
import 'package:khanyi_vending_app/util/color_category.dart';
import 'package:khanyi_vending_app/view/home/tab/tab_explore.dart';
import 'package:khanyi_vending_app/view/home/tab/tab_home_screens/tab_home.dart';
import 'package:khanyi_vending_app/view/home/tab/tab_message_screens/tab_message.dart';
import 'package:khanyi_vending_app/view/home/tab/tab_more_screens/tab_more.dart';
import 'package:khanyi_vending_app/view/home/tab/tab_saved.dart';

import '../../controller/controller.dart';
import '../../model/bottom_model.dart';
import '../../util/constant.dart';
import '../../util/constant_widget.dart';

class NavItem {
  final String label;
  final String icon;
  final String activeIcon;

  NavItem(this.label, this.icon, this.activeIcon);
}

class HomeScreen extends StatefulWidget {
  final int? initialTabIndex;
  const HomeScreen({Key? key, this.initialTabIndex}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  void backClick() {
    Constant.closeApp();
  }

  HomeController controller = Get.put(HomeController());
  List<ModelBottom> bottomLists = DataFile.bottomList;

  @override
  void initState() {
    super.initState();
    if (widget.initialTabIndex != null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        controller.index.value = widget.initialTabIndex!;
        controller.update();
      });
    }
  }

  static final List<Widget> _widgetOptions = <Widget>[
    const TabHome(),
    const TabExplore(),
    const TabSaved(),
    const TabMessage(),
    const TabMore()
  ];

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () async {
        backClick();
        return false;
      },
      child: GetBuilder<HomeController>(
        init: HomeController(),
        builder: (controller) => Scaffold(
          backgroundColor: bgColor,
          resizeToAvoidBottomInset: false,
          bottomNavigationBar: Container(
              decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Colors.white, surfaceColor],
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                  ),
                  borderRadius: BorderRadius.only(
                      topRight: Radius.circular(28.h),
                      topLeft: Radius.circular(28.h)),
                  boxShadow: [
                    BoxShadow(
                        offset: Offset(0, -8),
                        blurRadius: 25,
                        spreadRadius: 0,
                        color: shadowColor.withOpacity(0.15)),
                    BoxShadow(
                        offset: Offset(0, -2),
                        blurRadius: 8,
                        spreadRadius: 0,
                        color: Colors.black.withOpacity(0.05))
                  ]),
              child: ClipRRect(
                  borderRadius: BorderRadius.only(
                      topRight: Radius.circular(28.h),
                      topLeft: Radius.circular(28.h)),
                  child: buildBottomnavigation(controller))),
          body: SafeArea(
            child: GetX<HomeController>(
              init: HomeController(),
              builder: (controller) => _widgetOptions[controller.index.value],
            ),
          ),
        ),
      ),
    );
  }

  BottomNavigationBar buildBottomnavigation(HomeController controller) {
    return BottomNavigationBar(
      onTap: (value) {
        controller.onChange(value.obs);
      },
      currentIndex: controller.index.value,
      elevation: 0,
      showUnselectedLabels: true,
      backgroundColor: Colors.white,
      selectedItemColor: pacificBlue,
      unselectedItemColor: hintColor.withOpacity(0.6),
      selectedFontSize: 11.sp,
      unselectedFontSize: 10.sp,
      selectedLabelStyle: TextStyle(
        fontWeight: FontWeight.w600,
        color: pacificBlue,
        fontSize: 11.sp,
        fontFamily: 'SF UI Text',
      ),
      unselectedLabelStyle: TextStyle(
        fontWeight: FontWeight.w500,
        color: hintColor.withOpacity(0.6),
        fontSize: 10.sp,
        fontFamily: 'SF UI Text',
      ),
      type: BottomNavigationBarType.fixed,
      items: [
        BottomNavigationBarItem(
          label: "Home",
          icon: Container(
            padding: EdgeInsets.all(4.h),
            child: getSvgImage("home.svg",
                height: 20.h, width: 20.w, color: hintColor.withOpacity(0.6)),
          ),
          activeIcon: Container(
            padding: EdgeInsets.all(8.h),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [primaryGradientStart, primaryGradientEnd],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(16.h),
              boxShadow: [
                BoxShadow(
                  color: primaryGradientStart.withOpacity(0.3),
                  blurRadius: 12,
                  offset: Offset(0, 4),
                ),
              ],
            ),
            child: getSvgImage("home_bold.svg",
                height: 20.h, width: 20.w, color: Colors.white),
          ),
        ),
        BottomNavigationBarItem(
          label: "History",
          icon: Container(
            padding: EdgeInsets.all(4.h),
            child: getSvgImage("explore.svg",
                height: 20.h, width: 20.w, color: hintColor.withOpacity(0.6)),
          ),
          activeIcon: Container(
            padding: EdgeInsets.all(8.h),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [primaryGradientStart, primaryGradientEnd],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(16.h),
              boxShadow: [
                BoxShadow(
                  color: primaryGradientStart.withOpacity(0.3),
                  blurRadius: 12,
                  offset: Offset(0, 4),
                ),
              ],
            ),
            child: getSvgImage("explorer_bold.svg",
                height: 20.h, width: 20.w, color: Colors.white),
          ),
        ),
        BottomNavigationBarItem(
          label: "Reports",
          icon: Container(
            padding: EdgeInsets.all(4.h),
            child: getSvgImage("saved.svg",
                height: 20.h, width: 20.w, color: hintColor.withOpacity(0.6)),
          ),
          activeIcon: Container(
            padding: EdgeInsets.all(8.h),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [primaryGradientStart, primaryGradientEnd],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(16.h),
              boxShadow: [
                BoxShadow(
                  color: primaryGradientStart.withOpacity(0.3),
                  blurRadius: 12,
                  offset: Offset(0, 4),
                ),
              ],
            ),
            child: getSvgImage("saved_bold.svg",
                height: 20.h, width: 20.w, color: Colors.white),
          ),
        ),
        BottomNavigationBarItem(
          label: "Support",
          icon: Container(
            padding: EdgeInsets.all(4.h),
            child: getSvgImage("messages.svg",
                height: 20.h, width: 20.w, color: hintColor.withOpacity(0.6)),
          ),
          activeIcon: Container(
            padding: EdgeInsets.all(8.h),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [primaryGradientStart, primaryGradientEnd],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(16.h),
              boxShadow: [
                BoxShadow(
                  color: primaryGradientStart.withOpacity(0.3),
                  blurRadius: 12,
                  offset: Offset(0, 4),
                ),
              ],
            ),
            child: getSvgImage("message_bold.svg",
                height: 20.h, width: 20.w, color: Colors.white),
          ),
        ),
        BottomNavigationBarItem(
          label: "More",
          icon: Container(
            padding: EdgeInsets.all(4.h),
            child: getSvgImage("setting.svg",
                height: 20.h, width: 20.w, color: hintColor.withOpacity(0.6)),
          ),
          activeIcon: Container(
            padding: EdgeInsets.all(8.h),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [primaryGradientStart, primaryGradientEnd],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(16.h),
              boxShadow: [
                BoxShadow(
                  color: primaryGradientStart.withOpacity(0.3),
                  blurRadius: 12,
                  offset: Offset(0, 4),
                ),
              ],
            ),
            child: getSvgImage("setting_bold_icon.svg",
                height: 20.h, width: 20.w, color: Colors.white),
          ),
        ),
      ],
    );
  }
}
