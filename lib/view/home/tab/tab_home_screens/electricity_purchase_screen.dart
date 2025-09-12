import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';
import 'package:khanyi_vending_app/controller/controller.dart';
import 'package:khanyi_vending_app/util/color_category.dart';
import 'package:khanyi_vending_app/util/constant.dart';
import 'package:khanyi_vending_app/util/constant_widget.dart';
import 'package:khanyi_vending_app/util/token_generator.dart';
import 'package:khanyi_vending_app/view/home/home_screen.dart';

class ElectricityPurchaseScreen extends StatefulWidget {
  final String complexName;
  final String tariffRate;
  final String meterNumber;
  final String unitNumber;

  const ElectricityPurchaseScreen({
    Key? key,
    required this.complexName,
    required this.tariffRate,
    required this.meterNumber,
    required this.unitNumber,
  }) : super(key: key);

  @override
  State<ElectricityPurchaseScreen> createState() => _ElectricityPurchaseScreenState();
}

class _ElectricityPurchaseScreenState extends State<ElectricityPurchaseScreen> {
  TextEditingController amountController = TextEditingController();
  double selectedAmount = 0.0;
  double calculatedKwh = 0.0;
  double tariffValue = 2.50; // Default tariff

  @override
  void initState() {
    super.initState();
    // Extract tariff rate from string like "R2.50/kWh"
    String tariffString = widget.tariffRate.replaceAll('R', '').replaceAll('/kWh', '');
    tariffValue = double.tryParse(tariffString) ?? 2.50;
  }

  void updateKwh() {
    if (selectedAmount > 0) {
      calculatedKwh = TokenGenerator.calculateKwhFromAmount(selectedAmount, tariffValue);
      setState(() {});
    }
  }

  void selectPresetAmount(double amount) {
    selectedAmount = amount;
    amountController.text = amount.toString();
    updateKwh();
  }

  void onAmountChanged(String value) {
    selectedAmount = double.tryParse(value) ?? 0.0;
    updateKwh();
  }

  void processPurchase() {
    if (selectedAmount <= 0) {
      Get.snackbar("Error", "Please enter a valid amount");
      return;
    }

    // Generate token and show success dialog
    String token = TokenGenerator.generateElectricityToken();
    String transactionRef = TokenGenerator.generateTransactionReference();
    
    showPurchaseSuccessDialog(token, transactionRef);
  }

  void showPurchaseSuccessDialog(String token, String transactionRef) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: Row(
          children: [
            Icon(Icons.check_circle, color: Colors.green, size: 30.h),
            getHorSpace(10.w),
            getCustomFont("Purchase Successful!", 18.sp, Colors.black, 1, 
                fontWeight: FontWeight.w600),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            getCustomFont("Your electricity token:", 16.sp, Colors.black, 1,
                fontWeight: FontWeight.w500),
            getVerSpace(10.h),
            Container(
              padding: EdgeInsets.all(15.h),
              decoration: BoxDecoration(
                color: lightPacific,
                borderRadius: BorderRadius.circular(8.h),
                border: Border.all(color: pacificBlue),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: getCustomFont(token, 16.sp, pacificBlue, 1,
                        fontWeight: FontWeight.w700),
                  ),
                  GestureDetector(
                    onTap: () {
                      Clipboard.setData(ClipboardData(text: token));
                      Get.snackbar("Copied", "Token copied to clipboard");
                    },
                    child: Icon(Icons.copy, color: pacificBlue, size: 20.h),
                  ),
                ],
              ),
            ),
            getVerSpace(15.h),
            getCustomFont("Transaction Details:", 14.sp, Colors.black, 1,
                fontWeight: FontWeight.w500),
            getVerSpace(5.h),
            getCustomFont("Amount: ${TokenGenerator.formatCurrency(selectedAmount)}", 12.sp, hintColor, 1),
            getCustomFont("Units: ${TokenGenerator.formatBalance(calculatedKwh)}", 12.sp, hintColor, 1),
            getCustomFont("Reference: $transactionRef", 12.sp, hintColor, 1),
            getCustomFont("Meter: ${widget.meterNumber}", 12.sp, hintColor, 1),
          ],
        ),
        actions: [
          getButton(context, pacificBlue, "Done", Colors.white, () {
            Navigator.of(context).pop();
            // Navigate to HomeScreen with History tab selected (index 1)
            Get.off(HomeScreen(initialTabIndex: 1));
          }, 14.sp, buttonHeight: 40.h, buttonWidth: 80.w),
        ],
      ),
    );
  }

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
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              getVerSpace(20.h),
              getAppBar("Purchase Electricity", () => backClick())
                  .paddingSymmetric(horizontal: 20.w),
              getVerSpace(30.h),
              
              // Complex Info Card
              Container(
                margin: EdgeInsets.symmetric(horizontal: 20.w),
                padding: EdgeInsets.all(20.h),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16.h),
                  boxShadow: [
                    BoxShadow(
                      color: shadowColor,
                      offset: Offset(-4, 5),
                      blurRadius: 11,
                    )
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    getCustomFont(widget.complexName, 18.sp, Colors.black, 1,
                        fontWeight: FontWeight.w600),
                    getVerSpace(8.h),
                    Row(
                      children: [
                        getCustomFont("Unit: ${widget.unitNumber}", 14.sp, hintColor, 1),
                        Spacer(),
                        getCustomFont(widget.tariffRate, 14.sp, pacificBlue, 1,
                            fontWeight: FontWeight.w600),
                      ],
                    ),
                    getVerSpace(5.h),
                    getCustomFont("Meter: ${widget.meterNumber}", 12.sp, hintColor, 1),
                  ],
                ),
              ),
              
              getVerSpace(30.h),
              
              // Amount Input Section
              getCustomFont("Purchase Amount (ZAR)", 16.sp, Colors.black, 1,
                  fontWeight: FontWeight.w600)
                  .paddingSymmetric(horizontal: 20.w),
              getVerSpace(10.h),
              
              // Preset Amount Buttons
              SizedBox(
                height: 50.h,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  padding: EdgeInsets.symmetric(horizontal: 20.w),
                  itemCount: TokenGenerator.getPresetAmounts().length,
                  itemBuilder: (context, index) {
                    double amount = TokenGenerator.getPresetAmounts()[index];
                    bool isSelected = selectedAmount == amount;
                    
                    return GestureDetector(
                      onTap: () => selectPresetAmount(amount),
                      child: Container(
                        margin: EdgeInsets.only(right: 10.w),
                        padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 12.h),
                        decoration: BoxDecoration(
                          color: isSelected ? pacificBlue : Colors.white,
                          borderRadius: BorderRadius.circular(25.h),
                          border: Border.all(color: pacificBlue),
                        ),
                        child: getCustomFont("R${amount.toInt()}", 14.sp,
                            isSelected ? Colors.white : pacificBlue, 1,
                            fontWeight: FontWeight.w600),
                      ),
                    );
                  },
                ),
              ),
              
              getVerSpace(20.h),
              
              // Custom Amount Input
              defaultTextField(
                context,
                amountController,
                "Enter custom amount",
                keyboardType: TextInputType.number,
                onChanged: onAmountChanged,
              ).paddingSymmetric(horizontal: 20.w),
              
              getVerSpace(20.h),
              
              // Calculation Display
              if (calculatedKwh > 0)
                Container(
                  margin: EdgeInsets.symmetric(horizontal: 20.w),
                  padding: EdgeInsets.all(15.h),
                  decoration: BoxDecoration(
                    color: lightPacific,
                    borderRadius: BorderRadius.circular(12.h),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      getCustomFont("You will receive:", 14.sp, Colors.black, 1),
                      getCustomFont("${calculatedKwh.toStringAsFixed(1)} kWh", 16.sp, pacificBlue, 1,
                          fontWeight: FontWeight.w600),
                    ],
                  ),
                ),
              
              Spacer(),
              
              // Purchase Button
              getButton(
                context,
                pacificBlue,
                "Purchase Electricity",
                Colors.white,
                processPurchase,
                16.sp,
                buttonHeight: 60.h,
                weight: FontWeight.w600,
                borderRadius: BorderRadius.circular(16.h),
              ).paddingSymmetric(horizontal: 20.w),
              
              getVerSpace(30.h),
            ],
          ),
        ),
      ),
    );
  }
}