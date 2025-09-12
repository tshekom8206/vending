import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';
import 'package:khanyi_vending_app/controller/controller.dart';
import 'package:khanyi_vending_app/util/color_category.dart';
import 'package:khanyi_vending_app/util/constant.dart';
import 'package:khanyi_vending_app/util/constant_widget.dart';
import 'package:khanyi_vending_app/view/home/tab/tab_more_screens/booking_tab/active_booking.dart';
import 'package:khanyi_vending_app/view/home/tab/tab_more_screens/booking_tab/completed_booking.dart';

class MyBooking extends StatefulWidget {
  const MyBooking({Key? key}) : super(key: key);

  @override
  State<MyBooking> createState() => _MyBookingState();
}

class _MyBookingState extends State<MyBooking> {
  MyBookingScreenController myBookingScreenController =
      Get.put(MyBookingScreenController());
  PageController pageController = PageController();
  List bookingPage = [ActiveBooking(), CompletedBooking()];
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
        backgroundColor: bgColor,
        body: GetBuilder<MyBookingScreenController>(
          init: MyBookingScreenController(),
          builder: (myBookingScreenController) => Column(
            children: [
              getVerSpace(20.h),
              getAppBar("My Booking", () {
                backClick();
              }).paddingSymmetric(horizontal: 20.h),
              getVerSpace(30.h),
              getTabBar(myBookingScreenController.tabController,
                  myBookingScreenController.pController, [
                const Tab(
                  text: "Active ",
                ),
                const Tab(
                  text: "Completed ",
                ),
              ]).paddingSymmetric(horizontal: 20.w),
              getVerSpace(30.h),
              Expanded(
                child: PageView.builder(
                  controller: myBookingScreenController.pController,
                  onPageChanged: (value) {
                    myBookingScreenController.tabController.animateTo(value,
                        duration: const Duration(milliseconds: 300),
                        curve: Curves.ease);
                  },
                  itemCount: bookingPage.length,
                  itemBuilder: (context, index) {
                    return bookingPage[index];
                  },
                ),
              ),
            ],
          ),
        ),
      )),
    );
  }
}
