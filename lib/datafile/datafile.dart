import 'package:khanyi_vending_app/model/booking_data_model.dart';
import 'package:khanyi_vending_app/model/bottom_model.dart';
import 'package:khanyi_vending_app/model/category_model.dart';
import 'package:khanyi_vending_app/model/detail_screen_slider.dart';
import 'package:khanyi_vending_app/model/filter_buy_page_type_model.dart';
import 'package:khanyi_vending_app/model/intro_model.dart';
import 'package:khanyi_vending_app/model/messege_model.dart';
import 'package:khanyi_vending_app/model/notification_type_model.dart';
import 'package:khanyi_vending_app/model/recomended_model.dart';
import 'package:khanyi_vending_app/model/search_histry_data.dart';
import 'package:khanyi_vending_app/model/complex_model.dart';
import 'package:khanyi_vending_app/model/electricity_purchase_model.dart';
import 'package:khanyi_vending_app/model/unit_model.dart';
import 'package:khanyi_vending_app/model/incident_model.dart';
import 'package:khanyi_vending_app/model/notification_model.dart';

import '../model/saved_home_model.dart';

class DataFile {
  static List<ModelIntro> introList = [
    ModelIntro("intro1.png", "Welcome to Khanyi Solutions\nSmart Electricity Vending"),
    ModelIntro("intro2.png", "Select Your Residential Complex\nFind Your Building Instantly"),
    ModelIntro("intro3.png", "Purchase Electricity 24/7\nSecure & Convenient Payments"),
    ModelIntro("intro4.png", "Monitor Usage & History\nSmart Energy Management")
  ];
  static List<ModelBottom> bottomList = [
    ModelBottom("home.svg", "home_bold.svg", "Home"),
    ModelBottom("explore.svg", "explorer_bold.svg", "History"),
    ModelBottom("bookmark.svg", "bookmark_bold.svg", "Report"),
    ModelBottom("messages.svg", "message_bold.svg", "Support"),
    ModelBottom("setting.svg", "setting_bold.svg", "More")
  ];

  static List<ModelCategory> categoryList = [
    ModelCategory("", "All Complexes"),
    ModelCategory("lodge.png", "Residential"),
    ModelCategory("apartment.png", "Student Housing")
  ];

  // Converted to complexes
  static List<ComplexModel> complexList = [
    ComplexModel(
        "recomended1.png",
        "Greenstone Estate",
        "Kempton Park",
        "Johannesburg",
        "Residential",
        "R2.50/kWh",
        "39 Kweper Street, Allengroove",
        ["A101", "A102", "A103", "B201", "B202"],
        false),
    ComplexModel(
        "recomended2.png",
        "Waterfall Estate",
        "Midrand",
        "Johannesburg",
        "Residential",
        "R2.30/kWh",
        "Waterfall City Boulevard",
        ["W101", "W102", "W201", "W202"],
        false),
    ComplexModel(
        "recomended3.png",
        "City Property",
        "Johannesburg CBD",
        "Johannesburg",
        "Student Accommodation",
        "R2.80/kWh",
        "123 Main Street, CBD",
        ["CP001", "CP002", "CP003", "CP004", "CP005"],
        false),
    ComplexModel(
        "recomended1.png",
        "Sandton Views",
        "Sandton",
        "Johannesburg",
        "Residential",
        "R3.00/kWh",
        "Nelson Mandela Square",
        ["SV101", "SV102", "SV201"],
        false),
    ComplexModel(
        "recomended2.png",
        "Centurion Gardens",
        "Centurion",
        "Pretoria",
        "Residential",
        "R2.20/kWh",
        "Garden Route, Centurion",
        ["CG101", "CG102", "CG201", "CG202"],
        false)
  ];

  // Available residential complexes for electricity vending
  static List<ModelRecomended> recomendedList = [
    ModelRecomended(
        "recomended1.png",
        "Greenstone Estate",
        "Kempton Park, Johannesburg",
        "Residential Complex",
        "R2.50",
        "127 meters",
        false),
    ModelRecomended(
        "recomended2.png",
        "Waterfall Estate",
        "Midrand, Johannesburg",
        "Residential Complex",
        "R2.30",
        "95 meters",
        false),
    ModelRecomended(
        "recomended3.png",
        "City Properties",
        "Johannesburg CBD",
        "Student Accommodation",
        "R2.80",
        "203 meters",
        false)
  ];

  static List<DetailSlider> getDetailSliderData() {
    return [
      DetailSlider(image: "detail_image.png"),
      DetailSlider(image: "detail_image.png"),
      DetailSlider(image: "detail_image.png"),
      DetailSlider(image: "detail_image.png"),
    ];
  }

  static List<Search> getSearchData() {
    return [
      Search(image: 'recomended1.png',
          address: 'Kempton Park, Johannesburg',
          name: 'Greenstone Estate'),
      Search(image: 'recomended2.png',
          address: 'Midrand, Johannesburg',
          name: 'Waterfall Estate'),
      Search(image: 'recomended3.png',
          address: 'Johannesburg CBD',
          name: 'City Properties'),
      Search(image: 'search1st.png',
          address: 'Sandton, Johannesburg',
          name: 'Sandton Square Complex'),
      Search(image: 'search2nd.png',
          address: 'Rosebank, Johannesburg',
          name: 'Rosebank Residential'),
    ];
  }

  static List<ModelType> getTypeData() {
    return [
      ModelType(name: "House"),
      ModelType(name: "Apartment"),
      ModelType(name: "Flat"),
    ];
  }

  static List<SaveHome> getSaveHome() {
    return [
      SaveHome(name: 'Preston Inglewood Appartment',
          image: 'saved_home_1st.png',
          price: '\$1500',
          favourite: false),
      SaveHome(name: 'Wonderland Palace In Hawai',
          image: 'saved_home_2nd.png',
          price: '\$1100',
          favourite: false),
      SaveHome(name: 'Prefabricated House On Rent',
          image: 'saved_home_3rd.png',
          price: '\$800',
          favourite: false),
      SaveHome(name: 'Preston Inglewood House',
          image: 'saved_home_4th.png',
          price: '\$1500',
          favourite: false),
      SaveHome(name: 'Celina Appartment',
          image: 'saved_home_5th.png',
          price: '\$1500',
          favourite: false),
      SaveHome(name: 'Preston Inglewood Appartment',
          image: 'saved_home_6th.png',
          price: '\$1500',
          favourite: false)
    ];
  }

  static List<Messege> getMessege() {
    return [
      Messege(image: 'user1st.png',
          name: 'Khanyi Support Team',
          messege: 'Your recent purchase was successful. Token sent to your meter.',
          time: '10:02 PM'),
      Messege(image: 'user2nd.png',
          name: 'Technical Support',
          messege: 'We\'ve resolved your meter connection issue. Please try again.',
          time: '09:30 PM'),
      Messege(image: 'user3rd.png',
          name: 'Billing Support',
          messege: 'Your refund has been processed and will reflect within 24 hours.',
          time: '04:11 AM'),
      Messege(image: 'user4th.png',
          name: 'Customer Care',
          messege: 'Thank you for your feedback. We\'ve noted your suggestions.',
          time: '02:30 AM'),
      Messege(image: 'user5th.png',
          name: 'System Notifications',
          messege: 'Maintenance scheduled for tonight 2-4 AM. Service may be affected.',
          time: 'Aug 12'),
      Messege(image: 'user6th.png',
          name: 'Account Manager',
          messege: 'Your monthly usage report is now available in Reports section.',
          time: 'Aug 8'),
    ];
  }

  // Electricity purchase history
  static List<ElectricityPurchaseModel> getElectricityPurchases() {
    return [
      ElectricityPurchaseModel(
          "EP001",
          "Greenstone Estate", 
          "12345678901234567890",
          "A101",
          100.0,
          40.0,
          "1234 5678 9012 3456 7890",
          DateTime.now().subtract(Duration(days: 1)),
          "Completed",
          "TXN001"),
      ElectricityPurchaseModel(
          "EP002",
          "City Property",
          "09876543210987654321", 
          "CP001",
          50.0,
          17.8,
          "0987 6543 2109 8765 4321",
          DateTime.now().subtract(Duration(days: 3)),
          "Completed",
          "TXN002"),
      ElectricityPurchaseModel(
          "EP003",
          "Waterfall Estate",
          "11111222223333344444",
          "W201", 
          200.0,
          87.0,
          "1111 1222 2233 3334 4444",
          DateTime.now().subtract(Duration(days: 7)),
          "Completed",
          "TXN003"),
    ];
  }

  // Keep original for backward compatibility
  static List<BookingHome> getBookHome(){
    return [
      BookingHome(image: 'booking1st.png',name: 'Greenstone Estate',price: 'R100'),
      BookingHome(image: 'booking2nd.png',name: 'City Property',price: 'R50'),
      BookingHome(image: 'booking3rd.png',name: 'Waterfall Estate',price: 'R200'),
    ];
  }

  // Units/Meters for complexes
  static List<UnitModel> getUnitsForComplex(String complexId) {
    Map<String, List<UnitModel>> complexUnits = {
      "greenstone": [
        UnitModel("A101", "12345678901234567890", "greenstone", "John Doe", "+27123456789", true, 45.5),
        UnitModel("A102", "12345678901234567891", "greenstone", "Jane Smith", "+27123456790", true, 23.2),
        UnitModel("A103", "12345678901234567892", "greenstone", "", "", false, 0.0),
        UnitModel("B201", "12345678901234567893", "greenstone", "Bob Johnson", "+27123456791", true, 78.9),
        UnitModel("B202", "12345678901234567894", "greenstone", "", "", false, 0.0),
      ],
      "waterfall": [
        UnitModel("W101", "11111222223333344444", "waterfall", "Mary Wilson", "+27111222333", true, 120.4),
        UnitModel("W102", "11111222223333344445", "waterfall", "", "", false, 0.0),
        UnitModel("W201", "11111222223333344446", "waterfall", "Tom Brown", "+27111222334", true, 67.8),
        UnitModel("W202", "11111222223333344447", "waterfall", "Lisa Davis", "+27111222335", true, 34.1),
      ],
      "city_property": [
        UnitModel("CP001", "09876543210987654321", "city_property", "Student A", "+27987654321", true, 15.6),
        UnitModel("CP002", "09876543210987654322", "city_property", "Student B", "+27987654322", true, 28.9),
        UnitModel("CP003", "09876543210987654323", "city_property", "", "", false, 0.0),
        UnitModel("CP004", "09876543210987654324", "city_property", "Student C", "+27987654323", true, 12.3),
        UnitModel("CP005", "09876543210987654325", "city_property", "", "", false, 0.0),
      ],
      "sandton": [
        UnitModel("SV101", "55555666667777788888", "sandton", "Rich Person", "+27555666777", true, 234.5),
        UnitModel("SV102", "55555666667777788889", "sandton", "Another Rich", "+27555666778", true, 189.2),
        UnitModel("SV201", "55555666667777788890", "sandton", "", "", false, 0.0),
      ],
      "centurion": [
        UnitModel("CG101", "44444333332222211111", "centurion", "Family One", "+27444333222", true, 98.7),
        UnitModel("CG102", "44444333332222211112", "centurion", "Family Two", "+27444333223", true, 76.4),
        UnitModel("CG201", "44444333332222211113", "centurion", "", "", false, 0.0),
        UnitModel("CG202", "44444333332222211114", "centurion", "Family Three", "+27444333224", true, 54.2),
      ],
    };
    return complexUnits[complexId] ?? [];
  }

  static List<NotificationType> getNotificationType() {
    return [
      NotificationType(name: "All"),
      NotificationType(name: "Purchases"),
      NotificationType(name: "Low Balance"),
      NotificationType(name:  "System"),
    ];
  }

  // Purchase History
  static List<ElectricityPurchaseModel> purchaseHistory = [
    ElectricityPurchaseModel(
      "TXN001",
      "Greenstone Estate",
      "12345678901234567890",
      "A101",
      100.00,
      40.0,
      "12345-67890-12345-67890",
      DateTime.now().subtract(Duration(days: 2)),
      "Completed",
      "KV001234567890",
    ),
    ElectricityPurchaseModel(
      "TXN002",
      "Waterfall Estate",
      "11111222223333344444",
      "W101",
      50.00,
      20.0,
      "09876-54321-09876-54321",
      DateTime.now().subtract(Duration(days: 5)),
      "Completed",
      "KV001234567891",
    ),
    ElectricityPurchaseModel(
      "TXN003",
      "City Property",
      "09876543210987654321",
      "CP001",
      25.00,
      10.0,
      "11111-22222-33333-44444",
      DateTime.now().subtract(Duration(days: 8)),
      "Completed",
      "KV001234567892",
    ),
    ElectricityPurchaseModel(
      "TXN004",
      "Sandton Views",
      "55555666667777788888",
      "SV101",
      200.00,
      80.0,
      "99999-88888-77777-66666",
      DateTime.now().subtract(Duration(days: 12)),
      "Completed",
      "KV001234567893",
    ),
    ElectricityPurchaseModel(
      "TXN005",
      "Centurion Gate",
      "44444333332222211111",
      "CG101",
      75.00,
      30.0,
      "55555-44444-33333-22222",
      DateTime.now().subtract(Duration(days: 15)),
      "Completed",
      "KV001234567894",
    ),
  ];

  // Incident History
  static List<IncidentModel> incidentHistory = [
    IncidentModel(
      id: "INC12345678",
      incidentNumber: "INC12345678",
      name: "John Doe",
      phone: "+27123456789",
      meterNumber: "12345678901234567890",
      issueType: "Token not received",
      category: "Token not received",
      urgency: "High",
      priority: "High",
      subject: "Token not received",
      description: "Purchased R100 electricity but token was not delivered to my phone. Transaction reference: KV001234567890",
      reportedDate: DateTime.now().subtract(Duration(days: 1)),
      createdAt: DateTime.now().subtract(Duration(days: 1)),
      status: "Resolved",
      responseMessage: "Token has been resent to your phone. Please check your SMS.",
    ),
    IncidentModel(
      id: "INC87654321",
      incidentNumber: "INC87654321",
      name: "Mary Smith",
      phone: "+27987654321",
      meterNumber: "09876543210987654321",
      issueType: "Meter not accepting token",
      category: "Meter not accepting token",
      urgency: "Critical",
      priority: "Critical",
      subject: "Meter not accepting token",
      description: "My prepaid meter is rejecting the electricity token. Error code 30 appears on display.",
      reportedDate: DateTime.now().subtract(Duration(days: 3)),
      createdAt: DateTime.now().subtract(Duration(days: 3)),
      status: "In Progress",
      responseMessage: "Technician has been dispatched to your location. ETA: 2 hours",
    ),
    IncidentModel(
      id: "INC11223344",
      incidentNumber: "INC11223344",
      name: "Peter Johnson",
      phone: "+27111222333",
      meterNumber: "11111222223333344444",
      issueType: "Incorrect amount charged",
      category: "Incorrect amount charged",
      urgency: "Medium",
      priority: "Medium",
      subject: "Incorrect amount charged",
      description: "Was charged R150 but only received R100 worth of electricity units.",
      reportedDate: DateTime.now().subtract(Duration(days: 5)),
      createdAt: DateTime.now().subtract(Duration(days: 5)),
      status: "Resolved",
      responseMessage: "Refund of R50 has been processed and will reflect in 2-3 business days.",
    ),
    IncidentModel(
      id: "INC55667788",
      incidentNumber: "INC55667788",
      name: "Sarah Wilson",
      phone: "+27555666777",
      meterNumber: "55555666667777788888",
      issueType: "Payment failed but amount deducted",
      category: "Payment failed but amount deducted",
      urgency: "High",
      priority: "High",
      subject: "Payment failed but amount deducted",
      description: "Payment was deducted from my bank account but no electricity token was generated.",
      reportedDate: DateTime.now().subtract(Duration(days: 7)),
      createdAt: DateTime.now().subtract(Duration(days: 7)),
      status: "Resolved",
      responseMessage: "Transaction has been reversed and electricity token generated: 12345-67890-12345-67890",
    ),
    IncidentModel(
      id: "INC99887766",
      incidentNumber: "INC99887766",
      name: "Tom Brown",
      phone: "+27998877665",
      meterNumber: "44444333332222211111",
      issueType: "App not working properly",
      category: "App not working properly",
      urgency: "Low",
      priority: "Low",
      subject: "App not working properly",
      description: "App keeps crashing when I try to select my residential complex.",
      reportedDate: DateTime.now().subtract(Duration(days: 10)),
      createdAt: DateTime.now().subtract(Duration(days: 10)),
      status: "Pending",
      responseMessage: "We are investigating this issue. Please try updating the app to the latest version.",
    ),
  ];

  // Notifications
  static List<NotificationModel> notifications = [
    NotificationModel.legacy(
      "N001",
      "Low Electricity Balance",
      "Your electricity balance is running low. You have 12.3 kWh remaining.",
      "low_balance",
      DateTime.now().subtract(Duration(hours: 2)),
      false,
      "Greenstone Estate",
      "A101",
      12.3,
      "Buy Now",
    ),
    NotificationModel.legacy(
      "N002",
      "Payment Successful",
      "Your electricity purchase of R100 has been processed successfully.",
      "purchase",
      DateTime.now().subtract(Duration(hours: 6)),
      true,
      "Greenstone Estate",
      "A101",
      null,
      "View Details",
    ),
    NotificationModel.legacy(
      "N003",
      "Critical: Very Low Balance",
      "Your electricity balance is critically low at 3.1 kWh. Purchase electricity urgently.",
      "low_balance",
      DateTime.now().subtract(Duration(minutes: 30)),
      false,
      "City Property",
      "CP001",
      3.1,
      "Buy Now",
    ),
    NotificationModel.legacy(
      "N004",
      "Monthly Electricity Report",
      "Your electricity usage report for this month is ready to view.",
      "system",
      DateTime.now().subtract(Duration(days: 1)),
      false,
      null,
      null,
      null,
      "View Report",
    ),
    NotificationModel.legacy(
      "N005",
      "Special Offer: 10% Bonus",
      "Get 10% extra electricity when you purchase R200 or more. Limited time offer!",
      "promotion",
      DateTime.now().subtract(Duration(days: 2)),
      false,
      null,
      null,
      null,
      "Get Offer",
    ),
    NotificationModel.legacy(
      "N006",
      "Balance Alert",
      "Your electricity balance is below 20 kWh. Consider purchasing more electricity.",
      "low_balance",
      DateTime.now().subtract(Duration(days: 3)),
      true,
      "Waterfall Estate",
      "W101",
      18.7,
      "Buy Now",
    ),
  ];

  static List<NotificationModel> get notificationList => notifications;
}
