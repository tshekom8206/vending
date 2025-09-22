import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';
import 'package:khanyi_vending_app/controller/controller.dart';
import 'package:khanyi_vending_app/datafile/datafile.dart';
import 'package:khanyi_vending_app/model/notification_type_model.dart';
import 'package:khanyi_vending_app/util/color_category.dart';
import 'package:khanyi_vending_app/util/constant.dart';
import 'package:khanyi_vending_app/util/constant_widget.dart';
import 'package:khanyi_vending_app/services/notification_service.dart';

class NotificationScreen extends StatefulWidget {
  const NotificationScreen({Key? key}) : super(key: key);

  @override
  State<NotificationScreen> createState() => _NotificationScreenState();
}

class _NotificationScreenState extends State<NotificationScreen> {
  NotificationScreenController notificationScreenController =
      Get.put(NotificationScreenController());
  final NotificationService _notificationService = Get.find<NotificationService>();

  @override
  void initState() {
    super.initState();
    // Fetch notifications when the screen is opened
    _notificationService.fetchNotifications();
  }
  List<NotificationType> notificationType = DataFile.getNotificationType();

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
        body: GetBuilder<NotificationScreenController>(
          init: NotificationScreenController(),
          builder: (notificationScreenController) => Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              getVerSpace(20.h),
              getAppBar("Notifications", () {
                backClick();
              }).paddingSymmetric(horizontal: 20.h),
              getVerSpace(30.h),
              SizedBox(
                height: 50.h,
                child: ListView.builder(
                  itemCount: notificationType.length,
                  primary: false,
                  shrinkWrap: true,
                  scrollDirection: Axis.horizontal,
                  itemBuilder: (context, index) {
                    NotificationType category = notificationType[index];
                    return GestureDetector(
                      onTap: () {
                        notificationScreenController.categoryChange(index);
                      },
                      child: Container(
                          alignment: Alignment.center,
                          padding: EdgeInsets.symmetric(horizontal: 18.h),
                          margin: EdgeInsets.only(
                              left: index == 0 ? 20.h : 0, right: 20.h),
                          decoration: BoxDecoration(
                              color: notificationScreenController.category ==
                                      index
                                  ? lightPacific
                                  : Colors.white,
                              borderRadius: BorderRadius.circular(16.h),
                              boxShadow:
                                  notificationScreenController.category == index
                                      ? null
                                      : [
                                          BoxShadow(
                                              color: shadowColor,
                                              offset: Offset(-4, 5),
                                              blurRadius: 11)
                                        ]),
                          child: Row(
                            children: [
                              getCustomFont(
                                  category.name!,
                                  16.sp,
                                  notificationScreenController.category == index
                                      ? pacificBlue
                                      : Colors.black,
                                  1,
                                  fontWeight:
                                      notificationScreenController.category ==
                                              index
                                          ? FontWeight.w600
                                          : FontWeight.w400),
                            ],
                          )),
                    );
                  },
                ),
              ),
              getVerSpace(30.h),
              getCustomFont("Today", 16.sp, regularBlack, 1,
                      fontWeight: FontWeight.w600)
                  .paddingSymmetric(horizontal: 20.h),
              getVerSpace(20.h),
              Expanded(
                child: Obx(() {
                  if (_notificationService.isLoading.value) {
                    return Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          CircularProgressIndicator(color: pacificBlue),
                          getVerSpace(20.h),
                          getCustomFont("Loading notifications...", 16.sp, hintColor, 1,
                              fontWeight: FontWeight.w500),
                        ],
                      ),
                    );
                  }

                  final notifications = _notificationService.notifications;

                  if (notifications.isEmpty) {
                    return Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.notifications_outlined, size: 64.h, color: hintColor),
                          getVerSpace(20.h),
                          getCustomFont("No notifications", 16.sp, hintColor, 1,
                              fontWeight: FontWeight.w500),
                          getVerSpace(8.h),
                          getCustomFont("You're all caught up!", 14.sp, hintColor, 1,
                              fontWeight: FontWeight.w400),
                        ],
                      ),
                    );
                  }

                  return RefreshIndicator(
                    onRefresh: () => _notificationService.refreshNotifications(),
                    child: ListView.builder(
                      padding: EdgeInsets.symmetric(horizontal: 20.h),
                      itemCount: notifications.length,
                      itemBuilder: (context, index) {
                        final notification = notifications[index];
                        return Column(
                          children: [
                            GestureDetector(
                              onTap: () async {
                                if (!notification.isRead) {
                                  await _notificationService.markAsRead(notification.id);
                                }
                              },
                              child: Container(
                                width: double.infinity,
                                padding: EdgeInsets.all(16.h),
                                margin: EdgeInsets.only(bottom: 16.h),
                                decoration: BoxDecoration(
                                  color: notification.isRead ? Colors.white : lightPacific.withValues(alpha: 0.1),
                                  borderRadius: BorderRadius.circular(12.h),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.black.withValues(alpha: 0.05),
                                      blurRadius: 4,
                                      offset: Offset(0, 2),
                                    ),
                                  ],
                                ),
                                child: Row(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Container(
                                      width: 48.h,
                                      height: 48.h,
                                      decoration: BoxDecoration(
                                        color: _getNotificationIconColor(notification.type),
                                        borderRadius: BorderRadius.circular(24.h),
                                      ),
                                      child: Icon(
                                        _getNotificationIcon(notification.type),
                                        color: Colors.white,
                                        size: 24.h,
                                      ),
                                    ),
                                    getHorSpace(12.h),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Row(
                                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                            children: [
                                              Expanded(
                                                child: getCustomFont(
                                                  notification.title,
                                                  14.sp,
                                                  regularBlack,
                                                  2,
                                                  fontWeight: notification.isRead ? FontWeight.w500 : FontWeight.w600,
                                                ),
                                              ),
                                              getCustomFont(
                                                notification.formattedTime,
                                                12.sp,
                                                hintColor,
                                                1,
                                                fontWeight: FontWeight.w400,
                                              ),
                                            ],
                                          ),
                                          getVerSpace(4.h),
                                          getCustomFont(
                                            notification.message,
                                            13.sp,
                                            hintColor,
                                            3,
                                            fontWeight: FontWeight.w400,
                                          ),
                                          if (notification.actionButton != null) ...[
                                            getVerSpace(8.h),
                                            Align(
                                              alignment: Alignment.centerLeft,
                                              child: Container(
                                                padding: EdgeInsets.symmetric(horizontal: 12.h, vertical: 6.h),
                                                decoration: BoxDecoration(
                                                  color: pacificBlue,
                                                  borderRadius: BorderRadius.circular(6.h),
                                                ),
                                                child: getCustomFont(
                                                  notification.actionButton!,
                                                  12.sp,
                                                  Colors.white,
                                                  1,
                                                  fontWeight: FontWeight.w500,
                                                ),
                                              ),
                                            ),
                                          ],
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        );
                      },
                    ),
                  );
                }),
              )
            ],
          ),
        ),
      )),
    );
  }

  Color _getNotificationIconColor(String type) {
    switch (type.toLowerCase()) {
      case 'low_balance':
        return Colors.orange;
      case 'purchase':
        return Colors.green;
      case 'system':
        return pacificBlue;
      case 'promotion':
        return Colors.purple;
      default:
        return hintColor;
    }
  }

  IconData _getNotificationIcon(String type) {
    switch (type.toLowerCase()) {
      case 'low_balance':
        return Icons.battery_alert;
      case 'purchase':
        return Icons.payment;
      case 'system':
        return Icons.info;
      case 'promotion':
        return Icons.local_offer;
      default:
        return Icons.notifications;
    }
  }
}
//getNotificationDataFormat("notification1st.png", "Jenny Wilson", "10 min ago",firstText: "Just messaged you.check the message in ", secondText: "message tab."),
