import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';
import 'package:khanyi_vending_app/controller/controller.dart';
import 'package:khanyi_vending_app/services/auth_service.dart';

import '../../util/color_category.dart';
import '../../util/constant_widget.dart';

// ignore: must_be_immutable
class TabSignUp extends StatefulWidget {
  // ignore: prefer_typing_uninitialized_variables
  var pController;

  TabSignUp(this.pController, {Key? key}) : super(key: key);

  @override
  State<TabSignUp> createState() => _TabSignUpState();
}

class _TabSignUpState extends State<TabSignUp> {
  final SignUpController signUpController = Get.put(SignUpController());
  final AuthService authService = Get.find<AuthService>();

  @override
  Widget build(BuildContext context) {
    return Form(
      key: signUpController.signUpForm,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          getCustomFont("First Name", 16.sp, Colors.black, 1,
              fontWeight: FontWeight.w600, txtHeight: 1.5),
          getVerSpace(6.h),
          defaultTextField(context, signUpController.firstNameController, "Enter Your First Name",
              validator: (name) {
            if (name == null || name.isEmpty) {
              return 'Please enter first name';
            }
            return null;
          }),
          getVerSpace(20.h),
          getCustomFont("Last Name", 16.sp, Colors.black, 1,
              fontWeight: FontWeight.w600, txtHeight: 1.5),
          getVerSpace(6.h),
          defaultTextField(context, signUpController.lastNameController, "Enter Your Last Name",
              validator: (name) {
            if (name == null || name.isEmpty) {
              return 'Please enter last name';
            }
            return null;
          }),
          getVerSpace(20.h),
          getCustomFont("Email Address", 16.sp, Colors.black, 1,
              fontWeight: FontWeight.w600, txtHeight: 1.5),
          getVerSpace(6.h),
          defaultTextField(context, signUpController.emailController, "Email Address",
              validator: (email) {
            if (email == null || email.isEmpty) {
              return 'Please enter email address';
            } else {
              if (!RegExp(r'^.+@[a-zA-Z]+\.{1}[a-zA-Z]+(\.{0,1}[a-zA-Z]+)$')
                  .hasMatch(email)) {
                return 'Please enter valid email address';
              }
            }
            return null;
          }),
          getVerSpace(20.h),
          getCustomFont("Phone Number", 16.sp, Colors.black, 1,
              fontWeight: FontWeight.w600, txtHeight: 1.5),
          getVerSpace(6.h),
          getCountryTextField(
              context, signUpController.phoneController, "Enter Your Phone Number",
              validator: (phoneNumber) {
            if (phoneNumber == null ||
                phoneNumber.isEmpty ||
                phoneNumber.length < 10) {
              return 'Please enter Valid phone number';
            }
            return null;
          },
              prefix: true,
              keyboardType: TextInputType.number,
              inputFormatters: [FilteringTextInputFormatter.digitsOnly]),
          getVerSpace(20.h),
          getCustomFont("ID Number", 16.sp, Colors.black, 1,
              fontWeight: FontWeight.w600, txtHeight: 1.5),
          getVerSpace(6.h),
          defaultTextField(context, signUpController.idNumberController, "Enter Your ID Number",
              validator: (idNumber) {
            if (idNumber == null || idNumber.isEmpty) {
              return 'Please enter ID number';
            }
            return null;
          }),
          getVerSpace(20.h),
          getCustomFont("Password", 16.sp, Colors.black, 1,
              fontWeight: FontWeight.w600, txtHeight: 1.5),
          getVerSpace(6.h),
          defaultTextField(context, signUpController.passwordController, "Your Password",
              validator: (password) {
            if (password == null || password.isEmpty) {
              return 'Please enter password';
            }
            return null;
          }, suffix: true, suffixImage: "eye.svg"),
          getVerSpace(20.h),
          getCustomFont("Confirm Password", 16.sp, Colors.black, 1,
              fontWeight: FontWeight.w600, txtHeight: 1.5),
          getVerSpace(6.h),
          defaultTextField(context, signUpController.confirmPasswordController, "Confirm Your Password",
              validator: (confirmPassword) {
            if (confirmPassword == null || confirmPassword.isEmpty) {
              return 'Please confirm password';
            }
            return null;
          }, suffix: true, suffixImage: "eye.svg"),
          getVerSpace(50.h),
          getButton(context, pacificBlue, "Sign Up", Colors.white, () async {
            await signUpController.signUp();
          }, 18.sp,
              weight: FontWeight.w700,
              buttonHeight: 60.h,
              borderRadius: BorderRadius.circular(16.h))
        ],
      ).marginSymmetric(horizontal: 20.h),
    );
  }
}
