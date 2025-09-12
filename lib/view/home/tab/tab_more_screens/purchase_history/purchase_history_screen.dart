import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';
import 'package:khanyi_vending_app/controller/controller.dart';
import 'package:khanyi_vending_app/datafile/datafile.dart';
import 'package:khanyi_vending_app/model/electricity_purchase_model.dart';
import 'package:khanyi_vending_app/util/color_category.dart';
import 'package:khanyi_vending_app/util/constant.dart';
import 'package:khanyi_vending_app/util/constant_widget.dart';
import 'package:khanyi_vending_app/util/token_generator.dart';

class PurchaseHistoryScreen extends StatefulWidget {
  const PurchaseHistoryScreen({Key? key}) : super(key: key);

  @override
  State<PurchaseHistoryScreen> createState() => _PurchaseHistoryScreenState();
}

class _PurchaseHistoryScreenState extends State<PurchaseHistoryScreen> {
  List<ElectricityPurchaseModel> purchases = DataFile.getElectricityPurchases();

  void backClick() {
    Constant.backToFinish();
  }

  void showTokenDetails(ElectricityPurchaseModel purchase) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: getCustomFont("Purchase Details", 18.sp, Colors.black, 1,
            fontWeight: FontWeight.w600),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildDetailRow("Complex:", purchase.complexName),
            _buildDetailRow("Unit:", purchase.unitNumber),
            _buildDetailRow("Meter:", purchase.meterNumber),
            _buildDetailRow("Amount:", TokenGenerator.formatCurrency(purchase.amountZar)),
            _buildDetailRow("Units:", TokenGenerator.formatBalance(purchase.kwhPurchased)),
            _buildDetailRow("Date:", _formatDate(purchase.purchaseDate)),
            _buildDetailRow("Reference:", purchase.transactionReference),
            getVerSpace(15.h),
            getCustomFont("Electricity Token:", 14.sp, Colors.black, 1,
                fontWeight: FontWeight.w600),
            getVerSpace(8.h),
            Container(
              padding: EdgeInsets.all(12.h),
              decoration: BoxDecoration(
                color: lightPacific,
                borderRadius: BorderRadius.circular(8.h),
                border: Border.all(color: pacificBlue),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: getCustomFont(purchase.token, 14.sp, pacificBlue, 2,
                        fontWeight: FontWeight.w700),
                  ),
                  GestureDetector(
                    onTap: () {
                      Clipboard.setData(ClipboardData(text: purchase.token));
                      Get.snackbar("Copied", "Token copied to clipboard");
                    },
                    child: Icon(Icons.copy, color: pacificBlue, size: 20.h),
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: getCustomFont("Close", 14.sp, pacificBlue, 1,
                fontWeight: FontWeight.w600),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: EdgeInsets.only(bottom: 8.h),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 80.w,
            child: getCustomFont(label, 12.sp, hintColor, 1,
                fontWeight: FontWeight.w500),
          ),
          Expanded(
            child: getCustomFont(value, 12.sp, Colors.black, 2,
                fontWeight: FontWeight.w400),
          ),
        ],
      ),
    );
  }

  String _formatDate(DateTime date) {
    return "${date.day}/${date.month}/${date.year} ${date.hour}:${date.minute.toString().padLeft(2, '0')}";
  }

  String _getTimeAgo(DateTime date) {
    Duration difference = DateTime.now().difference(date);
    
    if (difference.inDays > 0) {
      return "${difference.inDays} ${difference.inDays == 1 ? 'day' : 'days'} ago";
    } else if (difference.inHours > 0) {
      return "${difference.inHours} ${difference.inHours == 1 ? 'hour' : 'hours'} ago";
    } else if (difference.inMinutes > 0) {
      return "${difference.inMinutes} ${difference.inMinutes == 1 ? 'minute' : 'minutes'} ago";
    } else {
      return "Just now";
    }
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
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              getVerSpace(20.h),
              getAppBar("Purchase History", () => backClick())
                  .paddingSymmetric(horizontal: 20.w),
              getVerSpace(20.h),
              
              if (purchases.isEmpty)
                Expanded(
                  child: Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.receipt_long, size: 80.h, color: hintColor),
                        getVerSpace(20.h),
                        getCustomFont("No purchases yet", 18.sp, hintColor, 1,
                            fontWeight: FontWeight.w500),
                        getVerSpace(10.h),
                        getCustomFont("Your electricity purchase history will appear here", 
                            14.sp, hintColor, 2, fontWeight: FontWeight.w400),
                      ],
                    ),
                  ),
                )
              else
                Expanded(
                  child: ListView.builder(
                    padding: EdgeInsets.symmetric(horizontal: 20.w),
                    itemCount: purchases.length,
                    itemBuilder: (context, index) {
                      ElectricityPurchaseModel purchase = purchases[index];
                      
                      return GestureDetector(
                        onTap: () => showTokenDetails(purchase),
                        child: Container(
                          margin: EdgeInsets.only(bottom: 15.h),
                          padding: EdgeInsets.all(16.h),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(12.h),
                            boxShadow: [
                              BoxShadow(
                                color: shadowColor.withOpacity(0.1),
                                offset: Offset(0, 2),
                                blurRadius: 8,
                              )
                            ],
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Container(
                                    width: 50.w,
                                    height: 50.h,
                                    decoration: BoxDecoration(
                                      color: pacificBlue.withOpacity(0.1),
                                      borderRadius: BorderRadius.circular(25.h),
                                    ),
                                    child: Icon(Icons.electric_bolt, 
                                        color: pacificBlue, size: 24.h),
                                  ),
                                  getHorSpace(12.w),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        getCustomFont(purchase.complexName, 16.sp, Colors.black, 1,
                                            fontWeight: FontWeight.w600),
                                        getVerSpace(4.h),
                                        getCustomFont("Unit ${purchase.unitNumber}", 
                                            14.sp, hintColor, 1),
                                      ],
                                    ),
                                  ),
                                  Column(
                                    crossAxisAlignment: CrossAxisAlignment.end,
                                    children: [
                                      getCustomFont(TokenGenerator.formatCurrency(purchase.amountZar), 
                                          16.sp, Colors.black, 1, fontWeight: FontWeight.w600),
                                      getVerSpace(4.h),
                                      getCustomFont(_getTimeAgo(purchase.purchaseDate), 
                                          12.sp, hintColor, 1),
                                    ],
                                  ),
                                ],
                              ),
                              
                              getVerSpace(12.h),
                              
                              Row(
                                children: [
                                  Expanded(
                                    child: Container(
                                      padding: EdgeInsets.symmetric(vertical: 8.h, horizontal: 12.w),
                                      decoration: BoxDecoration(
                                        color: lightPacific,
                                        borderRadius: BorderRadius.circular(8.h),
                                      ),
                                      child: Row(
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        children: [
                                          getCustomFont("Units Purchased:", 12.sp, Colors.black, 1),
                                          getCustomFont(TokenGenerator.formatBalance(purchase.kwhPurchased), 
                                              12.sp, pacificBlue, 1, fontWeight: FontWeight.w600),
                                        ],
                                      ),
                                    ),
                                  ),
                                  getHorSpace(10.w),
                                  Container(
                                    padding: EdgeInsets.symmetric(vertical: 8.h, horizontal: 12.w),
                                    decoration: BoxDecoration(
                                      color: purchase.status == "Completed" 
                                          ? Colors.green.withOpacity(0.1)
                                          : Colors.orange.withOpacity(0.1),
                                      borderRadius: BorderRadius.circular(8.h),
                                    ),
                                    child: getCustomFont(purchase.status, 12.sp, 
                                        purchase.status == "Completed" ? Colors.green : Colors.orange, 1,
                                        fontWeight: FontWeight.w600),
                                  ),
                                ],
                              ),
                              
                              getVerSpace(8.h),
                              
                              Row(
                                children: [
                                  Icon(Icons.receipt, size: 16.h, color: hintColor),
                                  getHorSpace(6.w),
                                  getCustomFont("Ref: ${purchase.transactionReference}", 
                                      12.sp, hintColor, 1),
                                  Spacer(),
                                  getCustomFont("Tap for token", 12.sp, pacificBlue, 1,
                                      fontWeight: FontWeight.w500),
                                  getHorSpace(4.w),
                                  Icon(Icons.arrow_forward_ios, size: 12.h, color: pacificBlue),
                                ],
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}