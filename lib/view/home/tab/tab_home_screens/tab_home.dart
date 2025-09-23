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
                getSvgImage("location.svg",
                    height: 24.h, width: 24.h, color: pacificBlue),
                getHorSpace(12.h),
                Expanded(
                    child: getCustomFont(
                        "Johannesburg, South Africa", 18.sp, Colors.black, 1,
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
                        Obx(
                          () => notificationService.unreadCount.value > 0
                              ? Positioned(
                                  right: -2.w,
                                  top: -2.h,
                                  child: Container(
                                    width: 16.h,
                                    height: 16.h,
                                    decoration: BoxDecoration(
                                      color: accentRed,
                                      shape: BoxShape.circle,
                                      border: Border.all(
                                          color: Colors.white, width: 2),
                                    ),
                                    child: Center(
                                      child: Text(
                                        notificationService.unreadCount.value
                                            .toString(),
                                        style: TextStyle(
                                          color: Colors.white,
                                          fontSize: 9.sp,
                                          fontWeight: FontWeight.w600,
                                          fontFamily: 'SF UI Text',
                                        ),
                                      ),
                                    ),
                                  ),
                                )
                              : Container(),
                        )
                      ],
                    ),
                  ),
                )
              ],
            ).marginSymmetric(horizontal: 20.h),
            getVerSpace(22.h),
            getCustomFont(
                    "Select your residential complex and purchase electricity instantly",
                    16.sp,
                    hintColor,
                    1,
                    fontWeight: FontWeight.w400,
                    txtHeight: 1.5)
                .marginSymmetric(horizontal: 20.h),
            getVerSpace(20.h),
            getSearchField("Search residential complexes...",
                prefixiconimage: "search.svg",
                suffixfunction: () {
                  Get.to(SearchScreen());
                },
                suffixiconimage: "filter_icon.svg",
                function: () {
                  Get.to(SearchScreen());
                }).marginSymmetric(horizontal: 20.w),
            getVerSpace(20.h),
            Expanded(
                flex: 1,
                child: ListView(
                  primary: true,
                  shrinkWrap: false,
                  children: [
                    // Enhanced Hero Banner with Modern Design
                    getAnimatedCard(
                      child: Container(
                        height: 160.h,
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [primaryGradientStart, primaryGradientEnd],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          borderRadius: BorderRadius.circular(24.h),
                          boxShadow: [
                            BoxShadow(
                              color: primaryGradientStart.withOpacity(0.3),
                              blurRadius: 20,
                              offset: Offset(0, 10),
                            ),
                          ],
                        ),
                        child: Stack(
                          children: [
                            // Background Pattern
                            Positioned(
                              right: -20.w,
                              top: -20.h,
                              child: Container(
                                width: 120.w,
                                height: 120.h,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: Colors.white.withOpacity(0.1),
                                ),
                              ),
                            ),
                            Positioned(
                              right: 20.w,
                              top: 20.h,
                              child: Container(
                                width: 60.w,
                                height: 60.h,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: Colors.white.withOpacity(0.15),
                                ),
                              ),
                            ),
                            // Content
                            Padding(
                              padding: EdgeInsets.all(24.h),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Row(
                                    children: [
                                      Icon(
                                        Icons.flash_on,
                                        color: Colors.white,
                                        size: 28.h,
                                      ),
                                      getHorSpace(12.w),
                                      Expanded(
                                        child: getMultilineCustomFont(
                                          "Smart Electricity\nVending System",
                                          18.sp,
                                          Colors.white,
                                          fontWeight: FontWeight.w700,
                                          txtHeight: 1.3,
                                        ),
                                      ),
                                    ],
                                  ),
                                  getVerSpace(20.h),
                                  getGradientButton(
                                    context,
                                    "Purchase Now",
                                    () =>
                                        Get.to(() => ElectricityPurchaseScreen(
                                              complexName: 'Loading...',
                                              tariffRate: 'R0.00/kWh',
                                              meterNumber: 'Loading...',
                                              unitNumber: 'Loading...',
                                            )),
                                    14.sp,
                                    gradientColors: [
                                      Colors.white,
                                      Colors.white.withOpacity(0.9)
                                    ],
                                    textColor: primaryGradientStart,
                                    buttonHeight: 44.h,
                                    borderRadius: BorderRadius.circular(22.h),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                      margin: EdgeInsets.symmetric(horizontal: 20.h),
                      duration: Duration(milliseconds: 600),
                      curve: Curves.elasticOut,
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
                              builder: (controller) => getAnimatedCard(
                                child: Container(
                                  alignment: Alignment.center,
                                  padding: EdgeInsets.symmetric(
                                      horizontal: 20.h, vertical: 16.h),
                                  decoration: BoxDecoration(
                                    gradient: controller.category == index
                                        ? LinearGradient(
                                            colors: [
                                              primaryGradientStart,
                                              primaryGradientEnd
                                            ],
                                            begin: Alignment.topLeft,
                                            end: Alignment.bottomRight,
                                          )
                                        : LinearGradient(
                                            colors: [
                                              Colors.white,
                                              surfaceColor
                                            ],
                                            begin: Alignment.topLeft,
                                            end: Alignment.bottomRight,
                                          ),
                                    borderRadius: BorderRadius.circular(20.h),
                                    boxShadow: [
                                      BoxShadow(
                                        color: controller.category == index
                                            ? primaryGradientStart
                                                .withOpacity(0.3)
                                            : shadowColor,
                                        offset: Offset(0, 8),
                                        blurRadius: 15,
                                      ),
                                    ],
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      if (modelCategory.image != "")
                                        Row(
                                          children: [
                                            Container(
                                              padding: EdgeInsets.all(8.h),
                                              decoration: BoxDecoration(
                                                color:
                                                    controller.category == index
                                                        ? Colors.white
                                                            .withOpacity(0.2)
                                                        : primaryGradientStart
                                                            .withOpacity(0.1),
                                                borderRadius:
                                                    BorderRadius.circular(12.h),
                                              ),
                                              child: getAssetImage(
                                                modelCategory.image,
                                                width: 24.h,
                                                height: 24.h,
                                              ),
                                            ),
                                            getHorSpace(12.h),
                                          ],
                                        ),
                                      getCustomFont(
                                        modelCategory.name,
                                        16.sp,
                                        controller.category == index
                                            ? Colors.white
                                            : textPrimary,
                                        1,
                                        fontWeight: controller.category == index
                                            ? FontWeight.w700
                                            : FontWeight.w600,
                                      ),
                                    ],
                                  ),
                                ),
                                margin: EdgeInsets.only(
                                  left: index == 0 ? 20.h : 0,
                                  right: 20.h,
                                ),
                                duration: Duration(milliseconds: 300),
                                curve: Curves.easeInOut,
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                    getVerSpace(30.h),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        getCustomFont("Available Residential Complexes", 18.sp,
                            Colors.black, 1,
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
                            child:
                                CircularProgressIndicator(color: pacificBlue),
                          );
                        }

                        if (estateService.estates.isEmpty) {
                          return Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.home_work,
                                    size: 48.sp, color: hintColor),
                                getVerSpace(16.h),
                                getCustomFont("No estates available", 16.sp,
                                    hintColor, 1),
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
                              onTap: () {
                                Get.to(() => ElectricityPurchaseScreen(
                                      complexName: estate.name,
                                      tariffRate: estate.formattedTariff,
                                      meterNumber: 'Loading...',
                                      unitNumber: 'Loading...',
                                    ));
                              },
                              child: getAnimatedCard(
                                child: Container(
                                  width: 340.h,
                                  decoration: BoxDecoration(
                                    gradient: LinearGradient(
                                      colors: [cardColor, surfaceColor],
                                      begin: Alignment.topLeft,
                                      end: Alignment.bottomRight,
                                    ),
                                    borderRadius: BorderRadius.circular(24.h),
                                    boxShadow: [
                                      BoxShadow(
                                        color: shadowColor,
                                        offset: Offset(0, 12),
                                        blurRadius: 25,
                                      ),
                                    ],
                                  ),
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      // Enhanced Image Section
                                      Container(
                                        height: 140.h,
                                        decoration: BoxDecoration(
                                          borderRadius: BorderRadius.vertical(
                                            top: Radius.circular(24.h),
                                          ),
                                          image: estate
                                                  .primaryImageUrl.isNotEmpty
                                              ? DecorationImage(
                                                  image: NetworkImage(
                                                    'http://localhost:3000${estate.primaryImageUrl}',
                                                  ),
                                                  fit: BoxFit.cover,
                                                  onError:
                                                      (exception, stackTrace) {
                                                    print(
                                                        'Error loading image: $exception');
                                                  },
                                                )
                                              : DecorationImage(
                                                  image: AssetImage(
                                                      "${Constant.assetImagePath}recomended1.png"),
                                                  fit: BoxFit.cover,
                                                ),
                                        ),
                                        child: Stack(
                                          children: [
                                            // Gradient Overlay
                                            Container(
                                              decoration: BoxDecoration(
                                                borderRadius:
                                                    BorderRadius.vertical(
                                                  top: Radius.circular(24.h),
                                                ),
                                                gradient: LinearGradient(
                                                  colors: [
                                                    Colors.transparent,
                                                    Colors.black
                                                        .withOpacity(0.3),
                                                  ],
                                                  begin: Alignment.topCenter,
                                                  end: Alignment.bottomCenter,
                                                ),
                                              ),
                                            ),
                                            // Bookmark Button
                                            Positioned(
                                              top: 16.h,
                                              right: 16.w,
                                              child: Container(
                                                height: 40.h,
                                                width: 40.h,
                                                decoration: BoxDecoration(
                                                  color: Colors.white
                                                      .withOpacity(0.9),
                                                  shape: BoxShape.circle,
                                                  boxShadow: [
                                                    BoxShadow(
                                                      color: Colors.black
                                                          .withOpacity(0.1),
                                                      blurRadius: 8,
                                                      offset: Offset(0, 4),
                                                    ),
                                                  ],
                                                ),
                                                child: Icon(
                                                  Icons.bookmark_border,
                                                  color: pacificBlue,
                                                  size: 20.h,
                                                ),
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                      // Enhanced Content Section
                                      Padding(
                                        padding: EdgeInsets.all(20.h),
                                        child: Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                            // Estate Name with Modern Typography
                                            getCustomFont(
                                              estate.name,
                                              18.sp,
                                              textPrimary,
                                              1,
                                              fontWeight: FontWeight.w700,
                                              txtHeight: 1.3,
                                            ),
                                            getVerSpace(12.h),
                                            // Location with Enhanced Icon
                                            Row(
                                              children: [
                                                Container(
                                                  padding: EdgeInsets.all(6.h),
                                                  decoration: BoxDecoration(
                                                    color: primaryGradientStart
                                                        .withOpacity(0.1),
                                                    borderRadius:
                                                        BorderRadius.circular(
                                                            8.h),
                                                  ),
                                                  child: Icon(
                                                    Icons.location_on,
                                                    color: primaryGradientStart,
                                                    size: 16.h,
                                                  ),
                                                ),
                                                getHorSpace(8.w),
                                                Expanded(
                                                  child: getCustomFont(
                                                    "${estate.address.city}, ${estate.address.province}",
                                                    14.sp,
                                                    textSecondary,
                                                    1,
                                                    fontWeight: FontWeight.w500,
                                                  ),
                                                ),
                                              ],
                                            ),
                                            getVerSpace(8.h),
                                            // Estate Type
                                            Container(
                                              padding: EdgeInsets.symmetric(
                                                horizontal: 12.h,
                                                vertical: 6.h,
                                              ),
                                              decoration: BoxDecoration(
                                                color: secondaryGradientStart
                                                    .withOpacity(0.1),
                                                borderRadius:
                                                    BorderRadius.circular(12.h),
                                              ),
                                              child: getCustomFont(
                                                estate.type,
                                                12.sp,
                                                secondaryGradientStart,
                                                1,
                                                fontWeight: FontWeight.w600,
                                              ),
                                            ),
                                            getVerSpace(16.h),
                                            // Enhanced Bottom Section
                                            Row(
                                              mainAxisAlignment:
                                                  MainAxisAlignment
                                                      .spaceBetween,
                                              children: [
                                                // Tariff Rate with Modern Design
                                                Container(
                                                  padding: EdgeInsets.symmetric(
                                                    horizontal: 12.h,
                                                    vertical: 8.h,
                                                  ),
                                                  decoration: BoxDecoration(
                                                    gradient: LinearGradient(
                                                      colors: [
                                                        primaryGradientStart,
                                                        primaryGradientEnd
                                                      ],
                                                      begin: Alignment.topLeft,
                                                      end:
                                                          Alignment.bottomRight,
                                                    ),
                                                    borderRadius:
                                                        BorderRadius.circular(
                                                            12.h),
                                                  ),
                                                  child: getCustomFont(
                                                    estate.formattedTariff,
                                                    14.sp,
                                                    Colors.white,
                                                    1,
                                                    fontWeight: FontWeight.w700,
                                                  ),
                                                ),
                                                // Units Count with Icon
                                                Row(
                                                  children: [
                                                    Icon(
                                                      Icons.home_work,
                                                      color: textSecondary,
                                                      size: 16.h,
                                                    ),
                                                    getHorSpace(4.w),
                                                    getCustomFont(
                                                      "${estate.totalUnits} units",
                                                      14.sp,
                                                      textSecondary,
                                                      1,
                                                      fontWeight:
                                                          FontWeight.w600,
                                                    ),
                                                  ],
                                                ),
                                              ],
                                            ),
                                          ],
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                margin: EdgeInsets.only(
                                  left: index == 0 ? 20.h : 0,
                                  right: 20.h,
                                  bottom: 40.h,
                                  top: 20.h,
                                ),
                                duration:
                                    Duration(milliseconds: 400 + (index * 100)),
                                curve: Curves.easeOutBack,
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
                    padding:
                        EdgeInsets.symmetric(horizontal: 20.h, vertical: 16.h),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        getCustomFont("Notifications", 18.sp, Colors.black, 1,
                            fontWeight: FontWeight.w600),
                        GestureDetector(
                          onTap: () => Navigator.pop(context),
                          child: Icon(Icons.close,
                              size: 24.h, color: Colors.black),
                        )
                      ],
                    ),
                  ),
                  Divider(height: 1, color: Colors.grey.withOpacity(0.3)),
                  Expanded(
                    child: Obx(
                      () => notificationService.isLoading.value
                          ? Center(child: CircularProgressIndicator())
                          : notificationService.notifications.isEmpty
                              ? Center(
                                  child: Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Icon(Icons.notifications_none,
                                          size: 64.h, color: Colors.grey),
                                      getVerSpace(16.h),
                                      getCustomFont("No notifications", 16.sp,
                                          Colors.grey, 1),
                                    ],
                                  ),
                                )
                              : ListView.builder(
                                  controller: scrollController,
                                  itemCount:
                                      notificationService.notifications.length,
                                  itemBuilder: (context, index) {
                                    NotificationModel notification =
                                        notificationService
                                            .notifications[index];
                                    return _buildNotificationItem(
                                        notification, context);
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

  Widget _buildNotificationItem(
      NotificationModel notification, BuildContext context) {
    return Container(
      margin: EdgeInsets.symmetric(horizontal: 20.h, vertical: 8.h),
      padding: EdgeInsets.all(16.h),
      decoration: BoxDecoration(
        color:
            notification.isRead ? Colors.white : lightPacific.withOpacity(0.1),
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
                getSvgImage("location_unselect.svg",
                    height: 16.h, width: 16.h, color: pacificBlue),
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
                        complexName:
                            notification.complexName ?? "Unknown Complex",
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
        return accentRed; // Red for urgent/low balance
      case 'system':
        return hintColor; // Neutral gray for system
      case 'purchase':
        return pacificBlue; // Green for successful purchases
      case 'promotion':
        return accentRed.withOpacity(0.8); // Lighter red for promotions
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
