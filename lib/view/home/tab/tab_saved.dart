import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';
import 'package:khanyi_vending_app/util/color_category.dart';
import 'package:khanyi_vending_app/util/constant_widget.dart';
import 'package:khanyi_vending_app/model/incident_model.dart';
import 'package:khanyi_vending_app/datafile/datafile.dart';
import 'package:khanyi_vending_app/services/auth_service.dart';
import 'package:khanyi_vending_app/services/purchase_service.dart';
import 'package:khanyi_vending_app/services/incident_service.dart';

class TabSaved extends StatefulWidget {
  const TabSaved({Key? key}) : super(key: key);

  @override
  State<TabSaved> createState() => _TabSavedState();
}

class _TabSavedState extends State<TabSaved> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  // Services
  final AuthService _authService = Get.find<AuthService>();
  final PurchaseService _purchaseService = Get.find<PurchaseService>();
  final IncidentService _incidentService = Get.put(IncidentService());

  // Log Incident Form Controllers
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _phoneController = TextEditingController();
  final TextEditingController _meterNumberController = TextEditingController();
  final TextEditingController _descriptionController = TextEditingController();
  
  String _selectedIssueType = "Token not received";
  String _selectedUrgency = "Medium";
  
  final List<String> _issueTypes = [
    "Token not received",
    "Token rejected by meter",
    "Meter not working",
    "Payment failed",
    "Double charged",
    "App crashes",
    "Feature not working",
    "Other"
  ];

  String _mapIssueTypeToCategory(String issueType) {
    switch (issueType) {
      case "Token not received":
        return "Token Problem";
      case "Token rejected by meter":
        return "Token Problem";
      case "Meter not working":
        return "Meter Issue";
      case "Payment failed":
        return "Payment Issue";
      case "Double charged":
        return "Payment Issue";
      case "App crashes":
        return "App/System Error";
      case "Feature not working":
        return "App/System Error";
      case "Other":
        return "General Support";
      default:
        return "General Support";
    }
  }
  
  final List<String> _urgencyLevels = [
    "Low",
    "Medium", 
    "High",
    "Critical"
  ];

  List<IncidentModel> incidentHistory = DataFile.incidentHistory;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _populateUserData();
  }

  Future<void> _populateUserData() async {
    try {
      // Auto-populate user's full name and phone if logged in
      if (_authService.currentUser.value != null) {
        final user = _authService.currentUser.value!;
        _nameController.text = '${user.firstName} ${user.lastName}';
        _phoneController.text = user.phone;

        // Get user's meter number from their unit
        final userUnit = await _authService.getUserUnit();
        if (userUnit != null && userUnit['meter'] != null) {
          final meterNumber = userUnit['meter']['meterNumber'];
          if (meterNumber != null) {
            _meterNumberController.text = meterNumber;
          }
        }

        // Update the UI
        if (mounted) {
          setState(() {});
        }
      }
    } catch (e) {
      print('Error populating user data: $e');
    }
  }

  Future<void> _submitIncident() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    try {
      // Get user's unit information for the incident
      String? unitId;
      String? meterId;

      final userUnit = await _authService.getUserUnit();
      if (userUnit != null) {
        unitId = userUnit['unit']?['id'];
        meterId = userUnit['meter']?['_id'];
      }

      final incident = await _incidentService.createIncident(
        category: _mapIssueTypeToCategory(_selectedIssueType),
        subcategory: _selectedIssueType,
        priority: _selectedUrgency,
        subject: 'Electricity Vending Issue - $_selectedIssueType',
        description: _descriptionController.text.trim(),
        unitId: unitId,
        meterId: meterId,
      );

      if (incident != null) {
        // Clear the form
        _nameController.clear();
        _phoneController.clear();
        _meterNumberController.clear();
        _descriptionController.clear();
        _selectedIssueType = "Token not received";
        _selectedUrgency = "Medium";

        // Repopulate user data
        await _populateUserData();

        // Switch to history tab to show the new incident
        _tabController.animateTo(1);

        // Refresh the incident list
        await _incidentService.refreshIncidents();

        if (mounted) {
          setState(() {});
        }
      }
    } catch (e) {
      print('Error submitting incident: $e');
      Get.snackbar(
        'Error',
        'Failed to submit incident. Please try again.',
        backgroundColor: Colors.red.withValues(alpha: 0.8),
        colorText: Colors.white,
      );
    }
  }

  @override
  void dispose() {
    _tabController.dispose();
    _nameController.dispose();
    _phoneController.dispose();
    _meterNumberController.dispose();
    _descriptionController.dispose();
    super.dispose();
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
                getCustomFont("Incident Management", 24.sp, Colors.black, 1,
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
            ).marginSymmetric(horizontal: 20.h),
            getVerSpace(20.h),
            
            // Modern Professional Tab Bar
            Container(
              margin: EdgeInsets.symmetric(horizontal: 20.h),
              padding: EdgeInsets.all(4.h),
              decoration: BoxDecoration(
                color: bgColor,
                borderRadius: BorderRadius.circular(16.h),
                border: Border.all(color: borderColor, width: 1),
              ),
              child: TabBar(
                controller: _tabController,
                dividerColor: Colors.transparent,
                indicator: BoxDecoration(
                  borderRadius: BorderRadius.circular(12.h),
                  color: pacificBlue,
                  boxShadow: [
                    BoxShadow(
                      color: pacificBlue.withValues(alpha: 0.2),
                      blurRadius: 8,
                      offset: Offset(0, 2),
                    ),
                  ],
                ),
                indicatorSize: TabBarIndicatorSize.tab,
                labelColor: Colors.white,
                unselectedLabelColor: hintColor,
                labelStyle: TextStyle(
                  fontWeight: FontWeight.w600, 
                  fontSize: 14.sp,
                  fontFamily: 'SF UI Text',
                ),
                unselectedLabelStyle: TextStyle(
                  fontWeight: FontWeight.w500, 
                  fontSize: 14.sp,
                  fontFamily: 'SF UI Text',
                ),
                tabs: [
                  Tab(
                    height: 44.h,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.report_problem_outlined, size: 18.h),
                        SizedBox(width: 6.w),
                        Text("Log Incident"),
                      ],
                    ),
                  ),
                  Tab(
                    height: 44.h,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.history, size: 18.h),
                        SizedBox(width: 6.w),
                        Text("History"),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            getVerSpace(20.h),
            
            // Tab Bar View
            Expanded(
              child: TabBarView(
                controller: _tabController,
                children: [
                  _buildLogIncidentTab(),
                  _buildIncidentHistoryTab(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLogIncidentTab() {
    return SingleChildScrollView(
      padding: EdgeInsets.symmetric(horizontal: 20.h),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            getCustomFont("Report electricity vending issues", 16.sp, hintColor, 1,
                fontWeight: FontWeight.w400),
            getVerSpace(20.h),
            
            // Personal Information Section
            Container(
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
                  getCustomFont("Personal Information", 18.sp, Colors.black, 1,
                      fontWeight: FontWeight.w600),
                  getVerSpace(16.h),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      getCustomFont("Full Name", 14.sp, hintColor, 1,
                          fontWeight: FontWeight.w500),
                      getVerSpace(8.h),
                      defaultTextField(context, _nameController, "Enter your full name"),
                    ],
                  ),
                  getVerSpace(16.h),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      getCustomFont("Phone Number", 14.sp, hintColor, 1,
                          fontWeight: FontWeight.w500),
                      getVerSpace(8.h),
                      defaultTextField(context, _phoneController, "Enter your phone number"),
                    ],
                  ),
                  getVerSpace(16.h),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      getCustomFont("Meter Number (Optional)", 14.sp, hintColor, 1,
                          fontWeight: FontWeight.w500),
                      getVerSpace(8.h),
                      defaultTextField(context, _meterNumberController, "Enter meter number"),
                    ],
                  ),
                ],
              ),
            ),
            getVerSpace(20.h),
            
            // Issue Details Section
            Container(
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
                  getCustomFont("Issue Details", 18.sp, Colors.black, 1,
                      fontWeight: FontWeight.w600),
                  getVerSpace(16.h),
                  
                  // Issue Type Dropdown
                  getCustomFont("Type of Issue", 14.sp, hintColor, 1,
                      fontWeight: FontWeight.w500),
                  getVerSpace(8.h),
                  Container(
                    padding: EdgeInsets.symmetric(horizontal: 16.h, vertical: 4.h),
                    decoration: BoxDecoration(
                      color: Colors.grey.shade100,
                      borderRadius: BorderRadius.circular(12.h),
                    ),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        value: _selectedIssueType,
                        isExpanded: true,
                        items: _issueTypes.map((String value) {
                          return DropdownMenuItem<String>(
                            value: value,
                            child: getCustomFont(value, 16.sp, Colors.black, 1,
                                fontWeight: FontWeight.w400),
                          );
                        }).toList(),
                        onChanged: (String? newValue) {
                          setState(() {
                            _selectedIssueType = newValue!;
                          });
                        },
                      ),
                    ),
                  ),
                  getVerSpace(16.h),
                  
                  // Urgency Level
                  getCustomFont("Urgency Level", 14.sp, hintColor, 1,
                      fontWeight: FontWeight.w500),
                  getVerSpace(8.h),
                  Container(
                    padding: EdgeInsets.symmetric(horizontal: 16.h, vertical: 4.h),
                    decoration: BoxDecoration(
                      color: Colors.grey.shade100,
                      borderRadius: BorderRadius.circular(12.h),
                    ),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        value: _selectedUrgency,
                        isExpanded: true,
                        items: _urgencyLevels.map((String value) {
                          Color urgencyColor = Colors.black;
                          switch (value) {
                            case "Critical":
                              urgencyColor = accentRed;
                              break;
                            case "High":
                              urgencyColor = accentRed.withValues(alpha: 0.7);
                              break;
                            case "Medium":
                              urgencyColor = hintColor;
                              break;
                            case "Low":
                              urgencyColor = pacificBlue;
                              break;
                          }
                          return DropdownMenuItem<String>(
                            value: value,
                            child: getCustomFont(value, 16.sp, urgencyColor, 1,
                                fontWeight: FontWeight.w500),
                          );
                        }).toList(),
                        onChanged: (String? newValue) {
                          setState(() {
                            _selectedUrgency = newValue!;
                          });
                        },
                      ),
                    ),
                  ),
                  getVerSpace(16.h),
                  
                  // Description
                  getCustomFont("Description", 14.sp, hintColor, 1,
                      fontWeight: FontWeight.w500),
                  getVerSpace(8.h),
                  Container(
                    padding: EdgeInsets.all(16.h),
                    decoration: BoxDecoration(
                      color: Colors.grey.shade100,
                      borderRadius: BorderRadius.circular(12.h),
                    ),
                    child: TextFormField(
                      controller: _descriptionController,
                      maxLines: 4,
                      decoration: InputDecoration(
                        border: InputBorder.none,
                        hintText: "Please describe the issue in detail...",
                        hintStyle: TextStyle(
                          color: hintColor,
                          fontSize: 16.sp,
                        ),
                      ),
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Please describe the issue';
                        }
                        return null;
                      },
                    ),
                  ),
                ],
              ),
            ),
            getVerSpace(30.h),
            
            // Submit Button
            getButton(
              context,
              pacificBlue,
              "Submit Incident",
              Colors.white,
              () {
                if (_formKey.currentState!.validate()) {
                  _submitIncident();
                }
              },
              18.sp,
              borderRadius: BorderRadius.circular(16.h),
              buttonHeight: 60.h,
              weight: FontWeight.w700,
            ),
            getVerSpace(20.h),
          ],
        ),
      ),
    );
  }

  Widget _buildIncidentHistoryTab() {
    return Obx(() {
      if (_incidentService.isLoading.value) {
        return Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              CircularProgressIndicator(color: pacificBlue),
              getVerSpace(20.h),
              getCustomFont("Loading incidents...", 16.sp, hintColor, 1,
                  fontWeight: FontWeight.w500),
            ],
          ),
        );
      }

      final incidents = _incidentService.incidents;

      return incidents.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  getSvgImage("setting.svg", height: 80.h, width: 80.h),
                  getVerSpace(20.h),
                  getCustomFont("No incidents reported", 18.sp, Colors.black, 1,
                      fontWeight: FontWeight.w600),
                  getVerSpace(8.h),
                  getCustomFont("Your incident reports will appear here", 14.sp, hintColor, 1,
                      fontWeight: FontWeight.w400, textAlign: TextAlign.center),
                  getVerSpace(20.h),
                  ElevatedButton(
                    onPressed: () => _incidentService.refreshIncidents(),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: pacificBlue,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12.h),
                      ),
                    ),
                    child: Text('Refresh', style: TextStyle(color: Colors.white)),
                  ),
                ],
              ),
            )
          : RefreshIndicator(
              onRefresh: () => _incidentService.refreshIncidents(),
              child: ListView.builder(
                padding: EdgeInsets.symmetric(horizontal: 20.h),
                itemCount: incidents.length,
                itemBuilder: (context, index) {
                  IncidentModel incident = incidents[index];
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
                              getCustomFont(incident.incidentNumber, 16.sp, Colors.black, 1,
                                  fontWeight: FontWeight.w600),
                              getVerSpace(4.h),
                              getCustomFont(incident.subject, 14.sp, hintColor, 1,
                                  fontWeight: FontWeight.w400),
                            ],
                          ),
                        ),
                        Container(
                          padding: EdgeInsets.symmetric(horizontal: 12.h, vertical: 6.h),
                          decoration: BoxDecoration(
                            color: _getStatusColor(incident.status).withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(8.h),
                          ),
                          child: getCustomFont(incident.status, 12.sp, 
                              _getStatusColor(incident.status), 1,
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
                              getCustomFont("Urgency", 12.sp, hintColor, 1,
                                  fontWeight: FontWeight.w400),
                              getVerSpace(4.h),
                              getCustomFont(incident.urgency, 14.sp, 
                                  _getUrgencyColor(incident.urgency), 1,
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
                              getCustomFont("${incident.reportedDate.day}/${incident.reportedDate.month}/${incident.reportedDate.year}", 14.sp, Colors.black, 1,
                                  fontWeight: FontWeight.w500),
                            ],
                          ),
                        ),
                      ],
                    ),
                    getVerSpace(12.h),
                    getCustomFont("Description:", 12.sp, hintColor, 1,
                        fontWeight: FontWeight.w400),
                    getVerSpace(4.h),
                    getCustomFont(incident.description, 14.sp, Colors.black, 1,
                        fontWeight: FontWeight.w400),
                    if (incident.responseMessage != null && incident.responseMessage!.isNotEmpty) ...[
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
                            getCustomFont("Response:", 12.sp, hintColor, 1,
                                fontWeight: FontWeight.w400),
                            getVerSpace(4.h),
                            getCustomFont(incident.responseMessage!, 14.sp, Colors.black, 1,
                                fontWeight: FontWeight.w400),
                          ],
                        ),
                      ),
                    ],
                  ],
                ),
              );
            },
          ),
        );
    });
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case "resolved":
        return pacificBlue;
      case "in_progress":
      case "assigned":
        return accentRed.withValues(alpha: 0.6);
      case "open":
      case "new":
      case "pending":
        return hintColor;
      default:
        return hintColor;
    }
  }

  Color _getUrgencyColor(String urgency) {
    switch (urgency.toLowerCase()) {
      case "critical":
        return accentRed;
      case "high":
        return accentRed.withValues(alpha: 0.7);
      case "medium":
        return hintColor;
      case "low":
        return pacificBlue;
      default:
        return hintColor;
    }
  }
}