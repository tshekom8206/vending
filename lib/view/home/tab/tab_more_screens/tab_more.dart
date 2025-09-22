import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';
import 'package:khanyi_vending_app/controller/controller.dart';
import 'package:khanyi_vending_app/util/color_category.dart';
import 'package:khanyi_vending_app/util/pref_data.dart';
import 'package:khanyi_vending_app/services/auth_service.dart';
import 'package:khanyi_vending_app/view/home/tab/tab_more_screens/help_center_screen.dart';
import 'package:khanyi_vending_app/view/home/tab/tab_more_screens/purchase_history/purchase_history_screen.dart';
import 'package:khanyi_vending_app/view/home/tab/tab_more_screens/my_profiles/my_profile_screen.dart';
import 'package:khanyi_vending_app/view/home/tab/tab_more_screens/notification_screen.dart';
import 'package:khanyi_vending_app/view/home/tab/tab_more_screens/privacy_security_screen.dart';
import 'package:khanyi_vending_app/view/login/login_screen.dart';

import '../../../../util/constant_widget.dart';

class TabMore extends StatefulWidget {
  const TabMore({Key? key}) : super(key: key);

  @override
  State<TabMore> createState() => _TabMoreState();
}

class _TabMoreState extends State<TabMore> {
  TabMoreScreenController tabMoreScreenController =
      Get.put(TabMoreScreenController());
  final AuthService _authService = Get.find<AuthService>();

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Stack(
          children: [
            Container(
              height: 259.h,
              width: double.infinity,
              decoration: BoxDecoration(
                  borderRadius: BorderRadius.only(
                      bottomLeft: (Radius.circular(16.h)),
                      bottomRight: (Radius.circular(16.h))),
                  color: pacificBlue),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  getVerSpace(20.h),
                  getCustomFont("Settings", 20.sp, regularWhite, 1,
                      fontWeight: FontWeight.w700, txtHeight: 1.5.h),
                  getVerSpace(20.h),
                  Row(
                    children: [
                      getAssetImage("user_image.png",
                          height: 80.h, width: 80.h),
                      getHorSpace(20.w),
                      Obx(() {
                        final user = _authService.currentUser.value;
                        return Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            getCustomFont(
                                user?.fullName ?? "Demo User", 18.sp, regularWhite, 1,
                                fontWeight: FontWeight.w600, txtHeight: 1.5.h),
                            getVerSpace(6.h),
                            getCustomFont(
                                user?.email ?? "demo@khanyisolutions.co.za", 14.sp, regularWhite, 1,
                                fontWeight: FontWeight.w400)
                          ],
                        );
                      })
                    ],
                  )
                ],
              ).paddingSymmetric(horizontal: 20.h),
            ),
            Container(
              height: 415.h,
              width: double.infinity,
              decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(16.h),
                  boxShadow: [
                    BoxShadow(
                        color: selectTabColor.withValues(alpha: 0.14),
                        offset: const Offset(-4, 5),
                        blurRadius: 11),
                  ],
                  color: regularWhite),
              child: Column(
                children: [
                  getVerSpace(30.h),
                  getSettingsOptionFormate("my_profile_icon.svg", "My Profile",
                      () {
                    Get.to(MyProfile());
                  }),
                  getVerSpace(20.h),
                  getSettingsOptionFormate("my_booking_icon.svg", "Purchase History",
                      () {
                    Get.to(PurchaseHistoryScreen());
                  }),
                  getVerSpace(20.h),
                  getSettingsOptionFormate(
                      "notification_circle_icon.svg", "Notification", () {
                    Get.to(NotificationScreen());
                  }),
                  getVerSpace(20.h),
                  getSettingsOptionFormate(
                      "privacy_icon.svg", "Privacy & Security", () {
                    Get.to(Privacy());
                  }),
                  getVerSpace(20.h),
                  getSettingsOptionFormate(
                      "help_center_icon.svg", "Khanyi Support", () {
                    Get.to(HelpCenter());
                  }),
                ],
              ),
            ).paddingOnly(top: 170.h, left: 20.h, right: 20.h)
          ],
        ),
        getVerSpace(36.h),
        Container(
          margin: EdgeInsets.symmetric(horizontal: 20.h),
          child: getButton(
            context,
            accentRed,
            "Logout",
            Colors.white,
            () {
              Get.defaultDialog(
                  barrierDismissible: false,
                  title: '',
                  content: Padding(
                    padding: EdgeInsets.only(left: 10.w, right: 10.w),
                    child: Column(
                      children: [
                        getMultilineCustomFont(
                            "Are you sure you want to Logout!",
                            24.sp,
                            regularBlack,
                            fontWeight: FontWeight.w700,
                            textAlign: TextAlign.center),
                        getVerSpace(30.h),
                        Row(
                          children: [
                            Expanded(
                                child: getButton(
                                    context, accentRed, "Yes", regularWhite,
                                    () {
                              PrefData.setIsSignIn(false);
                              Get.off(LoginScreen());
                            }, 18.sp,
                                    borderRadius: BorderRadius.circular(16.h),
                                    buttonHeight: 56.h)),
                            getHorSpace(10.w),
                            Expanded(
                                child: getButton(
                              context,
                              regularWhite,
                              "No",
                              pacificBlue,
                              () {
                                Get.back();
                              },
                              18.sp,
                              borderWidth: 1.h,
                              borderRadius:
                                  BorderRadius.all(Radius.circular(16.h)),
                              isBorder: true,
                              borderColor: pacificBlue,
                              buttonHeight: 56.h,
                            )),
                          ],
                        )
                      ],
                    ),
                  ));
            },
            18.sp,
            borderRadius: BorderRadius.circular(16.h),
            buttonHeight: 56.h,
            weight: FontWeight.w600,
          ),
        )
      ],
    );
  }
}
