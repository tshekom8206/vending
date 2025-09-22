import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter_svg/svg.dart';
import 'package:get/get.dart';
import 'package:khanyi_vending_app/util/color_category.dart';
import 'package:khanyi_vending_app/util/constant.dart';
import 'package:khanyi_vending_app/util/constant_widget.dart';
import 'package:khanyi_vending_app/view/home/tab/tab_more_screens/my_profiles/edit_profile_screen.dart';
import 'package:khanyi_vending_app/services/auth_service.dart';
import 'package:khanyi_vending_app/model/api_models.dart';

class MyProfile extends StatefulWidget {
  const MyProfile({Key? key}) : super(key: key);

  @override
  State<MyProfile> createState() => _MyProfileState();
}

class _MyProfileState extends State<MyProfile> {
  final AuthService _authService = Get.find<AuthService>();
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _refreshProfile();
  }

  void backClick() {
    Constant.backToFinish();
  }

  Future<void> _refreshProfile() async {
    if (!mounted) return;
    setState(() {
      _isLoading = true;
    });

    try {
      await _authService.refreshProfile();
    } catch (e) {
      print('Error refreshing profile: $e');
      Get.snackbar('Error', 'Failed to load profile data');
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () async {
        backClick();
        return false;
      },
      child: SafeArea(
          child: Scaffold(
        body: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            getVerSpace(20.h),
            getAppBar("My Profile", () {
              backClick();
            }),
            getVerSpace(40.h),
            Center(
              child: Stack(children: [
                getAssetImage("user_image.png", height: 100.h, width: 100.h),
                Container(
                  height: 30.h,
                  width: 30.h,
                  decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                            color: selectTabColor.withOpacity(0.14),
                            offset: const Offset(-4, 5),
                            blurRadius: 11),
                      ],
                      color: regularWhite),
                  child: SvgPicture.asset(
                    "${Constant.assetImagePath}edit_icon.svg",
                    height: 20.h,
                    width: 20.w,
                  ).paddingAll(5.h),
                ).paddingOnly(left: 70.h, top: 70.h)
              ]),
            ),
            Expanded(
                child: _isLoading
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            CircularProgressIndicator(color: pacificBlue),
                            getVerSpace(16.h),
                            getCustomFont("Loading profile...", 14.sp, hintColor, 1),
                          ],
                        ),
                      )
                    : Obx(() {
                        final user = _authService.currentUser.value;
                        if (user == null) {
                          return Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.person_off, size: 48.sp, color: hintColor),
                                getVerSpace(16.h),
                                getCustomFont("No profile data available", 14.sp, hintColor, 1),
                                getVerSpace(16.h),
                                ElevatedButton(
                                  onPressed: _refreshProfile,
                                  child: Text("Retry"),
                                ),
                              ],
                            ),
                          );
                        }

                        return RefreshIndicator(
                          onRefresh: _refreshProfile,
                          child: ListView(
                            children: [
                              getVerSpace(30.h),

                              // Full Name Section
                              getCustomFont("Full Name", 16.sp, hintColor, 1,
                                  fontWeight: FontWeight.w400, txtHeight: 1.5.h),
                              getVerSpace(6.h),
                              getCustomFont(
                                  user.fullName.isNotEmpty ? user.fullName : "Not provided",
                                  16.sp,
                                  user.fullName.isNotEmpty ? regularBlack : hintColor,
                                  1,
                                  fontWeight: FontWeight.w400,
                                  txtHeight: 1.5.h),
                              getVerSpace(20.h),
                              getDivider(setColor: dividerColor),
                              getVerSpace(20.h),

                              // Phone Number Section
                              getCustomFont("Phone Number", 16.sp, hintColor, 1,
                                  fontWeight: FontWeight.w400, txtHeight: 1.5.h),
                              getVerSpace(6.h),
                              getCustomFont(
                                  user.phone.isNotEmpty ? user.phone : "Not provided",
                                  16.sp,
                                  user.phone.isNotEmpty ? regularBlack : hintColor,
                                  1,
                                  fontWeight: FontWeight.w400,
                                  txtHeight: 1.5.h),
                              getVerSpace(20.h),
                              getDivider(setColor: dividerColor),
                              getVerSpace(20.h),

                              // Email Address Section
                              getCustomFont("Email Address", 16.sp, hintColor, 1,
                                  fontWeight: FontWeight.w400, txtHeight: 1.5.h),
                              getVerSpace(6.h),
                              getCustomFont(
                                  user.email.isNotEmpty ? user.email : "Not provided",
                                  16.sp,
                                  user.email.isNotEmpty ? regularBlack : hintColor,
                                  1,
                                  fontWeight: FontWeight.w400,
                                  txtHeight: 1.5.h),
                              getVerSpace(20.h),
                              getDivider(setColor: dividerColor),
                              getVerSpace(20.h),

                              // ID Number Section (if available)
                              if (user.idNumber != null && user.idNumber!.isNotEmpty) ...[
                                getCustomFont("ID Number", 16.sp, hintColor, 1,
                                    fontWeight: FontWeight.w400, txtHeight: 1.5.h),
                                getVerSpace(6.h),
                                getCustomFont(user.idNumber!, 16.sp, regularBlack, 1,
                                    fontWeight: FontWeight.w400, txtHeight: 1.5.h),
                                getVerSpace(20.h),
                                getDivider(setColor: dividerColor),
                                getVerSpace(20.h),
                              ],

                              // Account Status Section
                              getCustomFont("Account Status", 16.sp, hintColor, 1,
                                  fontWeight: FontWeight.w400, txtHeight: 1.5.h),
                              getVerSpace(6.h),
                              Row(
                                children: [
                                  Container(
                                    padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 4.h),
                                    decoration: BoxDecoration(
                                      color: user.isActive ? Colors.green.withOpacity(0.1) : Colors.red.withOpacity(0.1),
                                      borderRadius: BorderRadius.circular(12.r),
                                    ),
                                    child: getCustomFont(
                                      user.isActive ? "Active" : "Inactive",
                                      12.sp,
                                      user.isActive ? Colors.green : Colors.red,
                                      1,
                                      fontWeight: FontWeight.w500),
                                  ),
                                  getHorSpace(8.w),
                                  if (user.isVerified)
                                    Container(
                                      padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 4.h),
                                      decoration: BoxDecoration(
                                        color: Colors.blue.withOpacity(0.1),
                                        borderRadius: BorderRadius.circular(12.r),
                                      ),
                                      child: getCustomFont("Verified", 12.sp, Colors.blue, 1,
                                          fontWeight: FontWeight.w500),
                                    ),
                                ],
                              ),
                              getVerSpace(20.h),
                              getDivider(setColor: dividerColor),

                              // Debug section - can be removed in production
                              if (user.id.isEmpty) ...[
                                getVerSpace(20.h),
                                Container(
                                  padding: EdgeInsets.all(12.w),
                                  decoration: BoxDecoration(
                                    color: Colors.orange.withOpacity(0.1),
                                    borderRadius: BorderRadius.circular(8.r),
                                  ),
                                  child: getCustomFont(
                                    "⚠️ Profile data incomplete - some fields may be missing",
                                    12.sp,
                                    Colors.orange,
                                    2,
                                    fontWeight: FontWeight.w400
                                  ),
                                ),
                              ],
                            ],
                          ),
                        );
                      })),
            getButton(
                    context,
                    pacificBlue,
                    "Edit Profile",
                    buttonHeight: 60.h,
                    regularWhite, () {
              Get.to(EditProfile());
            }, borderRadius: BorderRadius.circular(16.h), 18.sp)
                .paddingOnly(bottom: 50.h)
          ],
        ).paddingSymmetric(horizontal: 20.h),
      )),
    );
  }
}
