import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';
import 'package:khanyi_vending_app/util/constant.dart';
import 'package:khanyi_vending_app/util/constant_widget.dart';
import 'package:khanyi_vending_app/util/color_category.dart';
import 'package:khanyi_vending_app/model/electricity_purchase_model.dart';
import 'package:khanyi_vending_app/datafile/datafile.dart';

class TabExplore extends StatefulWidget {
  const TabExplore({Key? key}) : super(key: key);

  @override
  State<TabExplore> createState() => _TabExploreState();
}

class _TabExploreState extends State<TabExplore> {
  List<ElectricityPurchaseModel> purchaseHistory = DataFile.purchaseHistory;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: bgColor,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            getVerSpace(20.h),
            Row(
              children: [
                getCustomFont("Purchase History", 24.sp, Colors.black, 1,
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
                  child: getSvgImage("filter_icon.svg"),
                ),
              ],
            ).marginSymmetric(horizontal: 20.h),
            getVerSpace(10.h),
            getCustomFont("Your electricity purchase transactions", 16.sp, hintColor, 1,
                fontWeight: FontWeight.w400)
                .marginSymmetric(horizontal: 20.h),
            getVerSpace(20.h),
            Expanded(
              child: purchaseHistory.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          getSvgImage("setting.svg", height: 80.h, width: 80.h),
                          getVerSpace(20.h),
                          getCustomFont("No purchases yet", 18.sp, Colors.black, 1,
                              fontWeight: FontWeight.w600),
                          getVerSpace(8.h),
                          getCustomFont("Start buying electricity to see your history here", 14.sp, hintColor, 1,
                              fontWeight: FontWeight.w400, textAlign: TextAlign.center),
                        ],
                      ),
                    )
                  : ListView.builder(
                      padding: EdgeInsets.symmetric(horizontal: 20.h),
                      itemCount: purchaseHistory.length,
                      itemBuilder: (context, index) {
                        ElectricityPurchaseModel purchase = purchaseHistory[index];
                        return Container(
                          margin: EdgeInsets.only(bottom: 16.h),
                          padding: EdgeInsets.all(16.h),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(16.h),
                            boxShadow: [
                              BoxShadow(
                                  color: shadowColor,
                                  offset: Offset(-4, 5),
                                  blurRadius: 11)
                            ],
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        getCustomFont(purchase.complexName, 16.sp, Colors.black, 1,
                                            fontWeight: FontWeight.w600),
                                        getVerSpace(4.h),
                                        getCustomFont("Unit ${purchase.unitNumber}", 14.sp, hintColor, 1,
                                            fontWeight: FontWeight.w400),
                                      ],
                                    ),
                                  ),
                                  Container(
                                    padding: EdgeInsets.symmetric(horizontal: 12.h, vertical: 6.h),
                                    decoration: BoxDecoration(
                                      color: purchase.status == "Completed" ? pacificBlue.withOpacity(0.1) : Colors.orange.withOpacity(0.1),
                                      borderRadius: BorderRadius.circular(8.h),
                                    ),
                                    child: getCustomFont(purchase.status, 12.sp, 
                                        purchase.status == "Completed" ? pacificBlue : Colors.orange, 1,
                                        fontWeight: FontWeight.w500),
                                  ),
                                ],
                              ),
                              getVerSpace(12.h),
                              Divider(color: Colors.grey.shade200, height: 1),
                              getVerSpace(12.h),
                              Row(
                                children: [
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        getCustomFont("Amount", 12.sp, hintColor, 1,
                                            fontWeight: FontWeight.w400),
                                        getVerSpace(4.h),
                                        getCustomFont("R${purchase.amountZar.toStringAsFixed(2)}", 16.sp, Colors.black, 1,
                                            fontWeight: FontWeight.w600),
                                      ],
                                    ),
                                  ),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        getCustomFont("kWh", 12.sp, hintColor, 1,
                                            fontWeight: FontWeight.w400),
                                        getVerSpace(4.h),
                                        getCustomFont("${purchase.kwhPurchased.toStringAsFixed(1)} kWh", 16.sp, Colors.black, 1,
                                            fontWeight: FontWeight.w600),
                                      ],
                                    ),
                                  ),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        getCustomFont("Date", 12.sp, hintColor, 1,
                                            fontWeight: FontWeight.w400),
                                        getVerSpace(4.h),
                                        getCustomFont("${purchase.purchaseDate.day}/${purchase.purchaseDate.month}/${purchase.purchaseDate.year}", 14.sp, Colors.black, 1,
                                            fontWeight: FontWeight.w500),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                              getVerSpace(12.h),
                              Container(
                                width: double.infinity,
                                padding: EdgeInsets.all(12.h),
                                decoration: BoxDecoration(
                                  color: Colors.grey.shade50,
                                  borderRadius: BorderRadius.circular(8.h),
                                ),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    getCustomFont("Token", 12.sp, hintColor, 1,
                                        fontWeight: FontWeight.w400),
                                    getVerSpace(4.h),
                                    Row(
                                      children: [
                                        Expanded(
                                          child: getCustomFont(purchase.token, 16.sp, Colors.black, 1,
                                              fontWeight: FontWeight.w600),
                                        ),
                                        GestureDetector(
                                          onTap: () {
                                            ScaffoldMessenger.of(context).showSnackBar(
                                              SnackBar(content: Text("Token copied to clipboard")),
                                            );
                                          },
                                          child: Container(
                                            padding: EdgeInsets.all(8.h),
                                            decoration: BoxDecoration(
                                              color: pacificBlue.withOpacity(0.1),
                                              borderRadius: BorderRadius.circular(6.h),
                                            ),
                                            child: Icon(Icons.copy, size: 16.h, color: pacificBlue),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                              if (purchase.transactionReference.isNotEmpty) ...[
                                getVerSpace(8.h),
                                getCustomFont("Ref: ${purchase.transactionReference}", 12.sp, hintColor, 1,
                                    fontWeight: FontWeight.w400),
                              ],
                              getVerSpace(16.h),
                              Row(
                                children: [
                                  Expanded(
                                    child: getButton(
                                      context,
                                      pacificBlue,
                                      "Repeat Purchase",
                                      Colors.white,
                                      () {
                                        _repeatPurchase(purchase);
                                      },
                                      14.sp,
                                      borderRadius: BorderRadius.circular(12.h),
                                      buttonHeight: 40.h,
                                      weight: FontWeight.w600,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }

  void _repeatPurchase(ElectricityPurchaseModel purchase) {
    // Show payment dialog with the same purchase details
    Get.dialog(
      AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16.h),
        ),
        title: Row(
          children: [
            Icon(Icons.payment, color: pacificBlue, size: 28.h),
            getHorSpace(12.h),
            getCustomFont("Repeat Purchase", 18.sp, Colors.black, 1,
                fontWeight: FontWeight.w600),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            getCustomFont("Confirm purchase details:", 16.sp, Colors.black, 1,
                fontWeight: FontWeight.w400),
            getVerSpace(16.h),
            Container(
              padding: EdgeInsets.all(12.h),
              decoration: BoxDecoration(
                color: Colors.grey.shade100,
                borderRadius: BorderRadius.circular(8.h),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      getCustomFont("Complex:", 14.sp, hintColor, 1,
                          fontWeight: FontWeight.w400),
                      getCustomFont(purchase.complexName, 14.sp, Colors.black, 1,
                          fontWeight: FontWeight.w600),
                    ],
                  ),
                  getVerSpace(8.h),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      getCustomFont("Unit:", 14.sp, hintColor, 1,
                          fontWeight: FontWeight.w400),
                      getCustomFont(purchase.unitNumber, 14.sp, Colors.black, 1,
                          fontWeight: FontWeight.w600),
                    ],
                  ),
                  getVerSpace(8.h),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      getCustomFont("Amount:", 14.sp, hintColor, 1,
                          fontWeight: FontWeight.w400),
                      getCustomFont("R${purchase.amountZar.toStringAsFixed(2)}", 14.sp, Colors.black, 1,
                          fontWeight: FontWeight.w600),
                    ],
                  ),
                  getVerSpace(8.h),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      getCustomFont("kWh:", 14.sp, hintColor, 1,
                          fontWeight: FontWeight.w400),
                      getCustomFont("${purchase.kwhPurchased.toStringAsFixed(1)} kWh", 14.sp, Colors.black, 1,
                          fontWeight: FontWeight.w600),
                    ],
                  ),
                ],
              ),
            ),
            getVerSpace(16.h),
            getCustomFont("Proceed to payment?", 14.sp, hintColor, 1,
                fontWeight: FontWeight.w400),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              Get.back();
            },
            child: getCustomFont("Cancel", 16.sp, Colors.grey, 1,
                fontWeight: FontWeight.w500),
          ),
          TextButton(
            onPressed: () {
              Get.back();
              _processPayment(purchase);
            },
            child: getCustomFont("Pay Now", 16.sp, pacificBlue, 1,
                fontWeight: FontWeight.w600),
          ),
        ],
      ),
    );
  }

  void _processPayment(ElectricityPurchaseModel originalPurchase) {
    // Show payment processing dialog
    Get.dialog(
      AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16.h),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            CircularProgressIndicator(color: pacificBlue),
            getVerSpace(20.h),
            getCustomFont("Processing Payment...", 16.sp, Colors.black, 1,
                fontWeight: FontWeight.w600),
            getVerSpace(8.h),
            getCustomFont("Please wait while we process your electricity purchase", 14.sp, hintColor, 1,
                fontWeight: FontWeight.w400, textAlign: TextAlign.center),
          ],
        ),
      ),
      barrierDismissible: false,
    );

    // Simulate payment processing
    Future.delayed(Duration(seconds: 3), () {
      Get.back(); // Close processing dialog
      _showPaymentSuccess(originalPurchase);
    });
  }

  void _showPaymentSuccess(ElectricityPurchaseModel originalPurchase) {
    // Generate new transaction details
    String newToken = _generateToken();
    String newTransactionRef = "KV00${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}";
    
    // Create new purchase record
    ElectricityPurchaseModel newPurchase = ElectricityPurchaseModel(
      "TXN${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}",
      originalPurchase.complexName,
      originalPurchase.meterNumber,
      originalPurchase.unitNumber,
      originalPurchase.amountZar,
      originalPurchase.kwhPurchased,
      newToken,
      DateTime.now(),
      "Completed",
      newTransactionRef,
    );

    // Add to purchase history
    setState(() {
      purchaseHistory.insert(0, newPurchase);
    });

    // Show success dialog
    Get.dialog(
      AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16.h),
        ),
        title: Row(
          children: [
            Icon(Icons.check_circle, color: Colors.green, size: 28.h),
            getHorSpace(12.h),
            getCustomFont("Payment Successful!", 18.sp, Colors.black, 1,
                fontWeight: FontWeight.w600),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            getCustomFont("Your electricity has been purchased successfully!", 16.sp, Colors.black, 1,
                fontWeight: FontWeight.w400),
            getVerSpace(16.h),
            Container(
              padding: EdgeInsets.all(12.h),
              decoration: BoxDecoration(
                color: Colors.grey.shade50,
                borderRadius: BorderRadius.circular(8.h),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  getCustomFont("Your Electricity Token:", 12.sp, hintColor, 1,
                      fontWeight: FontWeight.w400),
                  getVerSpace(8.h),
                  Row(
                    children: [
                      Expanded(
                        child: getCustomFont(newToken, 16.sp, Colors.black, 1,
                            fontWeight: FontWeight.w600),
                      ),
                      GestureDetector(
                        onTap: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text("Token copied to clipboard")),
                          );
                        },
                        child: Container(
                          padding: EdgeInsets.all(8.h),
                          decoration: BoxDecoration(
                            color: pacificBlue.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(6.h),
                          ),
                          child: Icon(Icons.copy, size: 16.h, color: pacificBlue),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            getVerSpace(12.h),
            Container(
              padding: EdgeInsets.all(12.h),
              decoration: BoxDecoration(
                color: Colors.grey.shade100,
                borderRadius: BorderRadius.circular(8.h),
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      getCustomFont("Amount:", 14.sp, hintColor, 1,
                          fontWeight: FontWeight.w400),
                      getCustomFont("R${originalPurchase.amountZar.toStringAsFixed(2)}", 14.sp, Colors.black, 1,
                          fontWeight: FontWeight.w600),
                    ],
                  ),
                  getVerSpace(4.h),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      getCustomFont("kWh:", 14.sp, hintColor, 1,
                          fontWeight: FontWeight.w400),
                      getCustomFont("${originalPurchase.kwhPurchased.toStringAsFixed(1)} kWh", 14.sp, Colors.black, 1,
                          fontWeight: FontWeight.w600),
                    ],
                  ),
                  getVerSpace(4.h),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      getCustomFont("Ref:", 14.sp, hintColor, 1,
                          fontWeight: FontWeight.w400),
                      getCustomFont(newTransactionRef, 14.sp, Colors.black, 1,
                          fontWeight: FontWeight.w600),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              Get.back();
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text("Purchase added to your history"),
                  backgroundColor: Colors.green,
                ),
              );
            },
            child: getCustomFont("View History", 16.sp, pacificBlue, 1,
                fontWeight: FontWeight.w600),
          ),
        ],
      ),
    );
  }

  String _generateToken() {
    // Generate a 20-digit token (4 groups of 5 digits)
    List<String> groups = [];
    for (int i = 0; i < 4; i++) {
      String group = '';
      for (int j = 0; j < 5; j++) {
        group += (DateTime.now().millisecondsSinceEpoch % 10).toString();
      }
      groups.add(group);
    }
    return groups.join('-');
  }
}