import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';
import 'package:khanyi_vending_app/datafile/datafile.dart';
import 'package:khanyi_vending_app/util/color_category.dart';
import 'package:khanyi_vending_app/util/constant_widget.dart';

import '../../controller/controller.dart';
import '../../model/intro_model.dart';
import '../../routes/app_routes.dart';
import '../../util/constant.dart';
import '../../util/pref_data.dart';

class IntroScreen extends StatefulWidget {
  const IntroScreen({Key? key}) : super(key: key);

  @override
  State<IntroScreen> createState() => _IntroScreenState();
}

class _IntroScreenState extends State<IntroScreen> {
  backClick() {
    Constant.closeApp();
  }

  PageController pageController = PageController(initialPage: 0);

  IntroController introController = Get.put(IntroController());
  List<ModelIntro> introLists = DataFile.introList;

  @override
  void initState() {
    super.initState();
    _checkLoginStatus();
  }

  _checkLoginStatus() async {
    bool isSignedIn = await PrefData.getIsSignIn();
    if (isSignedIn) {
      // User is already logged in, skip to home
      Future.delayed(Duration(milliseconds: 500), () {
        Get.offAllNamed(Routes.homeScreenRoute);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    Constant.setupSize(context);
    return WillPopScope(
      onWillPop: () async {
        backClick();
        return false;
      },
      child: Scaffold(
        backgroundColor: bgColor,
        body: SafeArea(
          child: GetBuilder<IntroController>(
            init: IntroController(),
            builder: (controller) => Stack(
              clipBehavior: Clip.none,
              children: [
                Container(
                  decoration: BoxDecoration(
                      image: DecorationImage(
                          image: AssetImage(Constant.assetImagePath +
                              introLists[controller.position.value].image),
                          fit: BoxFit.fill)),
                ),
                Positioned(
                  child: PageView.builder(
                    controller: pageController,
                    itemBuilder: (context, index) {
                      ModelIntro modelIntro = introLists[index];
                      return getMultilineCustomFont(
                              modelIntro.title,
                              34.sp,
                              Colors.black,
                              fontWeight: FontWeight.w700,
                              txtHeight: 1.5,
                            ).marginOnly(left: 20.h, right: 112.w, top: 40.h);
                    },
                    itemCount: introLists.length,
                    onPageChanged: (index) {
                      _onPageViewChange(index);
                    },
                  ),
                ),
                controller.position.value == introLists.length - 1
                    ? Align(
                        alignment: Alignment.bottomCenter,
                        child: getButton(context, pacificBlue, "Get Started",
                                Colors.white, () {
                          PrefData.setIsIntro(false);
                          Constant.sendToNext(context, Routes.loginRoute);
                        }, 18.sp,
                                weight: FontWeight.w700,
                                buttonHeight: 60.h,
                                borderRadius: BorderRadius.circular(16.h))
                            .marginOnly(right: 20.h, left: 20.h, bottom: 40.h),
                      )
                    : Column(
                        mainAxisAlignment: MainAxisAlignment.end,
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          GetBuilder<IntroController>(
                            init: IntroController(),
                            builder: (controller) => Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: List.generate(
                                introLists.length,
                                (position) {
                                  return getAssetImage(
                                          position == controller.position.value
                                              ? "select_dot.png"
                                              : "dot.png",
                                          width: 8.h,
                                          height: 8.h)
                                      .paddingOnly(
                                          left: position == 0 ? 0 : 4.h,
                                          right: 4.h);
                                },
                              ),
                            ),
                          ),
                          getVerSpace(20.h),
                          getButton(
                            context,
                            pacificBlue,
                            "Next",
                            Colors.white,
                            () {
                              pageController
                                  .jumpToPage(controller.position.value + 1);
                            },
                            18.sp,
                            borderRadius: BorderRadius.circular(16.h),
                            buttonHeight: 60.h,
                            weight: FontWeight.w700,
                          ),
                          getVerSpace(20.h),
                          GestureDetector(
                            onTap: () {
                              PrefData.setIsIntro(false);
                              Constant.sendToNext(context, Routes.loginRoute);
                            },
                            child: getCustomFont("Skip", 14.sp, Colors.white, 1,
                                fontWeight: FontWeight.w400,
                                textAlign: TextAlign.center),
                          ),
                          getVerSpace(20.h),
                        ],
                      ).marginSymmetric(horizontal: 20.h),
              ],
            ),
          ),
        ),
      ),
    );
  }

  _onPageViewChange(int page) {
    introController.onChange(page.obs);
  }
}
