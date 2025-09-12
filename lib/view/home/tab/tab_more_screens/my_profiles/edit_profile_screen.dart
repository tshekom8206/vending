import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:get/get.dart';
import 'package:khanyi_vending_app/controller/controller.dart';
import 'package:khanyi_vending_app/util/color_category.dart';
import 'package:khanyi_vending_app/util/constant.dart';
import 'package:khanyi_vending_app/util/constant_widget.dart';

class EditProfile extends StatefulWidget {
  const EditProfile({Key? key}) : super(key: key);

  @override
  State<EditProfile> createState() => _EditProfileState();
}

class _EditProfileState extends State<EditProfile> {
  EditscreenController editscreenController = Get.put(EditscreenController());
  void backClick() {
    Constant.backToFinish();
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
            getAppBar("Edit Profile", () {
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
                child: ListView(
              children: [
                getVerSpace(30.h),
                getCustomFont("Full Name", 16.sp, regularBlack, 1,
                    fontWeight: FontWeight.w600, txtHeight: 1.5.h),
                getVerSpace(6.h),
                getEditProfileOptionFormate(
                  hint: "Full Name",
                  userdetail: "Jacob Jones",
                ),
                getVerSpace(20.h),
                getCustomFont("Email Address", 16.sp, regularBlack, 1,
                    fontWeight: FontWeight.w600, txtHeight: 1.5.h),
                getVerSpace(6.h),
                getEditProfileOptionFormate(
                  hint: "Email Address",
                  userdetail: "jecobjones@gmail.com",
                ),
                getVerSpace(20.h),
                getCustomFont("Phone Number", 16.sp, regularBlack, 1,
                    fontWeight: FontWeight.w600, txtHeight: 1.5.h),
                getVerSpace(6.h),
                getEditProfileOptionFormate(
                  hint: "Phone Number",
                  userdetail: "(239) 555-0108",
                ),
              ],
            )),
            getButton(
                    context,
                    pacificBlue,
                    "Save",
                    buttonHeight: 60.h,
                    regularWhite, () {
              backClick();
            }, borderRadius: BorderRadius.circular(16.h), 18.sp)
                .paddingOnly(bottom: 50.h)
          ],
        ).paddingSymmetric(horizontal: 20.h),
      )),
    );
  }
}
