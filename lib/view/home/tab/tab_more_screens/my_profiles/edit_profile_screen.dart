import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:get/get.dart';
import 'package:khanyi_vending_app/controller/controller.dart';
import 'package:khanyi_vending_app/util/color_category.dart';
import 'package:khanyi_vending_app/util/constant.dart';
import 'package:khanyi_vending_app/util/constant_widget.dart';
import 'package:khanyi_vending_app/services/auth_service.dart';
import 'package:khanyi_vending_app/model/api_models.dart';

class EditProfile extends StatefulWidget {
  const EditProfile({Key? key}) : super(key: key);

  @override
  State<EditProfile> createState() => _EditProfileState();
}

class _EditProfileState extends State<EditProfile> {
  final AuthService _authService = Get.find<AuthService>();
  final _formKey = GlobalKey<FormState>();

  late TextEditingController _firstNameController;
  late TextEditingController _lastNameController;
  late TextEditingController _phoneController;

  bool _isLoading = false;
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    _initializeControllers();
  }

  void _initializeControllers() {
    final user = _authService.currentUser.value;
    _firstNameController = TextEditingController(text: user?.firstName ?? '');
    _lastNameController = TextEditingController(text: user?.lastName ?? '');
    _phoneController = TextEditingController(text: user?.phone ?? '');
  }

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  void backClick() {
    Constant.backToFinish();
  }

  Future<void> _saveProfile() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    setState(() {
      _isSaving = true;
    });

    try {
      final success = await _authService.updateProfile(
        firstName: _firstNameController.text.trim(),
        lastName: _lastNameController.text.trim(),
        phone: _phoneController.text.trim(),
      );

      if (success) {
        Get.snackbar('Success', 'Profile updated successfully');
        backClick(); // Go back to profile screen
      }
    } catch (e) {
      print('Error saving profile: $e');
      Get.snackbar('Error', 'Failed to save profile changes');
    } finally {
      if (mounted) {
        setState(() {
          _isSaving = false;
        });
      }
    }
  }

  String? _validateName(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'This field is required';
    }
    if (value.trim().length < 2) {
      return 'Must be at least 2 characters';
    }
    if (value.trim().length > 50) {
      return 'Must be less than 50 characters';
    }
    return null;
  }

  String? _validatePhone(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Phone number is required';
    }
    // Basic South African phone validation
    final phoneRegex = RegExp(r'^\+27[0-9]{9}$|^0[0-9]{9}$');
    if (!phoneRegex.hasMatch(value.trim())) {
      return 'Enter a valid phone number (e.g., +27123456789 or 0123456789)';
    }
    return null;
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
                child: Form(
                  key: _formKey,
                  child: ListView(
                    children: [
                      getVerSpace(30.h),

                      // First Name Field
                      getCustomFont("First Name", 16.sp, regularBlack, 1,
                          fontWeight: FontWeight.w600, txtHeight: 1.5.h),
                      getVerSpace(6.h),
                      TextFormField(
                        controller: _firstNameController,
                        validator: _validateName,
                        decoration: InputDecoration(
                          hintText: "Enter first name",
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12.r),
                            borderSide: BorderSide(color: dividerColor),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12.r),
                            borderSide: BorderSide(color: dividerColor),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12.r),
                            borderSide: BorderSide(color: pacificBlue),
                          ),
                          contentPadding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 12.h),
                        ),
                      ),
                      getVerSpace(20.h),

                      // Last Name Field
                      getCustomFont("Last Name", 16.sp, regularBlack, 1,
                          fontWeight: FontWeight.w600, txtHeight: 1.5.h),
                      getVerSpace(6.h),
                      TextFormField(
                        controller: _lastNameController,
                        validator: _validateName,
                        decoration: InputDecoration(
                          hintText: "Enter last name",
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12.r),
                            borderSide: BorderSide(color: dividerColor),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12.r),
                            borderSide: BorderSide(color: dividerColor),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12.r),
                            borderSide: BorderSide(color: pacificBlue),
                          ),
                          contentPadding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 12.h),
                        ),
                      ),
                      getVerSpace(20.h),

                      // Email Address (Read-only display)
                      getCustomFont("Email Address", 16.sp, regularBlack, 1,
                          fontWeight: FontWeight.w600, txtHeight: 1.5.h),
                      getVerSpace(6.h),
                      Container(
                        padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 12.h),
                        decoration: BoxDecoration(
                          border: Border.all(color: dividerColor),
                          borderRadius: BorderRadius.circular(12.r),
                          color: Colors.grey.withOpacity(0.1),
                        ),
                        child: Row(
                          children: [
                            Expanded(
                              child: getCustomFont(
                                _authService.currentUser.value?.email ?? "Not provided",
                                14.sp,
                                hintColor,
                                1,
                              ),
                            ),
                            Icon(Icons.lock_outline, size: 16.sp, color: hintColor),
                          ],
                        ),
                      ),
                      getVerSpace(4.h),
                      getCustomFont("Email cannot be changed", 12.sp, hintColor, 1,
                          fontWeight: FontWeight.w400),
                      getVerSpace(20.h),

                      // Phone Number Field
                      getCustomFont("Phone Number", 16.sp, regularBlack, 1,
                          fontWeight: FontWeight.w600, txtHeight: 1.5.h),
                      getVerSpace(6.h),
                      TextFormField(
                        controller: _phoneController,
                        validator: _validatePhone,
                        keyboardType: TextInputType.phone,
                        decoration: InputDecoration(
                          hintText: "e.g., +27123456789 or 0123456789",
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12.r),
                            borderSide: BorderSide(color: dividerColor),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12.r),
                            borderSide: BorderSide(color: dividerColor),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12.r),
                            borderSide: BorderSide(color: pacificBlue),
                          ),
                          contentPadding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 12.h),
                        ),
                      ),
                      getVerSpace(20.h),

                      // Loading indicator when saving
                      if (_isSaving) ...[
                        Center(
                          child: Column(
                            children: [
                              CircularProgressIndicator(color: pacificBlue),
                              getVerSpace(8.h),
                              getCustomFont("Saving changes...", 14.sp, hintColor, 1),
                            ],
                          ),
                        ),
                        getVerSpace(20.h),
                      ],
                    ],
                  ),
                )),
            getButton(
                    context,
                    _isSaving ? hintColor : pacificBlue,
                    _isSaving ? "Saving..." : "Save",
                    buttonHeight: 60.h,
                    regularWhite, () {
              if (!_isSaving) {
                _saveProfile();
              }
            }, borderRadius: BorderRadius.circular(16.h), 18.sp)
                .paddingOnly(bottom: 50.h)
          ],
        ).paddingSymmetric(horizontal: 20.h),
      )),
    );
  }
}
