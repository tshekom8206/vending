import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';
import 'package:khanyi_vending_app/model/complex_model.dart';
import 'package:khanyi_vending_app/model/unit_model.dart';
import 'package:khanyi_vending_app/model/api_models.dart';
import 'package:khanyi_vending_app/util/color_category.dart';
import 'package:khanyi_vending_app/util/constant.dart';
import 'package:khanyi_vending_app/util/constant_widget.dart';
import 'package:khanyi_vending_app/services/estate_service.dart';
import 'package:khanyi_vending_app/view/home/tab/tab_home_screens/electricity_purchase_screen.dart';

class ComplexSelectionScreen extends StatefulWidget {
  const ComplexSelectionScreen({Key? key}) : super(key: key);

  @override
  State<ComplexSelectionScreen> createState() => _ComplexSelectionScreenState();
}

class _ComplexSelectionScreenState extends State<ComplexSelectionScreen> {
  ComplexSelectionController controller = Get.put(ComplexSelectionController());
  final EstateService _estateService = Get.find<EstateService>();
  ComplexModel? selectedComplex;
  String? selectedEstateId; // Store the actual estate ID
  UnitModel? selectedUnit;
  bool isLoadingUnits = false;

  @override
  void initState() {
    super.initState();
    _estateService.fetchEstates();
  }

  void backClick() {
    Constant.backToFinish();
  }

  void selectComplex(ComplexModel complex, String estateId) {
    print('🔥 SELECT COMPLEX: Called with complex: ${complex.name}, estateId: $estateId');
    setState(() {
      selectedComplex = complex;
      selectedEstateId = estateId;
      selectedUnit = null; // Reset unit selection
      isLoadingUnits = true;
    });

    print('🔥 SELECT COMPLEX: About to fetch units for estate: $estateId');
    // Fetch units for the selected estate
    _estateService.fetchUnits(estateId: estateId).then((_) {
      print('🔥 SELECT COMPLEX: Successfully fetched ${_estateService.units.length} units');
      if (mounted) {
        setState(() {
          isLoadingUnits = false;
        });
      }
    }).catchError((error) {
      print('🔥 SELECT COMPLEX ERROR: Error fetching units: $error');
      if (mounted) {
        setState(() {
          isLoadingUnits = false;
        });
      }
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

                      Obx(() {
                        if (_estateService.isLoading.value) {
                          return Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                CircularProgressIndicator(color: pacificBlue),
                                getVerSpace(20.h),
                                getCustomFont("Loading estates...", 16.sp, hintColor, 1,
                                    fontWeight: FontWeight.w500),
                              ],
                            ),
                          );
                        }

                        final estates = _estateService.estates;

                        if (estates.isEmpty) {
                          return Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.business_outlined, size: 64.h, color: hintColor),
                                getVerSpace(20.h),
                                getCustomFont("No estates found", 16.sp, hintColor, 1,
                                    fontWeight: FontWeight.w500),
                                getVerSpace(8.h),
                                getCustomFont("Please check back later", 14.sp, hintColor, 1,
                                    fontWeight: FontWeight.w400),
                              ],
                            ),
                          );
                        }

                        return ListView.builder(
                          shrinkWrap: true,
                          physics: NeverScrollableScrollPhysics(),
                          itemCount: estates.length,
                          itemBuilder: (context, index) {
                            final estate = estates[index];
                            // Convert Estate to ComplexModel for compatibility
                            final complex = ComplexModel(
                              "complex1st.png", // Default image
                              estate.name,
                              "${estate.address.city ?? ''}, ${estate.address.province ?? ''}",
                              estate.address.city ?? '',
                              estate.type,
                              "R${estate.tariff.rate.toStringAsFixed(2)}/kWh",
                              "${estate.address.street ?? ''}, ${estate.address.city ?? ''}",
                              [], // We'll fetch units separately
                              false
                            );
                          bool isSelected = selectedComplex?.name == complex.name;
                          
                          return GestureDetector(
                            onTap: () => selectComplex(complex, estate.id),
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
                      );
                      }),

                      if (selectedComplex != null) ...[
                        getVerSpace(30.h),
                        getCustomFont("Select Unit:", 16.sp, Colors.black, 1,
                            fontWeight: FontWeight.w600)
                            .paddingSymmetric(horizontal: 20.w),
                        getVerSpace(15.h),
                        
                        // Unit Selection
                        Obx(() {
                          if (isLoadingUnits) {
                            return Center(
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  CircularProgressIndicator(color: pacificBlue),
                                  getVerSpace(20.h),
                                  getCustomFont("Loading units...", 16.sp, hintColor, 1,
                                      fontWeight: FontWeight.w500),
                                ],
                              ),
                            ).paddingSymmetric(horizontal: 20.w, vertical: 40.h);
                          }

                          final units = _estateService.units;
                          print('🔥 UNIT BUILDER: Total units from service: ${units.length}');
                          print('🔥 UNIT BUILDER: Selected estate ID: $selectedEstateId');

                          final filteredUnits = selectedEstateId != null
                              ? units.where((unit) => unit.estateId == selectedEstateId).toList()
                              : <Unit>[];

                          print('🔥 UNIT BUILDER: Filtered units for estate: ${filteredUnits.length}');
                          if (filteredUnits.isNotEmpty) {
                            print('🔥 UNIT BUILDER: First filtered unit estate ID: ${filteredUnits.first.estateId}');
                          }

                          if (filteredUnits.isEmpty) {
                            return getCustomFont("No units available for this estate", 14.sp, hintColor, 1)
                                .paddingSymmetric(horizontal: 20.w);
                          }

                          return ListView.builder(
                            shrinkWrap: true,
                            physics: NeverScrollableScrollPhysics(),
                            itemCount: filteredUnits.length,
                            itemBuilder: (context, index) {
                              final apiUnit = filteredUnits[index];
                              // Convert API Unit to UnitModel for compatibility
                              final unit = UnitModel(
                                apiUnit.unitNumber,
                                'M${apiUnit.unitNumber}', // Generate meter number
                                selectedEstateId ?? '', // complexId
                                apiUnit.tenant?.fullName ?? 'Vacant', // tenantName
                                apiUnit.tenant?.phone ?? '', // tenantPhone
                                apiUnit.status == 'Occupied', // isOccupied
                                100.0, // currentBalance - default for now
                              );

                              bool isSelected = selectedUnit?.unitNumber == unit.unitNumber;
                              bool isOccupied = apiUnit.status == 'Occupied';

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
                                              getCustomFont("Status: ${apiUnit.status}",
                                                  12.sp, pacificBlue, 1, fontWeight: FontWeight.w500),
                                            ],
                                            if (apiUnit.specifications?.bedrooms != null) ...[
                                              getVerSpace(2.h),
                                              getCustomFont("${apiUnit.specifications!.bedrooms}BR, ${apiUnit.specifications!.bathrooms}BA",
                                                  11.sp, hintColor, 1),
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
                        }),
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