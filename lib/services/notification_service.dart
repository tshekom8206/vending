import 'package:get/get.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../model/notification_model.dart';
import 'api_service.dart';

class NotificationService extends GetxService {
  final ApiService _apiService = ApiService();

  final RxList<NotificationModel> notifications = <NotificationModel>[].obs;
  final RxBool isLoading = false.obs;
  final RxInt unreadCount = 0.obs;

  @override
  void onInit() {
    super.onInit();
    // Don't fetch notifications immediately - wait for user to login first
  }

  Future<void> fetchNotifications({
    int page = 1,
    int limit = 20,
    bool? unreadOnly,
    String? type,
    String? category,
    String? priority,
  }) async {
    try {
      isLoading.value = true;
      print('📢 NOTIFICATION SERVICE: Fetching notifications...');

      Map<String, dynamic> queryParams = {
        'page': page.toString(),
        'limit': limit.toString(),
      };

      if (unreadOnly != null) queryParams['unreadOnly'] = unreadOnly.toString();
      if (type != null) queryParams['type'] = type;
      if (category != null) queryParams['category'] = category;
      if (priority != null) queryParams['priority'] = priority;

      // Use direct HTTP call to bypass generic typing issues
      print(
          '📢 NOTIFICATION SERVICE: Making direct HTTP call to bypass typing issues');
      final response = await _fetchNotificationsRaw(queryParams);

      if (response['success'] == true && response['data'] != null) {
        print('📢 NOTIFICATION SERVICE: API response success');
        print(
            '📢 NOTIFICATION SERVICE: Response data type: ${response['data'].runtimeType}');
        print(
            '📢 NOTIFICATION SERVICE: Response data content: ${response['data']}');

        // Handle case where response data might be a List directly
        List<dynamic> notificationData;
        if (response['data'] is List) {
          print(
              '📢 NOTIFICATION SERVICE: Response data is List - using directly');
          notificationData = response['data'] as List<dynamic>;
        } else if (response['data'] is Map<String, dynamic> &&
            response['data']['data'] is List) {
          print(
              '📢 NOTIFICATION SERVICE: Response data is Map with data field - extracting');
          notificationData = response['data']['data'] as List<dynamic>;
        } else {
          print(
              '📢 NOTIFICATION SERVICE: Unexpected response format: ${response['data']}');
          notificationData = [];
        }

        print(
            '📢 NOTIFICATION SERVICE: Processing ${notificationData.length} notifications');
        final List<NotificationModel> parsedNotifications = [];
        for (int i = 0; i < notificationData.length; i++) {
          try {
            final notificationJson = notificationData[i];
            if (notificationJson is Map<String, dynamic>) {
              final parsedNotification =
                  NotificationModel.fromApi(notificationJson);
              parsedNotifications.add(parsedNotification);
              print(
                  '📢 NOTIFICATION SERVICE: Successfully parsed notification $i');
            } else {
              print(
                  '📢 NOTIFICATION SERVICE: Skipping notification $i - not a Map: ${notificationJson.runtimeType}');
            }
          } catch (e) {
            print('📢 NOTIFICATION SERVICE: Error parsing notification $i: $e');
          }
        }

        notifications.value = parsedNotifications;
        print(
            '📢 NOTIFICATION SERVICE: Successfully loaded ${notifications.length} notifications');

        // Update unread count
        await fetchUnreadCount();
      } else {
        print('📢 NOTIFICATION SERVICE: Failed - error: ${response['error']}');
        Get.snackbar(
            'Error', 'Failed to load notifications: ${response['error']}');
      }
    } catch (e) {
      print('📢 NOTIFICATION SERVICE ERROR: $e');
      Get.snackbar('Error', 'Failed to load notifications: $e');
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> fetchUnreadCount() async {
    try {
      final response = await _apiService.get<Map<String, dynamic>>(
        '/notifications/unread-count',
      );

      if (response.success && response.data != null) {
        unreadCount.value = response.data!['data']['count'] ?? 0;
      }
    } catch (e) {
      print('📢 NOTIFICATION SERVICE: Error fetching unread count: $e');
    }
  }

  Future<bool> markAsRead(String notificationId) async {
    try {
      print(
          '📢 NOTIFICATION SERVICE: Marking notification as read: $notificationId');

      final response = await _apiService.put<Map<String, dynamic>>(
        '/notifications/$notificationId/read',
      );

      if (response.success) {
        // Update local notification
        final notificationIndex =
            notifications.indexWhere((n) => n.id == notificationId);
        if (notificationIndex != -1) {
          notifications[notificationIndex] =
              notifications[notificationIndex].copyWith(isRead: true);
          notifications.refresh();
        }

        // Update unread count
        await fetchUnreadCount();

        print(
            '📢 NOTIFICATION SERVICE: Notification marked as read successfully');
        return true;
      } else {
        print(
            '📢 NOTIFICATION SERVICE: Mark as read failed - error: ${response.error}');
        return false;
      }
    } catch (e) {
      print('📢 NOTIFICATION SERVICE MARK READ ERROR: $e');
      return false;
    }
  }

  Future<bool> markAllAsRead() async {
    try {
      print('📢 NOTIFICATION SERVICE: Marking all notifications as read');

      final response = await _apiService.put<Map<String, dynamic>>(
        '/notifications/read-all',
      );

      if (response.success) {
        // Update all local notifications
        notifications.value =
            notifications.map((n) => n.copyWith(isRead: true)).toList();
        unreadCount.value = 0;

        print(
            '📢 NOTIFICATION SERVICE: All notifications marked as read successfully');
        return true;
      } else {
        print(
            '📢 NOTIFICATION SERVICE: Mark all as read failed - error: ${response.error}');
        return false;
      }
    } catch (e) {
      print('📢 NOTIFICATION SERVICE MARK ALL READ ERROR: $e');
      return false;
    }
  }

  Future<void> refreshNotifications() async {
    await fetchNotifications();
  }

  // Get notifications by type
  List<NotificationModel> getNotificationsByType(String type) {
    return notifications
        .where((notification) =>
            notification.type.toLowerCase() == type.toLowerCase())
        .toList();
  }

  // Get unread notifications
  List<NotificationModel> getUnreadNotifications() {
    return notifications.where((notification) => !notification.isRead).toList();
  }

  // Direct HTTP call to bypass generic typing issues
  Future<Map<String, dynamic>> _fetchNotificationsRaw(
      Map<String, dynamic> queryParams) async {
    try {
      print('📢 NOTIFICATION SERVICE RAW: Starting direct HTTP call');

      final token = await _apiService.getToken();
      final headers = <String, String>{
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      };

      final uri = Uri.parse('${ApiService.baseUrl}notifications').replace(
        queryParameters:
            queryParams.map((key, value) => MapEntry(key, value.toString())),
      );

      print('📢 NOTIFICATION SERVICE RAW: Making request to $uri');

      final response = await http.get(uri, headers: headers);
      print(
          '📢 NOTIFICATION SERVICE RAW: Response status code: ${response.statusCode}');

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final data = jsonDecode(response.body);
        print(
            '📢 NOTIFICATION SERVICE RAW: Response data type: ${data.runtimeType}');
        print(
            '📢 NOTIFICATION SERVICE RAW: Response success: ${data['success']}');
        return data as Map<String, dynamic>;
      } else {
        final errorData = jsonDecode(response.body);
        return {
          'success': false,
          'error': errorData['error'] ?? 'Request failed',
        };
      }
    } catch (e) {
      print('📢 NOTIFICATION SERVICE RAW: Error occurred: $e');
      return {
        'success': false,
        'error': 'Network error: $e',
      };
    }
  }
}
