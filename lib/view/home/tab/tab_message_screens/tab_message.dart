import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get_core/src/get_main.dart';
import 'package:get/get_navigation/get_navigation.dart';
import 'package:get/get_utils/get_utils.dart';
import 'package:khanyi_vending_app/datafile/datafile.dart';
import 'package:khanyi_vending_app/model/messege_model.dart';
import 'package:khanyi_vending_app/util/color_category.dart';
import 'package:khanyi_vending_app/util/constant.dart';
import 'package:khanyi_vending_app/util/constant_widget.dart';
import 'package:khanyi_vending_app/view/home/tab/tab_message_screens/chat_screen.dart';

class TabMessage extends StatefulWidget {
  const TabMessage({Key? key}) : super(key: key);

  @override
  State<TabMessage> createState() => _TabMessageState();
}

class _TabMessageState extends State<TabMessage> {
  List<Messege> messegeList = DataFile.getMessege();

  void backClick() {
    Constant.closeApp();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        getVerSpace(20.h),
        Row(
          children: [
            getCustomFont("Customer Support", 24.sp, Colors.black, 1,
                fontWeight: FontWeight.w700),
            Spacer(),
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
              child: getSvgImage("call_icon.svg"),
            ),
          ],
        ).paddingSymmetric(horizontal: 20.h),
        getVerSpace(12.h),
        getCustomFont("Get help with your electricity purchases and technical issues", 16.sp, hintColor, 1,
                fontWeight: FontWeight.w400, txtHeight: 1.5)
            .paddingSymmetric(horizontal: 20.h),
        getVerSpace(20.h),
        getSearchField("Search support conversations",
                prefixiconimage: "search.svg",
                prefixiconimageheight: 24.h,
                prefixiconimagewidth: 24.h)
            .paddingSymmetric(horizontal: 20.h),
        getVerSpace(30.h),
        Expanded(
            child: ListView.builder(
              padding: EdgeInsets.symmetric(horizontal: 20.h),
                itemCount: messegeList.length,
                itemBuilder: (context, index) {
                  Messege messege = messegeList[index];
                  return GestureDetector(
                    onTap: (){
                      Get.to(ChatScreen());
                    },
                    child: Column(
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Row(
                                children: [
                                  getAssetImage(messege.image!,
                                      height: 50.h, width: 50.h),
                                  getHorSpace(16.w),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        getCustomFont(
                                            messege.name!, 14.sp, regularBlack, 1,
                                            fontWeight: FontWeight.w600),
                                        getCustomFont(
                                            messege.messege!, 12.sp, hintColor, 2,
                                            fontWeight: FontWeight.w400),
                                      ],
                                    ),
                                  )
                                ],
                              ),
                            ),
                            getHorSpace(8.w),
                            getCustomFont(
                                messege.time!, 14.sp, regularBlack, 1,
                                fontWeight: FontWeight.w600),
                          ],
                        ).paddingSymmetric(vertical: 10.h),
                        getVerSpace(17.h),
                        getDivider(setColor: Color(0XFFF1F1F1)),
                      ],
                    ),
                  );
                }))
      ],
    );
  }
}
