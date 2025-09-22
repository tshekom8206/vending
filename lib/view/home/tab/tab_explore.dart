import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';
import 'package:khanyi_vending_app/util/constant_widget.dart';
import 'package:khanyi_vending_app/util/color_category.dart';
import 'package:khanyi_vending_app/model/api_models.dart';
import 'package:khanyi_vending_app/services/purchase_service.dart';

class TabExplore extends StatefulWidget {
  const TabExplore({Key? key}) : super(key: key);

  @override
  State<TabExplore> createState() => _TabExploreState();
}

class _TabExploreState extends State<TabExplore> {
  final PurchaseService _purchaseService = Get.find<PurchaseService>();
  List<Purchase> purchaseHistory = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadPurchases();
  }

  Future<void> _loadPurchases() async {
    setState(() {
      isLoading = true;
    });

    await _purchaseService.fetchPurchases();

    setState(() {
      purchaseHistory = _purchaseService.purchases;
      isLoading = false;
    });
  }

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
              child: isLoading
                  ? Center(
                      child: CircularProgressIndicator(color: pacificBlue),
                    )
                  : purchaseHistory.isEmpty
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
                        Purchase purchase = purchaseHistory[index];
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
                                        getCustomFont('Electricity Purchase', 16.sp, Colors.black, 1,
                                            fontWeight: FontWeight.w600),
                                        getVerSpace(4.h),
                                        getCustomFont(_getDisplayLocation(purchase), 14.sp, hintColor, 1,
                                            fontWeight: FontWeight.w400),
                                      ],
                                    ),
                                  ),
                                  Container(
                                    padding: EdgeInsets.symmetric(horizontal: 12.h, vertical: 6.h),
                                    decoration: BoxDecoration(
                                      color: purchase.status == "completed" ? pacificBlue.withOpacity(0.1) : Colors.orange.withOpacity(0.1),
                                      borderRadius: BorderRadius.circular(8.h),
                                    ),
                                    child: getCustomFont(purchase.status.toUpperCase(), 12.sp,
                                        purchase.status == "completed" ? pacificBlue : Colors.orange, 1,
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
                                        getCustomFont("R${purchase.amount.final_.toStringAsFixed(2)}", 16.sp, Colors.black, 1,
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
                                        getCustomFont("${purchase.electricity.units.toStringAsFixed(1)} kWh", 16.sp, Colors.black, 1,
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
                                        getCustomFont("${purchase.createdAt.day}/${purchase.createdAt.month}/${purchase.createdAt.year}", 14.sp, Colors.black, 1,
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
                                          child: getCustomFont(purchase.electricity.token ?? 'Token not available', 16.sp, Colors.black, 1,
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
                              if (purchase.id.isNotEmpty) ...[
                                getVerSpace(8.h),
                                getCustomFont("Ref: ${purchase.id.substring(0, 8)}...", 12.sp, hintColor, 1,
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

  void _repeatPurchase(Purchase purchase) {
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
                      Expanded(
                        child: getCustomFont(purchase.estateName ?? 'No Complex', 14.sp, Colors.black, 1,
                            fontWeight: FontWeight.w600, textAlign: TextAlign.end),
                      ),
                    ],
                  ),
                  getVerSpace(8.h),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      getCustomFont("Unit:", 14.sp, hintColor, 1,
                          fontWeight: FontWeight.w400),
                      Expanded(
                        child: getCustomFont(purchase.unitNumber ?? purchase.unitId ?? 'N/A', 14.sp, Colors.black, 1,
                            fontWeight: FontWeight.w600, textAlign: TextAlign.end),
                      ),
                    ],
                  ),
                  getVerSpace(8.h),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      getCustomFont("Amount:", 14.sp, hintColor, 1,
                          fontWeight: FontWeight.w400),
                      getCustomFont("R${purchase.amount.final_.toStringAsFixed(2)}", 14.sp, Colors.black, 1,
                          fontWeight: FontWeight.w600),
                    ],
                  ),
                  getVerSpace(8.h),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      getCustomFont("kWh:", 14.sp, hintColor, 1,
                          fontWeight: FontWeight.w400),
                      getCustomFont("${purchase.electricity.units.toStringAsFixed(1)} kWh", 14.sp, Colors.black, 1,
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

  Future<void> _processPayment(Purchase originalPurchase) async {
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

    try {
      print('🔥 REPEAT PURCHASE: Starting API call...');
      // Call the actual purchase API with the same amount and timeout
      Purchase? newPurchase = await _purchaseService.createPurchase(
        amount: originalPurchase.amount.final_,
        unitId: originalPurchase.unitId,
        meterId: originalPurchase.meterId,
        paymentMethod: 'Card',
      ).timeout(
        Duration(seconds: 30),
        onTimeout: () {
          print('🔥 REPEAT PURCHASE: TIMEOUT occurred');
          throw Exception('Request timeout. Please check your connection and try again.');
        },
      );

      print('🔥 REPEAT PURCHASE: API call completed. Closing processing dialog...');
      // Close processing dialog with proper error handling
      _closeAllDialogs();
      await Future.delayed(Duration(milliseconds: 200)); // Ensure dialog is fully closed
      print('🔥 REPEAT PURCHASE: Processing dialog closed. Processing result...');

      if (newPurchase != null) {
        print('🔥 REPEAT PURCHASE: Purchase created with status: ${newPurchase.status}');
        // Check if purchase is completed
        if (newPurchase.status.toLowerCase() == 'completed') {
          // Show success with real purchase data
          _showPaymentSuccess(newPurchase);
          // Refresh purchase history to show the new purchase
          await _purchaseService.fetchPurchases();
        } else if (newPurchase.status.toLowerCase() == 'pending') {
          // Purchase created but still processing - show token anyway since it's already generated
          print('🔥 REPEAT PURCHASE: Status is Pending - showing token and processing message');
          _showPaymentSuccess(newPurchase);
          Get.snackbar(
            'Purchase Processing',
            'Payment is being processed. Your token is ready to use.',
            duration: Duration(seconds: 5),
          );
          print('🔥 REPEAT PURCHASE: Token shown - refreshing purchase history');
          // Still refresh purchase history to show the pending purchase
          await _purchaseService.fetchPurchases();
          print('🔥 REPEAT PURCHASE: Purchase history refreshed');
        } else {
          // Purchase failed
          Get.snackbar('Purchase Failed', 'Payment failed. Please try again.');
        }
      } else {
        // Show error if purchase failed
        Get.snackbar('Purchase Failed', 'Unable to process payment. Please try again.');
      }
    } catch (e) {
      print('🔥 REPEAT PURCHASE ERROR: $e');
      // Close processing dialog in error case
      _closeAllDialogs();
      await Future.delayed(Duration(milliseconds: 200)); // Ensure dialog is fully closed

      if (e.toString().contains('timeout')) {
        Get.snackbar('Timeout Error', 'Request timed out. Please check your connection and try again.');
      } else if (e.toString().contains('CORS') || e.toString().contains('network')) {
        Get.snackbar('Connection Error', 'Unable to connect to server. Please try again.');
      } else {
        Get.snackbar('Error', 'Purchase failed: $e');
      }
    }
  }

  void _showPaymentSuccess(Purchase newPurchase) {
    // Show success dialog with better dialog management
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
                        child: getCustomFont(newPurchase.electricity.token ?? 'Token not available', 16.sp, Colors.black, 1,
                            fontWeight: FontWeight.w600),
                      ),
                      GestureDetector(
                        onTap: () {
                          // Copy token to clipboard using flutter services
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
                      getCustomFont("R${newPurchase.amount.final_.toStringAsFixed(2)}", 14.sp, Colors.black, 1,
                          fontWeight: FontWeight.w600),
                    ],
                  ),
                  getVerSpace(4.h),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      getCustomFont("kWh:", 14.sp, hintColor, 1,
                          fontWeight: FontWeight.w400),
                      getCustomFont("${newPurchase.electricity.units.toStringAsFixed(1)} kWh", 14.sp, Colors.black, 1,
                          fontWeight: FontWeight.w600),
                    ],
                  ),
                  getVerSpace(4.h),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      getCustomFont("Ref:", 14.sp, hintColor, 1,
                          fontWeight: FontWeight.w400),
                      getCustomFont(newPurchase.transactionId ?? newPurchase.id.substring(0, 8), 14.sp, Colors.black, 1,
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
              print('🔥 SUCCESS DIALOG: Done button clicked');
              try {
                // Force close dialog using multiple methods
                Navigator.of(context).pop();
                print('🔥 SUCCESS DIALOG: Navigator.pop() called');

                // Also try Get.back() as backup
                if (Get.isDialogOpen == true) {
                  Get.back();
                  print('🔥 SUCCESS DIALOG: Get.back() called as backup');
                }

                // Show success snackbar after a short delay
                Future.delayed(Duration(milliseconds: 300), () {
                  Get.snackbar(
                    'Purchase Complete',
                    'Your purchase has been added to history. Check More > Purchase History.',
                    duration: Duration(seconds: 3),
                    backgroundColor: Colors.green,
                    colorText: Colors.white,
                  );
                });
              } catch (e) {
                print('🔥 SUCCESS DIALOG ERROR: $e');
                // Fallback - force close any open dialogs
                _closeAllDialogs();
              }
            },
            child: getCustomFont("Done", 16.sp, pacificBlue, 1,
                fontWeight: FontWeight.w600),
          ),
        ],
      ),
      barrierDismissible: true,
    );
  }

  // Helper method to close all open dialogs properly
  void _closeAllDialogs() {
    try {
      print('🔥 DIALOG CLOSE: Starting aggressive dialog cleanup');

      // Method 1: Close using Navigator first (more reliable)
      int navAttempts = 0;
      while (navAttempts < 3) {
        try {
          if (Navigator.canPop(context)) {
            Navigator.of(context).pop();
            navAttempts++;
            print('🔥 DIALOG CLOSE: Navigator.pop() attempt $navAttempts');
          } else {
            break;
          }
        } catch (e) {
          print('🔥 DIALOG CLOSE: Navigator.pop() failed: $e');
          break;
        }
      }

      // Method 2: Close using Get.back() as backup
      int getAttempts = 0;
      while (Get.isDialogOpen == true && getAttempts < 3) {
        Get.back();
        getAttempts++;
        print('🔥 DIALOG CLOSE: Get.back() attempt $getAttempts - Dialog still open: ${Get.isDialogOpen}');
      }

      // Method 3: Force close all routes if still open
      if (Get.isDialogOpen == true) {
        print('🔥 DIALOG CLOSE: Force closing all overlays');
        Get.until((route) => route.isFirst);
      }

      print('🔥 DIALOG CLOSE: Completed - Navigator attempts: $navAttempts, Get attempts: $getAttempts');
    } catch (e) {
      print('🔥 DIALOG CLOSE ERROR: $e');
      // Final fallback: Force close using Navigator with rootNavigator
      try {
        Navigator.of(context, rootNavigator: true).pop();
        print('🔥 DIALOG CLOSE: Used rootNavigator fallback');
      } catch (navError) {
        print('🔥 NAVIGATOR CLOSE ERROR: $navError');
      }
    }
  }

  String _getDisplayLocation(Purchase purchase) {
    List<String> parts = [];

    if (purchase.estateName != null && purchase.estateName!.isNotEmpty) {
      parts.add(purchase.estateName!);
    }

    if (purchase.unitNumber != null && purchase.unitNumber!.isNotEmpty) {
      parts.add("Unit ${purchase.unitNumber}");
    } else if (purchase.unitId != null && purchase.unitId!.isNotEmpty) {
      parts.add("Unit ID: ${purchase.unitId}");
    }

    if (purchase.estateCity != null && purchase.estateCity!.isNotEmpty) {
      parts.add(purchase.estateCity!);
    }

    return parts.isNotEmpty ? parts.join(" • ") : "No Location";
  }

}