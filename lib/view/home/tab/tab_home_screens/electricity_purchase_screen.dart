import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';
import 'package:khanyi_vending_app/util/color_category.dart';
import 'package:khanyi_vending_app/util/constant.dart';
import 'package:khanyi_vending_app/util/constant_widget.dart';
import 'package:khanyi_vending_app/util/token_generator.dart';
import 'package:khanyi_vending_app/view/home/home_screen.dart';
import 'package:khanyi_vending_app/services/purchase_service.dart';
import 'package:khanyi_vending_app/services/auth_service.dart';
import 'package:khanyi_vending_app/services/estate_service.dart';
import 'package:khanyi_vending_app/model/api_models.dart';

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
  final PurchaseService _purchaseService = Get.find<PurchaseService>();
  final AuthService _authService = Get.find<AuthService>();
  final EstateService _estateService = Get.find<EstateService>();

  TextEditingController amountController = TextEditingController();
  double selectedAmount = 0.0;
  double calculatedKwh = 0.0;
  double tariffValue = 2.85;
  bool isProcessing = false;
  bool isLoadingUserData = true;
  bool purchaseForSelf = true;

  // User's unit data
  Map<String, dynamic>? userUnitData;
  String? userComplexName;
  String? userUnitNumber;
  String? userMeterNumber;

  // For purchasing for others
  List<Estate> availableEstates = [];
  List<Unit> availableUnits = [];
  Estate? selectedEstate;
  Unit? selectedUnit;

  @override
  void initState() {
    super.initState();
    _loadUserUnitData();

    // Load estates after the frame is built to avoid setState during build
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadAvailableEstates();
    });
  }

  Future<void> _loadUserUnitData() async {
    try {
      setState(() { isLoadingUserData = true; });

      userUnitData = await _authService.getUserUnit();
      if (userUnitData != null) {
        userComplexName = userUnitData!['unit']['estate']['name'];
        userUnitNumber = userUnitData!['unit']['unitNumber'];
        userMeterNumber = userUnitData!['meter']?['meterNumber'];
        tariffValue = userUnitData!['unit']['estate']['tariff']['rate'].toDouble();
      } else {
        // Fallback to widget values if no user unit found
        userComplexName = widget.complexName;
        userUnitNumber = widget.unitNumber;
        userMeterNumber = widget.meterNumber;
        String tariffString = widget.tariffRate.replaceAll('R', '').replaceAll('/kWh', '');
        tariffValue = double.tryParse(tariffString) ?? 2.50;
      }
    } catch (e) {
      print('Error loading user unit data: $e');
      // Fallback to widget values
      userComplexName = widget.complexName;
      userUnitNumber = widget.unitNumber;
      userMeterNumber = widget.meterNumber;
      String tariffString = widget.tariffRate.replaceAll('R', '').replaceAll('/kWh', '');
      tariffValue = double.tryParse(tariffString) ?? 2.50;
    } finally {
      setState(() { isLoadingUserData = false; });
    }
  }

  Future<void> _loadAvailableEstates() async {
    try {
      print('🔥 LOADING AVAILABLE ESTATES: Starting to load estates with units...');

      // Fetch estates that have units (for electricity purchase)
      await _estateService.fetchEstatesWithUnits();

      if (mounted) {
        setState(() {
          availableEstates = _estateService.estates;
        });
        print('🔥 LOADING AVAILABLE ESTATES: Successfully loaded ${availableEstates.length} estates with units');
      }
    } catch (e) {
      print('🔥 LOADING AVAILABLE ESTATES ERROR: $e');
      if (mounted) {
        setState(() {
          availableEstates = [];
        });
      }
    }
  }

  Future<void> _loadUnitsForEstate(String estateId) async {
    try {
      print('🔥 LOADING UNITS: Starting to load units for estate: $estateId');
      setState(() {
        availableUnits = [];
        selectedUnit = null;
      });

      // Fetch units from the API
      await _estateService.fetchUnits(estateId: estateId);

      // Filter units for the selected estate
      List<Unit> estateUnits = _estateService.units
          .where((unit) => unit.estateId == estateId)
          .toList();

      print('🔥 LOADING UNITS: Found ${estateUnits.length} units for estate');

      setState(() {
        availableUnits = estateUnits;
      });
    } catch (e) {
      print('🔥 LOADING UNITS ERROR: $e');
      Get.snackbar('Error', 'Failed to load units for selected estate');
    }
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

  void processPurchase() async {
    print('🔥 PURCHASE BUTTON CLICKED - Starting purchase process');
    print('🔥 Selected amount: R$selectedAmount');
    print('🔥 Purchase for self: $purchaseForSelf');

    if (selectedAmount <= 0) {
      Get.snackbar("Error", "Please enter a valid amount");
      return;
    }

    if (selectedAmount < 10) {
      Get.snackbar("Error", "Minimum purchase amount is R10");
      return;
    }

    if (selectedAmount > 5000) {
      Get.snackbar("Error", "Maximum purchase amount is R5000");
      return;
    }

    // Validate selection if purchasing for someone else
    if (!purchaseForSelf && selectedUnit == null) {
      Get.snackbar("Error", "Please select a unit to purchase for");
      return;
    }

    setState(() {
      isProcessing = true;
    });

    try {
      Purchase? purchase;

      if (purchaseForSelf) {
        // Purchase for user's own unit (unitId will be auto-fetched)
        print('🔥 Calling API for SELF purchase - amount: R$selectedAmount');
        purchase = await _purchaseService.createPurchase(
          amount: selectedAmount,
          paymentMethod: 'Card',
        );
        print('🔥 API call completed for SELF purchase');
      } else {
        // Purchase for someone else's unit
        purchase = await _purchaseService.createPurchase(
          amount: selectedAmount,
          unitId: selectedUnit!.id,
          paymentMethod: 'Card',
        );
      }

      if (purchase != null) {
        showPurchaseSuccessDialog(purchase);
      } else {
        Get.snackbar("Purchase Failed", "Unable to process your purchase. Please try again.");
      }
    } catch (e) {
      Get.snackbar("Error", "Purchase failed: $e");
    } finally {
      setState(() {
        isProcessing = false;
      });
    }
  }

  void showPurchaseSuccessDialog(Purchase purchase) {
    String token = purchase.electricity.token ?? TokenGenerator.generateElectricityToken();
    String transactionRef = purchase.id;
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
            getCustomFont("Amount: R${purchase.amount.final_.toStringAsFixed(2)}", 12.sp, hintColor, 1),
            getCustomFont("Units: ${purchase.electricity.units.toStringAsFixed(2)} kWh", 12.sp, hintColor, 1),
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
    Get.back();
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
              
              // Purchase Type Toggle
              Container(
                margin: EdgeInsets.symmetric(horizontal: 20.w),
                child: Row(
                  children: [
                    Expanded(
                      child: GestureDetector(
                        onTap: () => setState(() { purchaseForSelf = true; }),
                        child: Container(
                          padding: EdgeInsets.symmetric(vertical: 12.h),
                          decoration: BoxDecoration(
                            color: purchaseForSelf ? pacificBlue : Colors.white,
                            borderRadius: BorderRadius.circular(8.h),
                            border: Border.all(color: pacificBlue),
                          ),
                          child: Center(
                            child: getCustomFont("For Me", 14.sp,
                                purchaseForSelf ? Colors.white : pacificBlue, 1,
                                fontWeight: FontWeight.w600),
                          ),
                        ),
                      ),
                    ),
                    getHorSpace(10.w),
                    Expanded(
                      child: GestureDetector(
                        onTap: () => setState(() { purchaseForSelf = false; }),
                        child: Container(
                          padding: EdgeInsets.symmetric(vertical: 12.h),
                          decoration: BoxDecoration(
                            color: !purchaseForSelf ? pacificBlue : Colors.white,
                            borderRadius: BorderRadius.circular(8.h),
                            border: Border.all(color: pacificBlue),
                          ),
                          child: Center(
                            child: getCustomFont("For Someone Else", 14.sp,
                                !purchaseForSelf ? Colors.white : pacificBlue, 1,
                                fontWeight: FontWeight.w600),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              getVerSpace(20.h),

              // Dynamic Complex/Unit Info
              if (isLoadingUserData)
                Container(
                  margin: EdgeInsets.symmetric(horizontal: 20.w),
                  padding: EdgeInsets.all(20.h),
                  child: Center(child: CircularProgressIndicator()),
                )
              else if (purchaseForSelf)
                // User's Own Unit Info
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
                      Row(
                        children: [
                          Icon(Icons.home, color: pacificBlue, size: 20.h),
                          getHorSpace(8.w),
                          getCustomFont("My Unit", 16.sp, pacificBlue, 1,
                              fontWeight: FontWeight.w600),
                        ],
                      ),
                      getVerSpace(10.h),
                      getCustomFont(userComplexName ?? 'Loading...', 18.sp, Colors.black, 1,
                          fontWeight: FontWeight.w600),
                      getVerSpace(8.h),
                      Row(
                        children: [
                          getCustomFont("Unit: ${userUnitNumber ?? 'N/A'}", 14.sp, hintColor, 1),
                          Spacer(),
                          getCustomFont("R${tariffValue.toStringAsFixed(2)}/kWh", 14.sp, pacificBlue, 1,
                              fontWeight: FontWeight.w600),
                        ],
                      ),
                      getVerSpace(5.h),
                      getCustomFont("Meter: ${userMeterNumber ?? 'N/A'}", 12.sp, hintColor, 1),
                    ],
                  ),
                )
              else
                // Selection for Others
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
                      Row(
                        children: [
                          Icon(Icons.people, color: pacificBlue, size: 20.h),
                          getHorSpace(8.w),
                          getCustomFont("Purchase For", 16.sp, pacificBlue, 1,
                              fontWeight: FontWeight.w600),
                        ],
                      ),
                      getVerSpace(15.h),

                      // Estate Dropdown
                      getCustomFont("Select Complex", 14.sp, Colors.black, 1,
                          fontWeight: FontWeight.w500),
                      getVerSpace(8.h),
                      Container(
                        padding: EdgeInsets.symmetric(horizontal: 15.w, vertical: 12.h),
                        decoration: BoxDecoration(
                          border: Border.all(color: Colors.grey.shade300),
                          borderRadius: BorderRadius.circular(8.h),
                        ),
                        child: DropdownButton<Estate>(
                          value: selectedEstate,
                          isExpanded: true,
                          underline: SizedBox(),
                          hint: getCustomFont("Choose a complex", 14.sp, hintColor, 1),
                          onChanged: (Estate? estate) {
                            setState(() {
                              selectedEstate = estate;
                              selectedUnit = null;
                            });
                            if (estate != null) {
                              _loadUnitsForEstate(estate.id);
                            }
                          },
                          items: availableEstates.map((Estate estate) {
                            return DropdownMenuItem<Estate>(
                              value: estate,
                              child: getCustomFont(estate.name, 14.sp, Colors.black, 1),
                            );
                          }).toList(),
                        ),
                      ),

                      getVerSpace(15.h),

                      // Unit Dropdown (only show if estate is selected)
                      if (selectedEstate != null) ...[
                        getCustomFont("Select Unit", 14.sp, Colors.black, 1,
                            fontWeight: FontWeight.w500),
                        getVerSpace(8.h),
                        Container(
                          padding: EdgeInsets.symmetric(horizontal: 15.w, vertical: 12.h),
                          decoration: BoxDecoration(
                            border: Border.all(color: Colors.grey.shade300),
                            borderRadius: BorderRadius.circular(8.h),
                          ),
                          child: DropdownButton<Unit>(
                            value: selectedUnit,
                            isExpanded: true,
                            underline: SizedBox(),
                            hint: getCustomFont("Choose a unit", 14.sp, hintColor, 1),
                            onChanged: (Unit? unit) {
                              setState(() {
                                selectedUnit = unit;
                              });
                            },
                            items: availableUnits.map((Unit unit) {
                              return DropdownMenuItem<Unit>(
                                value: unit,
                                child: getCustomFont("Unit ${unit.unitNumber}", 14.sp, Colors.black, 1),
                              );
                            }).toList(),
                          ),
                        ),
                      ],
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
                isProcessing ? Colors.grey : pacificBlue,
                isProcessing ? "Processing..." : "Purchase Electricity",
                Colors.white,
                () {
                  print('🔥 BUTTON CLICKED! isProcessing: $isProcessing');
                  if (!isProcessing) {
                    processPurchase();
                  } else {
                    print('🔥 Button disabled - already processing');
                  }
                },
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