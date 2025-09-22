import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:khanyi_vending_app/routes/app_pages.dart';
import 'package:khanyi_vending_app/services/auth_service.dart';
import 'package:khanyi_vending_app/services/estate_service.dart';
import 'package:khanyi_vending_app/services/purchase_service.dart';
import 'package:khanyi_vending_app/services/notification_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize services
  Get.put(AuthService());
  Get.put(EstateService());
  Get.put(PurchaseService());
  Get.put(NotificationService());

  runApp(const MyApp());
}

class MyApp extends StatefulWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  @override
  Widget build(BuildContext context) {
    return GetMaterialApp(
      debugShowCheckedModeBanner: false,
      initialRoute: "/",
      routes: AppPages.routes,
    );
  }
}
