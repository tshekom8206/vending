import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';
import 'package:khanyi_vending_app/controller/controller.dart';
import 'package:khanyi_vending_app/util/constant.dart';
import 'package:khanyi_vending_app/view/home/tab/tab_home_screens/detail_screen.dart';
import 'package:khanyi_vending_app/services/estate_service.dart';
import 'package:khanyi_vending_app/model/api_models.dart';
import 'package:khanyi_vending_app/config/environment.dart';

import '../../../../util/color_category.dart';
import '../../../../util/constant_widget.dart';

class RecomendedScreen extends StatefulWidget {
  const RecomendedScreen({Key? key}) : super(key: key);

  @override
  State<RecomendedScreen> createState() => _RecomendedScreenState();
}

class _RecomendedScreenState extends State<RecomendedScreen> {
  void backClick() {
    Constant.backToFinish();
  }

  RecomendedScreenController recomendedScreenController =
      Get.put(RecomendedScreenController());
  EstateService estateService = Get.put(EstateService());
  TextEditingController searchController = TextEditingController();
  RxList<Estate> filteredEstates = <Estate>[].obs;
  RxString searchQuery = ''.obs;

  @override
  void initState() {
    super.initState();
    // No fetch calls here - use the already loaded estates from the home screen
  }

  void _onSearchChanged(String query) {
    searchQuery.value = query;
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
            body: GetBuilder<HomeController>(
          init: HomeController(),
          builder: (homecontroller) => Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              getVerSpace(28.h),
              getAppBar("Available Complexes", () {
                backClick();
              }).paddingSymmetric(horizontal: 20.w),
              getVerSpace(20.h),
              // Search Bar
              Container(
                margin: EdgeInsets.symmetric(horizontal: 20.w),
                decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16.h),
                    boxShadow: [
                      BoxShadow(
                          color: shadowColor.withOpacity(0.1),
                          offset: Offset(0, 2),
                          blurRadius: 8)
                    ]),
                child: TextField(
                  controller: searchController,
                  onChanged: _onSearchChanged,
                  decoration: InputDecoration(
                      hintText: 'Search estates by name or location...',
                      hintStyle: TextStyle(
                          fontSize: 14.sp,
                          color: hintColor,
                          fontWeight: FontWeight.w400),
                      prefixIcon:
                          Icon(Icons.search, color: hintColor, size: 20.h),
                      suffixIcon: Obx(() => searchQuery.value.isNotEmpty
                          ? IconButton(
                              icon: Icon(Icons.clear,
                                  color: hintColor, size: 20.h),
                              onPressed: () {
                                searchController.clear();
                                _onSearchChanged('');
                              },
                            )
                          : SizedBox.shrink()),
                      border: InputBorder.none,
                      contentPadding: EdgeInsets.symmetric(
                          horizontal: 16.w, vertical: 12.h)),
                ),
              ),
              getVerSpace(20.h),
              Expanded(
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
                          Icon(
                            Icons.home_outlined,
                            size: 48.h,
                            color: hintColor,
                          ),
                          getVerSpace(16.h),
                          getCustomFont(
                              'No estates available', 16.sp, regularBlack, 1,
                              fontWeight: FontWeight.w600),
                        ],
                      ),
                    );
                  }

                  // Calculate filtered list inline
                  List<Estate> displayEstates = searchQuery.value.isEmpty
                      ? estateService.estates
                      : estateService.searchEstates(searchQuery.value);

                  if (displayEstates.isEmpty && searchQuery.value.isNotEmpty) {
                    return Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.search_off,
                            size: 48.h,
                            color: hintColor,
                          ),
                          getVerSpace(16.h),
                          getCustomFont(
                              'No estates found', 16.sp, regularBlack, 1,
                              fontWeight: FontWeight.w600),
                          getVerSpace(8.h),
                          getCustomFont('Try searching with different keywords',
                              14.sp, hintColor, 1,
                              fontWeight: FontWeight.w400),
                        ],
                      ),
                    );
                  }

                  return ListView.builder(
                    itemCount: displayEstates.length,
                    physics: BouncingScrollPhysics(),
                    itemBuilder: (context, index) {
                      Estate estate = displayEstates[index];
                      return GestureDetector(
                        onTap: () {
                          Get.to(DetailScreen());
                        },
                        child: Container(
                          width: double.infinity,
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
                                                  '${Environment.baseUrl}${estate.primaryImageUrl}'),
                                              fit: BoxFit.cover)
                                          : DecorationImage(
                                              image: AssetImage(
                                                  "${Constant.assetImagePath}recomended1.png"),
                                              fit: BoxFit.cover)),
                                  alignment: Alignment.topRight,
                                  child: Row(
                                    mainAxisAlignment: MainAxisAlignment.end,
                                    children: [
                                      GestureDetector(
                                        onTap: () {
                                          // TODO: Implement save/favorite functionality for estates
                                          Get.snackbar('Info',
                                              'Favorite functionality not yet implemented');
                                        },
                                        child: Container(
                                          height: 36.h,
                                          width: 36.h,
                                          decoration: BoxDecoration(
                                              shape: BoxShape.circle,
                                              color: regularBlack
                                                  .withOpacity(0.50)),
                                          child: getSvgImage(
                                                  "savewithoutfill.svg",
                                                  height: 20.h,
                                                  width: 20.w)
                                              .marginAll(8.h),
                                        ),
                                      )
                                    ],
                                  ).paddingOnly(top: 12.h, right: 12.w)),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  getVerSpace(13.h),
                                  getCustomFont(
                                      estate.name, 16.sp, Colors.black, 1,
                                      fontWeight: FontWeight.w600,
                                      txtHeight: 1.5),
                                  getVerSpace(12.h),
                                  Row(
                                    children: [
                                      getSvgImage("location_unselect.svg",
                                          height: 20.h,
                                          width: 20.h,
                                          color: pacificBlue),
                                      getHorSpace(12.h),
                                      Expanded(
                                        child: getCustomFont(
                                            "${estate.address.city}, ${estate.address.province}",
                                            16.sp,
                                            hintColor,
                                            1,
                                            fontWeight: FontWeight.w400),
                                      ),
                                      getHorSpace(12.h),
                                      getAssetImage("black_dot.png",
                                          height: 6.h, width: 6.w),
                                      getHorSpace(12.h),
                                      getCustomFont(
                                          estate.type, 16.sp, hintColor, 1,
                                          fontWeight: FontWeight.w400),
                                    ],
                                  ),
                                  getVerSpace(16.h),
                                  Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceBetween,
                                    children: [
                                      Row(
                                        children: [
                                          getCustomFont(estate.formattedTariff,
                                              14.sp, pacificBlue, 1,
                                              fontWeight: FontWeight.w600),
                                          getHorSpace(2.w),
                                          getCustomFont("electricity", 14.sp,
                                              hintColor, 1,
                                              fontWeight: FontWeight.w400),
                                        ],
                                      ),
                                      Row(
                                        children: [
                                          getSvgImage("maximize.svg",
                                              height: 20.h, width: 20.w),
                                          getHorSpace(7.w),
                                          getCustomFont(
                                              "${estate.availableUnits}",
                                              16.sp,
                                              regularBlack,
                                              1,
                                              fontWeight: FontWeight.w600),
                                          getHorSpace(4.w),
                                          getCustomFont(
                                              "units", 12.sp, hintColor, 1,
                                              fontWeight: FontWeight.w400),
                                        ],
                                      )
                                    ],
                                  )
                                ],
                              ).paddingSymmetric(horizontal: 15.h),
                              getVerSpace(15.h)
                            ],
                          ),
                        ).paddingSymmetric(horizontal: 20.w, vertical: 10.h),
                      );
                    },
                  );
                }),
              ),
            ],
          ),
        )),
      ),
    );
  }
}
