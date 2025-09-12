import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';
import 'package:khanyi_vending_app/controller/controller.dart';
import 'package:khanyi_vending_app/datafile/datafile.dart';
import 'package:khanyi_vending_app/util/color_category.dart';
import 'package:khanyi_vending_app/util/constant.dart';
import 'package:khanyi_vending_app/util/constant_widget.dart';
import 'package:khanyi_vending_app/view/home/tab/tab_home_screens/filterSheet/filter_screen.dart';
import 'package:khanyi_vending_app/view/home/tab/tab_home_screens/complex_selection_screen.dart';

import '../../../../model/search_histry_data.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({Key? key}) : super(key: key);

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  SearchScreenController searchScreenController = Get.put(SearchScreenController());
  List<Search> serchData = DataFile. getSearchData();
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
            body: GetBuilder<SearchScreenController>(
              init: SearchScreenController(),
              builder: (searchScreenController) =>Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  getVerSpace(28.h),
                  getAppBar("Search", () {
                    backClick();
                  },).paddingSymmetric(horizontal: 20.w),
                  getVerSpace(30.h),
                  getSearchField("Search residential complexes...",suffixfunction: (){
                    Get.to(FilterScreen());
                  },
                      prefixiconimage: "search.svg",
                      suffixiconimage: "filter_icon.svg",function: (){Get.to(SearchScreen());}).paddingSymmetric(horizontal: 20.w),
                  getVerSpace(20.h),
                  Row(mainAxisAlignment:MainAxisAlignment.spaceBetween,children: [
                    getCustomFont("Search Results", 14.sp, hintColor, 1,fontWeight: FontWeight.w400,txtHeight: 1.5.h),
                    getCustomFont("5 complexes found", 14.sp, pacificBlue, 1,fontWeight: FontWeight.w400,txtHeight: 1.5.h)
                  ],).paddingSymmetric(horizontal: 20.w),
                  getVerSpace(30.h),
                  Expanded(
                    child: ListView.builder(
                      itemCount: serchData.length,
                      physics: BouncingScrollPhysics(),
                      itemBuilder: (context, index) {
                        return GestureDetector(
                          onTap: (){
                            Get.to(() => ComplexSelectionScreen());
                          },
                          child: Row(
                            children: [
                              getAssetImage(serchData[index].image!,height: 70.h,width: 70.w),
                              getHorSpace(20.w),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  getCustomFont(serchData[index].name!, 15.sp, regularBlack, 1,fontWeight: FontWeight.w600,txtHeight: 1.5.h),
                                  getVerSpace(8.h),
                                  getCustomFont(serchData[index].address!, 12.sp, regularBlack, 1,fontWeight: FontWeight.w400,txtHeight: 1.5.h),
                                ],
                              )
                            ],
                          )
                        ).paddingSymmetric(horizontal: 17.w,vertical: 10.h);
                      },
                    ),
                  ),
                ],
              ),
            )
        ),
      ),
    );
  }
}
