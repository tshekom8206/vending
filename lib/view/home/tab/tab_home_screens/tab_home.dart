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
    // Get screen dimensions for responsive design
    final screenWidth = MediaQuery.of(context).size.width;
    final isTablet = screenWidth > 600; // Tablet detection

    return GetBuilder<HomeApiController>(
      init: HomeApiController(),
      builder: (homeApiController) => GetBuilder<HomeController>(
        init: HomeController(),
        builder: (homeController) => Scaffold(
          backgroundColor: Colors.grey[50],
          body: SafeArea(
            child: Column(
              children: [
                // Header Section
                _buildHeader(context, isTablet),

                // Main Content - Scrollable
                Expanded(
                  child: SingleChildScrollView(
                    physics: BouncingScrollPhysics(),
                    child: Column(
                      children: [
                        // Hero Banner
                        _buildHeroBanner(context, isTablet),

                        // Search Section
                        _buildSearchSection(context, isTablet),

                        // Estates Section
                        _buildEstatesSection(context, isTablet),

                        // Bottom padding
                        SizedBox(height: 20.h),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context, bool isTablet) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 16.h),
      child: Row(
        children: [
          getSvgImage("location.svg",
              height: isTablet ? 20.h : 24.h,
              width: isTablet ? 20.h : 24.h,
              color: pacificBlue),
          getHorSpace(12.w),
          Expanded(
            child: getCustomFont("Johannesburg, South Africa",
                isTablet ? 16.sp : 18.sp, Colors.black, 1,
                fontWeight: FontWeight.w600),
          ),
          GestureDetector(
            onTap: () => _showNotificationModal(context),
            child: Stack(
              clipBehavior: Clip.none,
              children: [
                Container(
                  height: isTablet ? 36.h : 40.h,
                  width: isTablet ? 36.h : 40.h,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20.h),
                    boxShadow: [
                      BoxShadow(
                          color: shadowColor,
                          offset: Offset(0, 2),
                          blurRadius: 8)
                    ],
                  ),
                  padding: EdgeInsets.all(10.h),
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
                              border: Border.all(color: Colors.white, width: 2),
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
        ],
      ),
    );
  }

  Widget _buildHeroBanner(BuildContext context, bool isTablet) {
    return Container(
      margin: EdgeInsets.symmetric(horizontal: 20.w, vertical: 16.h),
      child: getAnimatedCard(
        child: Container(
          height: isTablet ? 140.h : 160.h,
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [primaryGradientStart, primaryGradientEnd],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(20.h),
            boxShadow: [
              BoxShadow(
                color: primaryGradientStart.withOpacity(0.25),
                blurRadius: 18,
                offset: Offset(0, 10),
              ),
            ],
          ),
          child: Stack(
            children: [
              // Decorative blobs/circles
              Positioned(
                right: -20.w,
                top: -10.h,
                child: Container(
                  width: 120.w,
                  height: 120.w,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: Colors.white.withOpacity(0.08),
                  ),
                ),
              ),
              Positioned(
                right: 20.w,
                top: 22.h,
                child: Container(
                  width: 60.w,
                  height: 60.w,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: Colors.white.withOpacity(0.12),
                  ),
                ),
              ),
              // Content
              Padding(
                padding: EdgeInsets.all(20.h),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          getCustomFont(
                            "Smart Electricity\nVending System",
                            isTablet ? 16.sp : 18.sp,
                            Colors.white,
                            1,
                            fontWeight: FontWeight.w800,
                            txtHeight: 1.2,
                          ),
                          getVerSpace(12.h),
                          Row(
                            children: [
                              Icon(Icons.flash_on,
                                  color: Colors.white70, size: 16.h),
                              getHorSpace(6.w),
                              getCustomFont(
                                "Purchase electricity instantly",
                                isTablet ? 13.sp : 15.sp,
                                Colors.white.withOpacity(0.9),
                                1,
                                fontWeight: FontWeight.w500,
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    getGradientButton(
                      context,
                      "Buy Now",
                      () => Get.to(() => ElectricityPurchaseScreen(
                            complexName: 'Loading...',
                            tariffRate: 'R0.00/kWh',
                            meterNumber: 'Loading...',
                            unitNumber: 'Loading...',
                          )),
                      isTablet ? 13.sp : 14.sp,
                      gradientColors: [
                        Colors.white,
                        Colors.white.withOpacity(0.9)
                      ],
                      textColor: primaryGradientStart,
                      buttonHeight: isTablet ? 44.h : 48.h,
                      borderRadius: BorderRadius.circular(20.h),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        duration: Duration(milliseconds: 600),
        curve: Curves.elasticOut,
      ),
    );
  }

  Widget _buildSearchSection(BuildContext context, bool isTablet) {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 20.w),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Glass card with search and quick filters
          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16.h),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.04),
                  blurRadius: 12,
                  offset: Offset(0, 6),
                ),
              ],
              border: Border.all(color: Colors.black.withOpacity(0.04)),
            ),
            child: Padding(
              padding: EdgeInsets.all(12.h),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Headline
                  getCustomFont(
                    "Find your complex",
                    isTablet ? 14.sp : 16.sp,
                    Colors.black,
                    1,
                    fontWeight: FontWeight.w700,
                  ),
                  getVerSpace(8.h),
                  // Search field
                  getSearchField(
                    "Search residential complexes...",
                    prefixiconimage: "search.svg",
                    suffixfunction: () => Get.to(SearchScreen()),
                    suffixiconimage: "filter_icon.svg",
                    function: () => Get.to(SearchScreen()),
                  ),
                  getVerSpace(12.h),
                  // Quick filter chips
                  GetBuilder<HomeController>(
                    builder: (controller) => Wrap(
                      spacing: 8.w,
                      runSpacing: 8.h,
                      children: List.generate(categoryLists.length, (index) {
                        final item = categoryLists[index];
                        final bool selected =
                            controller.category.value == index;
                        return GestureDetector(
                          onTap: () => controller.categoryChange(index),
                          child: Container(
                            padding: EdgeInsets.symmetric(
                                horizontal: 12.w, vertical: 8.h),
                            decoration: BoxDecoration(
                              color: selected
                                  ? primaryGradientStart.withOpacity(0.12)
                                  : surfaceColor,
                              borderRadius: BorderRadius.circular(20.h),
                              border: Border.all(
                                color: selected
                                    ? primaryGradientStart
                                    : Colors.black.withOpacity(0.08),
                              ),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                if (item.image.isNotEmpty) ...[
                                  getAssetImage(item.image,
                                      width: 14.h, height: 14.h),
                                  getHorSpace(6.w),
                                ],
                                getCustomFont(
                                  item.name,
                                  isTablet ? 12.sp : 13.sp,
                                  selected ? primaryGradientStart : textPrimary,
                                  1,
                                  fontWeight: selected
                                      ? FontWeight.w700
                                      : FontWeight.w500,
                                ),
                              ],
                            ),
                          ),
                        );
                      }),
                    ),
                  ),
                ],
              ),
            ),
          ),
          getVerSpace(16.h),
        ],
      ),
    );
  }

  // Deprecated: categories section is replaced by quick filter chips in search

  Widget _buildEstatesSection(BuildContext context, bool isTablet) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            getCustomFont("Available Residential Complexes",
                isTablet ? 16.sp : 18.sp, Colors.black, 1,
                fontWeight: FontWeight.w600, txtHeight: 1.5),
            GestureDetector(
              onTap: () => Get.to(RecomendedScreen()),
              child: getCustomFont(
                  "View All", isTablet ? 12.sp : 14.sp, hintColor, 1,
                  fontWeight: FontWeight.w400, txtHeight: 1.5),
            )
          ],
        ).marginSymmetric(horizontal: 20.w),
        getVerSpace(16.h),
        SizedBox(
          height: isTablet ? 180.h : 200.h,
          child: GetBuilder<HomeController>(
            builder: (controller) => Obx(() {
              if (estateService.isLoading.value) {
                return Center(
                    child: CircularProgressIndicator(color: pacificBlue));
              }

              if (estateService.estates.isEmpty) {
                return Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.home_work, size: 40.sp, color: hintColor),
                      getVerSpace(12.h),
                      getCustomFont(
                          "No estates available", 14.sp, hintColor, 1),
                      getVerSpace(12.h),
                      ElevatedButton(
                        onPressed: () => estateService.fetchEstates(),
                        child: Text("Retry"),
                      ),
                    ],
                  ),
                );
              }

              // Filter estates based on selected category
              List<Estate> filteredEstates = _getFilteredEstates(
                  estateService.estates, controller.category.value);

              if (filteredEstates.isEmpty) {
                return Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.home_work, size: 40.sp, color: hintColor),
                      getVerSpace(12.h),
                      getCustomFont(
                          "No complexes available", 14.sp, hintColor, 1),
                    ],
                  ),
                );
              }

              return ListView.builder(
                itemCount: filteredEstates.length,
                scrollDirection: Axis.horizontal,
                padding: EdgeInsets.symmetric(horizontal: 20.w),
                itemBuilder: (context, index) {
                  Estate estate = filteredEstates[index];
                  return _buildEstateCard(estate, index, isTablet);
                },
              );
            }),
          ),
        ),
      ],
    );
  }

  Widget _buildEstateCard(Estate estate, int index, bool isTablet) {
    return GestureDetector(
      onTap: () {
        Get.to(() => ElectricityPurchaseScreen(
              complexName: estate.name,
              tariffRate: estate.formattedTariff,
              meterNumber: 'Loading...',
              unitNumber: 'Loading...',
            ));
      },
      child: Container(
        width: isTablet ? 240.w : 260.w,
        margin: EdgeInsets.only(right: 16.w),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16.h),
          boxShadow: [
            BoxShadow(
              color: shadowColor,
              offset: Offset(0, 4),
              blurRadius: 12,
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image Section
            Container(
              height: isTablet ? 80.h : 90.h,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.vertical(top: Radius.circular(16.h)),
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
                        image: AssetImage(
                            "${Constant.assetImagePath}recomended1.png"),
                        fit: BoxFit.cover,
                      ),
              ),
            ),
            // Content Section
            Padding(
              padding: EdgeInsets.all(isTablet ? 12.h : 14.h),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  getCustomFont(
                    estate.name,
                    isTablet ? 14.sp : 16.sp,
                    textPrimary,
                    1,
                    fontWeight: FontWeight.w700,
                    txtHeight: 1.2,
                  ),
                  getVerSpace(isTablet ? 6.h : 8.h),
                  Row(
                    children: [
                      Icon(Icons.location_on, color: pacificBlue, size: 14.h),
                      getHorSpace(4.w),
                      Expanded(
                        child: getCustomFont(
                          "${estate.address.city}, ${estate.address.province}",
                          isTablet ? 11.sp : 12.sp,
                          textSecondary,
                          1,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                  getVerSpace(isTablet ? 8.h : 10.h),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: EdgeInsets.symmetric(
                            horizontal: isTablet ? 8.w : 10.w,
                            vertical: isTablet ? 4.h : 5.h),
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [primaryGradientStart, primaryGradientEnd],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          borderRadius: BorderRadius.circular(8.h),
                        ),
                        child: getCustomFont(
                          estate.formattedTariff,
                          isTablet ? 10.sp : 12.sp,
                          Colors.white,
                          1,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      Row(
                        children: [
                          Icon(Icons.home_work,
                              color: textSecondary, size: 12.h),
                          getHorSpace(2.w),
                          getCustomFont(
                            "${estate.totalUnits} units",
                            isTablet ? 10.sp : 12.sp,
                            textSecondary,
                            1,
                            fontWeight: FontWeight.w600,
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

  List<Estate> _getFilteredEstates(List<Estate> estates, int categoryIndex) {
    if (categoryIndex == 0) {
      // "All Complexes" - return all estates
      return estates;
    } else if (categoryIndex == 1) {
      // "Residential" - filter by residential type
      return estates
          .where((estate) =>
              estate.type.toLowerCase().contains('residential') ||
              estate.type.toLowerCase().contains('residential complex'))
          .toList();
    } else if (categoryIndex == 2) {
      // "Student Housing" - filter by student accommodation
      return estates
          .where((estate) =>
              estate.type.toLowerCase().contains('student') ||
              estate.type.toLowerCase().contains('accommodation'))
          .toList();
    }
    return estates;
  }
}
