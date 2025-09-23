import 'package:flutter_dotenv/flutter_dotenv.dart';

class Environment {
  static String get apiBaseUrl =>
      dotenv.env['API_BASE_URL'] ?? 'http://192.168.1.104:3000';
  static String get appName => dotenv.env['APP_NAME'] ?? 'Khanyi Vending App';
  static String get appVersion => dotenv.env['APP_VERSION'] ?? '1.0.0';

  // Features
  static bool get enableAnalytics =>
      dotenv.env['ENABLE_ANALYTICS']?.toLowerCase() == 'true';
  static bool get enableNotifications =>
      dotenv.env['ENABLE_NOTIFICATIONS']?.toLowerCase() == 'true';
  static bool get enableReports =>
      dotenv.env['ENABLE_REPORTS']?.toLowerCase() == 'true';

  // System Limits
  static int get maxFileSize =>
      int.tryParse(dotenv.env['MAX_FILE_SIZE'] ?? '10485760') ?? 10485760;
  static int get maxBulkOperations =>
      int.tryParse(dotenv.env['MAX_BULK_OPERATIONS'] ?? '1000') ?? 1000;
  static int get rateLimitPerMinute =>
      int.tryParse(dotenv.env['RATE_LIMIT_PER_MINUTE'] ?? '100') ?? 100;
}
