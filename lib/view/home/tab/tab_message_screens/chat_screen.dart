import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get_utils/get_utils.dart';
import 'package:khanyi_vending_app/util/color_category.dart';
import 'package:khanyi_vending_app/util/constant.dart';
import 'package:khanyi_vending_app/util/constant_widget.dart';

class ChatScreen extends StatefulWidget {
  const ChatScreen({Key? key}) : super(key: key);

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  TextEditingController controller = TextEditingController();
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
          body: Column(
            children: [
              getVerSpace(26.h),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  getAppBar("Khanyi Support Team", () {
                    backClick();
                  }),
                  Row(
                    children: [
                      getSvgImage("call_icon.svg", height: 24.h, width: 24.h),
                      getHorSpace(20.w),
                      getSvgImage("video_chate.svg", height: 24.h, width: 24.h)
                    ],
                  )
                ],
              ).paddingSymmetric(horizontal: 20.h),
              getVerSpace(30.h),
              Expanded(
                child: ListView(
                  children: [
                    Center(
                        child: getCustomFont("TODAY", 14.sp, regularBlack, 1,
                            fontWeight: FontWeight.w400)),
                    getVerSpace(30.h),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // User message
                        getSendMessegeContainer(
                            "Hi, I purchased R100 electricity yesterday but didn't receive the token. My transaction reference is KV001234567890.",
                            height: 74.h,
                            width: 320.h),
                        getVerSpace(20.h),
                        
                        // Support response
                        getReciveMessege("Hello! I'm sorry to hear about the issue. Let me check your transaction immediately."),
                        getVerSpace(20.h),
                        
                        // Support follow-up
                        getReciveMessege(
                            "I found your transaction. The token was generated successfully but there was a network delay. I'm resending it to your phone now: 12345-67890-12345-67890",
                            height: 97.h,
                            width: 316.h),
                        getVerSpace(20.h),
                        
                        // User confirmation
                        getSendMessegeContainer(
                            "Perfect! I received the token now. Thank you for the quick help!",
                            height: 74.h,
                            width: 273.h),
                        getVerSpace(20.h),
                        
                        // Support closing
                        getReciveMessege(
                            "You're welcome! Your electricity has been credited to meter M12345678901234567890. Is there anything else I can help you with?",
                            height: 97.h,
                            width: 316.h),
                        getVerSpace(20.h),
                        
                        // User satisfied
                        getSendMessegeContainer(
                            "No, that's all. Great service!",
                            height: 45.h,
                            width: 200.h),
                        getVerSpace(20.h),
                        
                        // Support acknowledgment
                        getReciveMessege("Thank you for choosing Khanyi Solutions. Have a great day! 😊"),
                      ],
                    )
                  ],
                ).paddingSymmetric(horizontal: 20.h),
              ),
              defaultTextField(
                context,
                controller,
                "Send Message",
                suffixImage: "send_icon.svg",
                suffix: true,
              ).paddingOnly(bottom: 30.h, top: 51.h, left: 20.h, right: 20.h),
            ],
          ),
        ),
      ),
    );
  }
}
