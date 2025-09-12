import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';
import 'package:khanyi_vending_app/util/color_category.dart';
import 'package:khanyi_vending_app/util/constant.dart';
import 'package:khanyi_vending_app/util/constant_widget.dart';
import 'package:khanyi_vending_app/model/incident_model.dart';
import 'package:khanyi_vending_app/datafile/datafile.dart';

class TabSaved extends StatefulWidget {
  const TabSaved({Key? key}) : super(key: key);

  @override
  State<TabSaved> createState() => _TabSavedState();
}

class _TabSavedState extends State<TabSaved> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  
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
    "Incorrect amount charged",
    "Meter not accepting token",
    "Payment failed but amount deducted",
    "App not working properly",
    "Cannot select my complex",
    "Other technical issue"
  ];
  
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
                      color: pacificBlue.withOpacity(0.2),
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
                              urgencyColor = accentRed.withOpacity(0.7);
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
    return incidentHistory.isEmpty
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
              ],
            ),
          )
        : ListView.builder(
            padding: EdgeInsets.symmetric(horizontal: 20.h),
            itemCount: incidentHistory.length,
            itemBuilder: (context, index) {
              IncidentModel incident = incidentHistory[index];
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
                              getCustomFont(incident.id, 16.sp, Colors.black, 1,
                                  fontWeight: FontWeight.w600),
                              getVerSpace(4.h),
                              getCustomFont(incident.issueType, 14.sp, hintColor, 1,
                                  fontWeight: FontWeight.w400),
                            ],
                          ),
                        ),
                        Container(
                          padding: EdgeInsets.symmetric(horizontal: 12.h, vertical: 6.h),
                          decoration: BoxDecoration(
                            color: _getStatusColor(incident.status).withOpacity(0.1),
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
                    if (incident.responseMessage.isNotEmpty) ...[
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
                            getCustomFont(incident.responseMessage, 14.sp, Colors.black, 1,
                                fontWeight: FontWeight.w400),
                          ],
                        ),
                      ),
                    ],
                  ],
                ),
              );
            },
          );
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case "Resolved":
        return pacificBlue;  // Green for resolved
      case "In Progress":
        return accentRed.withOpacity(0.6);  // Subtle red for in progress
      case "Pending":
        return hintColor;  // Neutral for pending
      default:
        return hintColor;
    }
  }

  Color _getUrgencyColor(String urgency) {
    switch (urgency) {
      case "Critical":
        return accentRed;  // Red for critical issues
      case "High":
        return accentRed.withOpacity(0.7);  // Lighter red for high
      case "Medium":
        return hintColor;  // Neutral for medium
      case "Low":
        return pacificBlue;  // Green for low priority
      default:
        return hintColor;
    }
  }

  void _submitIncident() {
    // Generate incident ID
    String incidentId = "INC${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}";
    
    // Add new incident to history (in a real app, this would be sent to server)
    IncidentModel newIncident = IncidentModel(
      incidentId,
      _nameController.text,
      _phoneController.text,
      _meterNumberController.text,
      _selectedIssueType,
      _selectedUrgency,
      _descriptionController.text,
      DateTime.now(),
      "Pending",
      "",
    );
    
    setState(() {
      incidentHistory.insert(0, newIncident);
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
            getCustomFont("Incident Submitted", 18.sp, Colors.black, 1,
                fontWeight: FontWeight.w600),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            getCustomFont("Your incident has been successfully submitted.", 16.sp, Colors.black, 1,
                fontWeight: FontWeight.w400),
            getVerSpace(12.h),
            Container(
              padding: EdgeInsets.all(12.h),
              decoration: BoxDecoration(
                color: Colors.grey.shade100,
                borderRadius: BorderRadius.circular(8.h),
              ),
              child: Row(
                children: [
                  getCustomFont("Incident ID: ", 14.sp, hintColor, 1,
                      fontWeight: FontWeight.w400),
                  getCustomFont(incidentId, 14.sp, Colors.black, 1,
                      fontWeight: FontWeight.w600),
                ],
              ),
            ),
            getVerSpace(12.h),
            getCustomFont("Our support team will contact you within 24 hours.", 14.sp, hintColor, 1,
                fontWeight: FontWeight.w400),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              Get.back();
              _clearForm();
              // Switch to history tab to show the new incident
              _tabController.animateTo(1);
            },
            child: getCustomFont("OK", 16.sp, pacificBlue, 1,
                fontWeight: FontWeight.w600),
          ),
        ],
      ),
    );
  }

  void _clearForm() {
    _nameController.clear();
    _phoneController.clear();
    _meterNumberController.clear();
    _descriptionController.clear();
    setState(() {
      _selectedIssueType = "Token not received";
      _selectedUrgency = "Medium";
    });
  }
}