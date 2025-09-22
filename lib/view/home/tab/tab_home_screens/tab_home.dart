import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';
import 'package:khanyi_vending_app/controller/controller.dart';
import 'package:khanyi_vending_app/datafile/datafile.dart';
import 'package:khanyi_vending_app/util/color_category.dart';
import 'package:khanyi_vending_app/util/constant.dart';
import 'package:khanyi_vending_app/util/constant_widget.dart';
import 'package:khanyi_vending_app/view/home/tab/tab_home_screens/recomended_screen.dart';
import 'package:khanyi_vending_app/view/home/tab/tab_home_screens/search_screen.dart';
import 'package:khanyi_vending_app/view/home/tab/tab_home_screens/electricity_purchase_screen.dart';
import 'package:khanyi_vending_app/services/estate_service.dart';
import 'package:khanyi_vending_app/services/notification_service.dart';

import '../../../../model/category_model.dart';
import '../../../../model/recomended_model.dart';
import '../../../../model/complex_model.dart';
import '../../../../model/notification_model.dart';
import '../../../../model/api_models.dart';

class TabHome extends StatefulWidget {
  const TabHome({Key? key}) : super(key: key);

  @override
  State<TabHome> createState() => _TabHomeState();
}

class _TabHomeState extends State<TabHome> {
  TextEditingController searchController = TextEditingController();
  List<ModelCategory> categoryLists = DataFile.categoryList;
  HomeController controller = Get.put(HomeController());
  HomeApiController apiController = Get.put(HomeApiController());
  EstateService estateService = Get.put(EstateService());
  NotificationService notificationService = Get.put(NotificationService());
  List<ModelRecomended> recomendedLists = DataFile.recomendedList;
  List<ComplexModel> complexLists = DataFile.complexList;

  @override
  void initState() {
    super.initState();
    // Load estates and notifications after the frame is built to avoid setState during build
    WidgetsBinding.instance.addPostFrameCallback((_) {
      estateService.fetchEstates();
      notificationService.fetchNotifications();
    });
  }

  @override
  Widget build(BuildContext context) {
    return GetBuilder<HomeApiController>(
      init: HomeApiController(),
      builder: (homeApiController) => GetBuilder<HomeController>(
        init: HomeController(),
        builder: (homeController) => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          getVerSpace(20.h),
          Row(
            children: [
              getSvgImage("location.svg", height: 24.h, width: 24.h, color: pacificBlue),
              getHorSpace(12.h),
              Expanded(
                  child: getCustomFont("Johannesburg, South Africa", 18.sp, Colors.black, 1,
                      fontWeight: FontWeight.w600)),
              Container(
                width: 44.w,
                child: GestureDetector(
                  onTap: () => _showNotificationModal(context),
                  child: Stack(
                    clipBehavior: Clip.none,
                    children: [
                      Container(
                        height: 40.h,
                        width: 40.h,
                        decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(30.h),
                            boxShadow: [
                              BoxShadow(
                                  color: shadowColor,
                                  offset: Offset(-4, 5),
                                  blurRadius: 11)
                            ]),
                        padding: EdgeInsets.all(11.h),
                        child: getSvgImage("notification_bing.svg"),
                      ),
                      Obx(() => notificationService.unreadCount.value > 0 ?

                        Positioned(
                          right: -2.w,
                          top: -2.h,
                          child: Container(
                            width: 16.h,
                            height: 16.h,
                            decoration: BoxDecoration(
                              color: accentRed,
                              shape: BoxShape.circle,
                              border: Border.all(color: Colors.white, width: 2),
                            ),
                            child: Center(
                              child: Text(
                                notificationService.unreadCount.value.toString(),
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 9.sp,
                                  fontWeight: FontWeight.w600,
                                  fontFamily: 'SF UI Text',
                                ),
                              ),
                            ),
                          ),
                        ) : Container(),
                    )],
                  ),
                ),
              )
            ],
          ).marginSymmetric(horizontal: 20.h),
          getVerSpace(22.h),
          getCustomFont("Select your residential complex and purchase electricity instantly", 16.sp, hintColor, 1,
                  fontWeight: FontWeight.w400, txtHeight: 1.5)
              .marginSymmetric(horizontal: 20.h),
          getVerSpace(20.h),
          getSearchField("Search residential complexes...",
                  prefixiconimage: "search.svg",
                  suffixfunction: (){Get.to(SearchScreen());},
                  suffixiconimage: "filter_icon.svg",function: (){Get.to(SearchScreen());})
              .marginSymmetric(horizontal: 20.w),
          getVerSpace(20.h),
          Expanded(
              flex: 1,
              child: ListView(
                primary: true,
                shrinkWrap: false,
                children: [
                  Container(
                    margin: EdgeInsets.symmetric(horizontal: 20.h),
                    height: 146.h,
                    decoration: BoxDecoration(
                        color: pacificBlue,
                        borderRadius: BorderRadius.circular(16.h),
                        image: DecorationImage(
                            image: AssetImage("${Constant.assetImagePath}bg.png"),
                            fit: BoxFit.fill)),
                    padding: EdgeInsets.only(left: 25.h),
                    child: Stack(
                      alignment: Alignment.centerLeft,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            getMultilineCustomFont(
                                    "Khanyi Solutions\nSmart Electricity Vending", 16.sp, Colors.white,
                                    fontWeight: FontWeight.w600, txtHeight: 1.5)
                                .paddingOnly(right: 180.w),
                            getVerSpace(16.h),
                            GestureDetector(
                              onTap: () => Get.to(() => ElectricityPurchaseScreen(
                                complexName: 'Loading...', // Will be auto-filled from user data
                                tariffRate: 'R0.00/kWh', // Will be auto-filled from user data
                                meterNumber: 'Loading...', // Will be auto-filled from user data
                                unitNumber: 'Loading...', // Will be auto-filled from user data
                              )),
                              child: Container(
                                padding: EdgeInsets.symmetric(
                                    horizontal: 14.h, vertical: 8.h),
                                decoration: BoxDecoration(
                                    color: Colors.white,
                                    borderRadius: BorderRadius.circular(16.h)),
                                child: getCustomFont(
                                    "Purchase Electricity", 12.sp, Colors.black, 1,
                                    fontWeight: FontWeight.w600),
                              ),
                            )
                          ],
                        )
                      ],
                    ),
                  ),
                  getVerSpace(30.h),
                  getCustomFont("Complex Categories", 18.sp, Colors.black, 1,
                          fontWeight: FontWeight.w600, txtHeight: 1.5)
                      .marginSymmetric(horizontal: 20.h),
                  getVerSpace(20.h),
                  SizedBox(
                    height: 60.h,
                    child: ListView.builder(
                      itemCount: categoryLists.length,
                      primary: false,
                      shrinkWrap: true,
                      scrollDirection: Axis.horizontal,
                      itemBuilder: (context, index) {
                        ModelCategory modelCategory = categoryLists[index];
                        return GestureDetector(
                          onTap: () {
                            controller.categoryChange(index);
                          },
                          child: GetBuilder<HomeController>(
                            init: HomeController(),
                            builder: (controller) => Container(
                                alignment: Alignment.center,
                                padding: EdgeInsets.symmetric(horizontal: 18.h),
                                margin: EdgeInsets.only(
                                    left: index == 0 ? 20.h : 0, right: 20.h),
                                decoration: BoxDecoration(
                                    color: controller.category == index
                                        ? lightPacific
                                        : Colors.white,
                                    borderRadius: BorderRadius.circular(16.h),
                                    boxShadow: controller.category == index
                                        ? null
                                        : [
                                            BoxShadow(
                                                color: shadowColor,
                                                offset: Offset(-4, 5),
                                                blurRadius: 11)
                                          ]),
                                child: Row(
                                  children: [
                                    modelCategory.image == ""
                                        ? SizedBox()
                                        : Row(
                                            children: [
                                              getAssetImage(modelCategory.image,
                                                  width: 30.h, height: 30.h),
                                              getHorSpace(12.h),
                                            ],
                                          ),
                                    getCustomFont(
                                        modelCategory.name,
                                        16.sp,
                                        controller.category == index
                                            ? pacificBlue
                                            : Colors.black,
                                        1,
                                        fontWeight: controller.category == index
                                            ? FontWeight.w600
                                            : FontWeight.w400),
                                  ],
                                )),
                          ),
                        );
                      },
                    ),
                  ),
                  getVerSpace(30.h),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      getCustomFont("Available Residential Complexes", 18.sp, Colors.black, 1,
                          fontWeight: FontWeight.w600, txtHeight: 1.5),
                      GestureDetector(
                        onTap: () {
                          Get.to(RecomendedScreen());
                        },
                        child: getCustomFont("View All", 14.sp, hintColor, 1,
                            fontWeight: FontWeight.w400, txtHeight: 1.5),
                      )
                    ],
                  ).marginSymmetric(horizontal: 20.h),
                  SizedBox(
                    height: 340.h,
                    child: Obx(() {
                      if (estateService.isLoading.value) {
                        return Center(
                          child: CircularProgressIndicator(color: pacificBlue),
                        );
                      }

                      if (estateService.estates.isEmpty) {
                        return Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.home_work, size: 48.sp, color: hintColor),
                              getVerSpace(16.h),
                              getCustomFont("No estates available", 16.sp, hintColor, 1),
                              getVerSpace(16.h),
                              ElevatedButton(
                                onPressed: () => estateService.fetchEstates(),
                                child: Text("Retry"),
                              ),
                            ],
                          ),
                        );
                      }

                      return ListView.builder(
                        itemCount: estateService.estates.length,
                        primary: false,
                        shrinkWrap: true,
                        scrollDirection: Axis.horizontal,
                        itemBuilder: (context, index) {
                          Estate estate = estateService.estates[index];
                          return GestureDetector(
                            onTap: (){
                              Get.to(() => ElectricityPurchaseScreen(
                                complexName: estate.name,
                                tariffRate: estate.formattedTariff,
                                meterNumber: 'Loading...', // Will be auto-filled from user data
                                unitNumber: 'Loading...', // Will be auto-filled from user data
                              ));
                            },
                            child: Container(
                              margin: EdgeInsets.only(
                                  left: index == 0 ? 20.h : 0,
                                  right: 20.h,
                                  bottom: 40.h,
                                  top: 20.h),
                              width: 332.h,
                              decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(16.h),
                                  boxShadow: [
                                    BoxShadow(
                                        color: shadowColor,
                                        offset: Offset(-9, 12),
                                        blurRadius: 34)
                                  ]),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Container(
                                      height: 130.h,
                                      decoration: BoxDecoration(
                                          borderRadius: BorderRadius.vertical(
                                              top: Radius.circular(16.h)),
                                          image: estate.primaryImageUrl.isNotEmpty
                                              ? DecorationImage(
                                                  image: NetworkImage(
                                                      'http://localhost:3000${estate.primaryImageUrl}'),
                                                  fit: BoxFit.cover,
                                                  onError: (exception, stackTrace) {
                                                    print('Error loading image: $exception');
                                                  },
                                                )
                                              : DecorationImage(
                                                  image: AssetImage("${Constant.assetImagePath}recomended1.png"),
                                                  fit: BoxFit.cover,
                                                )),
                                      alignment: Alignment.topRight,
                                      child: Row(
                                        mainAxisAlignment: MainAxisAlignment.end,
                                        children: [
                                          GestureDetector(
                                            onTap: () {
                                              // TODO: Implement save/bookmark functionality for estates
                                            },
                                            child: Container(
                                              height: 36.h,
                                              width: 36.h,
                                              decoration: BoxDecoration(
                                                  shape: BoxShape.circle,
                                                  color:
                                                      regularBlack.withOpacity(0.50)),
                                              child: getSvgImage("savewithoutfill.svg",
                                                      height: 20.h, width: 20.w)
                                                  .marginAll(8.h),
                                            ),
                                          )
                                        ],
                                      ).paddingOnly(top: 12.h, right: 12.w)),
                                  Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      getVerSpace(13.h),
                                      getCustomFont(estate.name, 16.sp,
                                          Colors.black, 1,
                                          fontWeight: FontWeight.w600,
                                          txtHeight: 1.5),
                                      getVerSpace(12.h),
                                      Row(
                                        children: [
                                          getSvgImage("location_unselect.svg",
                                              height: 20.h, width: 20.h, color: pacificBlue),
                                          getHorSpace(12.h),
                                          Flexible(
                                            child: getCustomFont("${estate.address.city}, ${estate.address.province}",
                                                16.sp, hintColor, 1,
                                                fontWeight: FontWeight.w400),
                                          ),
                                          getHorSpace(8.h),
                                          getAssetImage("black_dot.png",
                                              height: 6.h, width: 6.w),
                                          getHorSpace(8.h),
                                          Flexible(
                                            child: getCustomFont(estate.type, 16.sp,
                                                hintColor, 1,
                                                fontWeight: FontWeight.w400),
                                          ),
                                        ],
                                      ),
                                      getVerSpace(16.h),
                                      Row(
                                        mainAxisAlignment:
                                            MainAxisAlignment.spaceBetween,
                                        children: [
                                          Row(
                                            children: [
                                              getCustomFont(
                                                  estate.formattedTariff,
                                                  14.sp,
                                                  pacificBlue,
                                                  1,
                                                  fontWeight: FontWeight.w600),
                                            ],
                                          ),
                                          Flexible(
                                            child: Row(
                                              mainAxisSize: MainAxisSize.min,
                                              children: [
                                                getSvgImage("maximize.svg",
                                                    height: 20.h, width: 20.w, color: pacificBlue),
                                                getHorSpace(7.w),
                                                Flexible(
                                                  child: getCustomFont("${estate.totalUnits}",
                                                      16.sp, regularBlack, 1,
                                                      fontWeight: FontWeight.w600),
                                                ),
                                                Flexible(
                                                  child: getCustomFont(" active units",
                                                      14.sp, regularBlack, 1,
                                                      fontWeight: FontWeight.w400),
                                                )
                                              ],
                                            ),
                                          )
                                        ],
                                      )
                                    ],
                                  ).paddingSymmetric(horizontal: 15.h),
                                  getVerSpace(15.h),
                                ],
                              ),
                            ),
                          );
                        },
                      );
                    }),
                  ),
                ],
              ))
        ],
        ),
      ),
    );
  }


  void _showNotificationModal(BuildContext context) {
    // Mark all notifications as read when modal is opened
    notificationService.markAllAsRead();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (BuildContext context) {
        return DraggableScrollableSheet(
          initialChildSize: 0.8,
          maxChildSize: 0.9,
          minChildSize: 0.5,
          builder: (context, scrollController) {
            return Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(20.h)),
              ),
              child: Column(
                children: [
                  Container(
                    padding: EdgeInsets.symmetric(horizontal: 20.h, vertical: 16.h),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        getCustomFont("Notifications", 18.sp, Colors.black, 1,
                            fontWeight: FontWeight.w600),
                        GestureDetector(
                          onTap: () => Navigator.pop(context),
                          child: Icon(Icons.close, size: 24.h, color: Colors.black),
                        )
                      ],
                    ),
                  ),
                  Divider(height: 1, color: Colors.grey.withOpacity(0.3)),
                  Expanded(
                    child: Obx(() => notificationService.isLoading.value
                      ? Center(child: CircularProgressIndicator())
                      : notificationService.notifications.isEmpty
                        ? Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.notifications_none, size: 64.h, color: Colors.grey),
                                getVerSpace(16.h),
                                getCustomFont("No notifications", 16.sp, Colors.grey, 1),
                              ],
                            ),
                          )
                        : ListView.builder(
                            controller: scrollController,
                            itemCount: notificationService.notifications.length,
                            itemBuilder: (context, index) {
                              NotificationModel notification = notificationService.notifications[index];
                              return _buildNotificationItem(notification, context);
                            },
                          ),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildNotificationItem(NotificationModel notification, BuildContext context) {
    return Container(
      margin: EdgeInsets.symmetric(horizontal: 20.h, vertical: 8.h),
      padding: EdgeInsets.all(16.h),
      decoration: BoxDecoration(
        color: notification.isRead ? Colors.white : lightPacific.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12.h),
        border: Border.all(color: Colors.grey.withOpacity(0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: EdgeInsets.symmetric(horizontal: 8.h, vertical: 4.h),
                decoration: BoxDecoration(
                  color: _getNotificationTypeColor(notification.type),
                  borderRadius: BorderRadius.circular(8.h),
                ),
                child: getCustomFont(
                  _getNotificationTypeLabel(notification.type),
                  12.sp,
                  Colors.white,
                  1,
                  fontWeight: FontWeight.w500,
                ),
              ),
              Spacer(),
              getCustomFont(
                _formatTimestamp(notification.timestamp),
                12.sp,
                hintColor,
                1,
                fontWeight: FontWeight.w400,
              ),
            ],
          ),
          getVerSpace(8.h),
          getCustomFont(
            notification.title,
            16.sp,
            Colors.black,
            1,
            fontWeight: FontWeight.w600,
          ),
          getVerSpace(4.h),
          getCustomFont(
            notification.message,
            14.sp,
            hintColor,
            3,
            fontWeight: FontWeight.w400,
            txtHeight: 1.4,
          ),
          if (notification.complexName != null) ...[
            getVerSpace(8.h),
            Row(
              children: [
                getSvgImage("location_unselect.svg", height: 16.h, width: 16.h, color: pacificBlue),
                getHorSpace(4.w),
                getCustomFont(
                  "${notification.complexName} - Unit ${notification.unitNumber}",
                  12.sp,
                  hintColor,
                  1,
                  fontWeight: FontWeight.w400,
                ),
              ],
            ),
          ],
          if (notification.currentBalance != null) ...[
            getVerSpace(8.h),
            getCustomFont(
              "Current Balance: R${notification.currentBalance!.toStringAsFixed(2)}",
              14.sp,
              notification.currentBalance! < 50 ? accentRed : pacificBlue,
              1,
              fontWeight: FontWeight.w600,
            ),
          ],
          if (notification.actionButton != null) ...[
            getVerSpace(12.h),
            GestureDetector(
              onTap: () {
                Navigator.pop(context);
                if (notification.actionButton == "Buy Now") {
                  Get.to(() => ElectricityPurchaseScreen(
                    complexName: notification.complexName ?? "Unknown Complex",
                    tariffRate: "R1.85",
                    meterNumber: "M${notification.unitNumber ?? "001"}",
                    unitNumber: notification.unitNumber ?? "001",
                  ));
                }
                _markNotificationAsRead(notification);
              },
              child: Container(
                padding: EdgeInsets.symmetric(horizontal: 16.h, vertical: 8.h),
                decoration: BoxDecoration(
                  color: pacificBlue,
                  borderRadius: BorderRadius.circular(8.h),
                ),
                child: getCustomFont(
                  notification.actionButton!,
                  14.sp,
                  Colors.white,
                  1,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Color _getNotificationTypeColor(String type) {
    switch (type) {
      case 'low_balance':
        return accentRed;  // Red for urgent/low balance
      case 'system':
        return hintColor;  // Neutral gray for system
      case 'purchase':
        return pacificBlue;  // Green for successful purchases
      case 'promotion':
        return accentRed.withOpacity(0.8);  // Lighter red for promotions
      default:
        return hintColor;
    }
  }

  String _getNotificationTypeLabel(String type) {
    switch (type) {
      case 'low_balance':
        return 'LOW BALANCE';
      case 'system':
        return 'SYSTEM';
      case 'purchase':
        return 'PURCHASE';
      case 'promotion':
        return 'PROMOTION';
      default:
        return 'INFO';
    }
  }

  String _formatTimestamp(DateTime timestamp) {
    DateTime now = DateTime.now();
    Duration difference = now.difference(timestamp);
    
    if (difference.inDays > 7) {
      return "${timestamp.day}/${timestamp.month}/${timestamp.year}";
    } else if (difference.inDays > 0) {
      return "${difference.inDays}d ago";
    } else if (difference.inHours > 0) {
      return "${difference.inHours}h ago";
    } else if (difference.inMinutes > 0) {
      return "${difference.inMinutes}m ago";
    } else {
      return "Just now";
    }
  }

  void _markNotificationAsRead(NotificationModel notification) {
    setState(() {
      notification.isRead = true;
    });
  }
}
