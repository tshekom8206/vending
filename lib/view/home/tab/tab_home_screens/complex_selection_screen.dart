import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';
import 'package:khanyi_vending_app/controller/controller.dart';
import 'package:khanyi_vending_app/datafile/datafile.dart';
import 'package:khanyi_vending_app/model/complex_model.dart';
import 'package:khanyi_vending_app/model/unit_model.dart';
import 'package:khanyi_vending_app/util/color_category.dart';
import 'package:khanyi_vending_app/util/constant.dart';
import 'package:khanyi_vending_app/util/constant_widget.dart';
import 'package:khanyi_vending_app/view/home/tab/tab_home_screens/electricity_purchase_screen.dart';

class ComplexSelectionScreen extends StatefulWidget {
  const ComplexSelectionScreen({Key? key}) : super(key: key);

  @override
  State<ComplexSelectionScreen> createState() => _ComplexSelectionScreenState();
}

class _ComplexSelectionScreenState extends State<ComplexSelectionScreen> {
  ComplexSelectionController controller = Get.put(ComplexSelectionController());
  List<ComplexModel> complexList = DataFile.complexList;
  ComplexModel? selectedComplex;
  UnitModel? selectedUnit;

  void backClick() {
    Constant.backToFinish();
  }

  void selectComplex(ComplexModel complex) {
    setState(() {
      selectedComplex = complex;
      selectedUnit = null; // Reset unit selection
    });
  }

  void selectUnit(UnitModel unit) {
    setState(() {
      selectedUnit = unit;
    });
  }

  void proceedToPurchase() {
    if (selectedComplex == null || selectedUnit == null) {
      Get.snackbar("Error", "Please select both complex and unit");
      return;
    }

    Get.to(() => ElectricityPurchaseScreen(
      complexName: selectedComplex!.name,
      tariffRate: selectedComplex!.tariffRate,
      meterNumber: selectedUnit!.meterNumber,
      unitNumber: selectedUnit!.unitNumber,
    ));
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
              getAppBar("Select Residential Complex", () => backClick())
                  .paddingSymmetric(horizontal: 20.w),
              getVerSpace(30.h),
              
              // Instructions
              getCustomFont("Choose your residential complex and unit to purchase electricity", 
                  14.sp, hintColor, 2, fontWeight: FontWeight.w400)
                  .paddingSymmetric(horizontal: 20.w),
              getVerSpace(20.h),
              
              Expanded(
                child: SingleChildScrollView(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Complex Selection
                      getCustomFont("Select Complex:", 16.sp, Colors.black, 1,
                          fontWeight: FontWeight.w600)
                          .paddingSymmetric(horizontal: 20.w),
                      getVerSpace(15.h),
                      
                      ListView.builder(
                        shrinkWrap: true,
                        physics: NeverScrollableScrollPhysics(),
                        itemCount: complexList.length,
                        itemBuilder: (context, index) {
                          ComplexModel complex = complexList[index];
                          bool isSelected = selectedComplex?.name == complex.name;
                          
                          return GestureDetector(
                            onTap: () => selectComplex(complex),
                            child: Container(
                              margin: EdgeInsets.symmetric(horizontal: 20.w, vertical: 8.h),
                              padding: EdgeInsets.all(16.h),
                              decoration: BoxDecoration(
                                color: isSelected ? lightPacific : Colors.white,
                                borderRadius: BorderRadius.circular(12.h),
                                border: Border.all(
                                  color: isSelected ? pacificBlue : shadowColor,
                                  width: isSelected ? 2 : 1,
                                ),
                                boxShadow: [
                                  BoxShadow(
                                    color: shadowColor.withOpacity(0.1),
                                    offset: Offset(0, 2),
                                    blurRadius: 4,
                                  )
                                ],
                              ),
                              child: Row(
                                children: [
                                  Container(
                                    width: 60.w,
                                    height: 60.h,
                                    decoration: BoxDecoration(
                                      borderRadius: BorderRadius.circular(8.h),
                                      image: DecorationImage(
                                        image: AssetImage(Constant.assetImagePath + complex.image),
                                        fit: BoxFit.cover,
                                      ),
                                    ),
                                  ),
                                  getHorSpace(15.w),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        getCustomFont(complex.name, 16.sp, Colors.black, 1,
                                            fontWeight: FontWeight.w600),
                                        getVerSpace(4.h),
                                        getCustomFont("${complex.location}, ${complex.city}", 
                                            14.sp, hintColor, 1),
                                        getVerSpace(4.h),
                                        Row(
                                          children: [
                                            getCustomFont(complex.tariffRate, 14.sp, pacificBlue, 1,
                                                fontWeight: FontWeight.w600),
                                            Spacer(),
                                            getCustomFont("${complex.availableUnits.length} units", 
                                                12.sp, hintColor, 1),
                                          ],
                                        ),
                                      ],
                                    ),
                                  ),
                                  if (isSelected)
                                    Icon(Icons.check_circle, color: pacificBlue, size: 24.h),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
                      
                      if (selectedComplex != null) ...[
                        getVerSpace(30.h),
                        getCustomFont("Select Unit:", 16.sp, Colors.black, 1,
                            fontWeight: FontWeight.w600)
                            .paddingSymmetric(horizontal: 20.w),
                        getVerSpace(15.h),
                        
                        // Unit Selection
                        Builder(
                          builder: (context) {
                            String complexId = selectedComplex!.name.toLowerCase().replaceAll(' ', '_');
                            List<UnitModel> units = DataFile.getUnitsForComplex(complexId);
                            
                            if (units.isEmpty) {
                              return getCustomFont("No units available", 14.sp, hintColor, 1)
                                  .paddingSymmetric(horizontal: 20.w);
                            }
                            
                            return ListView.builder(
                              shrinkWrap: true,
                              physics: NeverScrollableScrollPhysics(),
                              itemCount: units.length,
                              itemBuilder: (context, index) {
                                UnitModel unit = units[index];
                                bool isSelected = selectedUnit?.unitNumber == unit.unitNumber;
                                bool isOccupied = unit.isOccupied;
                                
                                return GestureDetector(
                                  onTap: () => isOccupied ? selectUnit(unit) : null,
                                  child: Container(
                                    margin: EdgeInsets.symmetric(horizontal: 20.w, vertical: 6.h),
                                    padding: EdgeInsets.all(16.h),
                                    decoration: BoxDecoration(
                                      color: isOccupied 
                                          ? (isSelected ? lightPacific : Colors.white)
                                          : Colors.grey.shade100,
                                      borderRadius: BorderRadius.circular(12.h),
                                      border: Border.all(
                                        color: isOccupied 
                                            ? (isSelected ? pacificBlue : shadowColor)
                                            : Colors.grey.shade300,
                                        width: isSelected ? 2 : 1,
                                      ),
                                    ),
                                    child: Row(
                                      children: [
                                        Container(
                                          width: 40.w,
                                          height: 40.h,
                                          decoration: BoxDecoration(
                                            color: isOccupied ? pacificBlue : Colors.grey,
                                            borderRadius: BorderRadius.circular(20.h),
                                          ),
                                          child: Center(
                                            child: getCustomFont(unit.unitNumber, 12.sp, Colors.white, 1,
                                                fontWeight: FontWeight.w600),
                                          ),
                                        ),
                                        getHorSpace(15.w),
                                        Expanded(
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              getCustomFont("Unit ${unit.unitNumber}", 16.sp, 
                                                  isOccupied ? Colors.black : Colors.grey, 1,
                                                  fontWeight: FontWeight.w600),
                                              getVerSpace(2.h),
                                              getCustomFont("Meter: ${unit.meterNumber}", 12.sp, 
                                                  hintColor, 1),
                                              if (isOccupied) ...[
                                                getVerSpace(2.h),
                                                getCustomFont("Balance: ${unit.currentBalance.toStringAsFixed(1)} kWh", 
                                                    12.sp, pacificBlue, 1, fontWeight: FontWeight.w500),
                                              ],
                                            ],
                                          ),
                                        ),
                                        if (!isOccupied)
                                          getCustomFont("Available", 12.sp, Colors.grey, 1)
                                        else if (isSelected)
                                          Icon(Icons.check_circle, color: pacificBlue, size: 20.h),
                                      ],
                                    ),
                                  ),
                                );
                              },
                            );
                          },
                        ),
                      ],
                      
                      getVerSpace(100.h), // Space for button
                    ],
                  ),
                ),
              ),
            ],
          ),
          bottomNavigationBar: Container(
            padding: EdgeInsets.all(20.h),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: shadowColor.withOpacity(0.1),
                  offset: Offset(0, -2),
                  blurRadius: 4,
                )
              ],
            ),
            child: getButton(
              context,
              selectedComplex != null && selectedUnit != null ? pacificBlue : Colors.grey,
              "Purchase Electricity",
              Colors.white,
              proceedToPurchase,
              16.sp,
              buttonHeight: 50.h,
              weight: FontWeight.w600,
              borderRadius: BorderRadius.circular(12.h),
            ),
          ),
        ),
      ),
    );
  }
}

// Add controller for complex selection
class ComplexSelectionController extends GetxController {
  RxString selectedComplexId = ''.obs;
  RxString selectedUnitId = ''.obs;

  void selectComplex(String complexId) {
    selectedComplexId.value = complexId;
    selectedUnitId.value = ''; // Reset unit selection
    update();
  }

  void selectUnit(String unitId) {
    selectedUnitId.value = unitId;
    update();
  }
}