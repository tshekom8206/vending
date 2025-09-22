import 'package:get/get.dart';
import '../model/api_models.dart';
import 'api_service.dart';
import 'auth_service.dart';

class PurchaseService extends GetxService {
  final ApiService _apiService = ApiService();
  final AuthService _authService = Get.find<AuthService>();

  final RxList<Purchase> purchases = <Purchase>[].obs;
  final RxBool isLoading = false.obs;

  Future<void> fetchPurchases() async {
    try {
      print('🔥 FETCH PURCHASES: Starting to fetch purchase history...');
      isLoading.value = true;

      // Use direct HTTP call to bypass the generic API typing issues
      print('🔥 FETCH PURCHASES: Making direct HTTP call to bypass typing issues');
      final rawResponse = await _apiService.fetchPurchasesRaw();

      if (rawResponse['success'] == true && rawResponse['data'] != null) {
        final List<dynamic> purchaseData = rawResponse['data'] as List<dynamic>;
        print('🔥 FETCH PURCHASES: Processing ${purchaseData.length} purchases');
        print('🔥 FETCH PURCHASES: First purchase raw data: ${purchaseData.isNotEmpty ? purchaseData[0] : 'No data'}');

        List<Purchase> parsedPurchases = [];
        for (int i = 0; i < purchaseData.length; i++) {
          try {
            print('🔥 FETCH PURCHASES: Parsing purchase $i...');
            Purchase purchase = Purchase.fromJson(purchaseData[i]);
            parsedPurchases.add(purchase);
            print('🔥 FETCH PURCHASES: Successfully parsed purchase $i');
          } catch (e) {
            print('🔥 FETCH PURCHASES: Error parsing purchase $i: $e');
            print('🔥 FETCH PURCHASES: Purchase $i data: ${purchaseData[i]}');
            break;
          }
        }

        purchases.value = parsedPurchases;
        print('🔥 FETCH PURCHASES: Successfully loaded ${purchases.length} purchases');
        if (purchases.isNotEmpty) {
          print('🔥 FETCH PURCHASES: First purchase parsed - Amount: ${purchases[0].amount.final_}, Units: ${purchases[0].electricity.units}, Token: ${purchases[0].electricity.token}');
        }
      } else {
        print('🔥 FETCH PURCHASES: Failed - error: ${rawResponse['error']}');
        Get.snackbar('Error', rawResponse['error'] ?? 'Failed to load purchase history');
      }
    } catch (e) {
      print('🔥 FETCH PURCHASES: Exception occurred: $e');
      Get.snackbar('Error', 'Failed to load purchase history: $e');
    } finally {
      isLoading.value = false;
      print('🔥 FETCH PURCHASES: Completed - total purchases: ${purchases.length}');
    }
  }

  Future<Purchase?> createPurchase({
    required double amount,
    String? unitId,
    String? meterId,
    String paymentMethod = 'Card',
  }) async {
    try {
      isLoading.value = true;

      // Get user's unit information if unitId not provided
      String? actualUnitId = unitId;
      String deliveryDestination = 'flutter.test@example.com';

      if (actualUnitId == null) {
        print('🔥 Getting user unit from auth service...');
        final userUnit = await _authService.getUserUnit();
        print('🔥 getUserUnit result: $userUnit');
        if (userUnit != null) {
          actualUnitId = userUnit['unit']['id'];
          print('🔥 Found unit ID: $actualUnitId');
          // Use user's email for delivery
          if (_authService.currentUser.value != null) {
            deliveryDestination = _authService.currentUser.value!.email;
          }
        } else {
          print('🔥 getUserUnit returned null!');
        }
      }

      if (actualUnitId == null) {
        print('🔥 NO UNIT FOUND - Showing error snackbar');
        Get.snackbar('Error', 'No unit assigned to your account. Please contact support.');
        return null;
      }

      print('🔥 ABOUT TO CALL API SERVICE POST /purchases');
      final response = await _apiService.post<Map<String, dynamic>>(
        '/purchases',
        data: {
          'unit': actualUnitId,
          'amount': amount,
          'payment': {
            'method': paymentMethod,
            'reference': 'FLUTTER_${DateTime.now().millisecondsSinceEpoch}',
          },
          'delivery': {
            'method': 'App Push',
            'destination': deliveryDestination,
          },
          'metadata': {
            'platform': 'Web'
          }
        },
      );
      print('🔥 API SERVICE CALL RETURNED - success: ${response.success}, error: ${response.error}');

      if (response.success && response.data != null) {
        final purchase = Purchase.fromJson(response.data!);
        purchases.insert(0, purchase); // Add to beginning of list
        Get.snackbar(
          'Purchase Successful',
          'Electricity token: ${purchase.electricity.token ?? 'Will be sent via SMS'}',
          duration: const Duration(seconds: 5),
        );
        return purchase;
      } else {
        Get.snackbar('Purchase Failed', response.error ?? 'Failed to process purchase');
        return null;
      }
    } catch (e) {
      Get.snackbar('Error', 'Purchase failed: $e');
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  Future<Purchase?> getPurchaseById(String purchaseId) async {
    try {
      final response = await _apiService.get<Map<String, dynamic>>('/purchases/$purchaseId');

      if (response.success && response.data != null) {
        return Purchase.fromJson(response.data!);
      } else {
        Get.snackbar('Error', response.error ?? 'Failed to load purchase details');
        return null;
      }
    } catch (e) {
      Get.snackbar('Error', 'Failed to load purchase details: $e');
      return null;
    }
  }

  Future<bool> retryDelivery(String purchaseId) async {
    try {
      final response = await _apiService.post<Map<String, dynamic>>(
        '/purchases/$purchaseId/retry-delivery',
      );

      if (response.success) {
        Get.snackbar('Success', 'Token delivery retried. Please check your SMS.');
        return true;
      } else {
        Get.snackbar('Error', response.error ?? 'Failed to retry delivery');
        return false;
      }
    } catch (e) {
      Get.snackbar('Error', 'Failed to retry delivery: $e');
      return false;
    }
  }

  Future<Map<String, dynamic>?> getPurchaseStatistics() async {
    try {
      final response = await _apiService.get<Map<String, dynamic>>('/purchases/stats/summary');

      if (response.success && response.data != null) {
        return response.data;
      } else {
        print('Failed to load purchase statistics: ${response.error}');
        return null;
      }
    } catch (e) {
      print('Failed to load purchase statistics: $e');
      return null;
    }
  }

  List<Purchase> getRecentPurchases({int limit = 10}) {
    final sortedPurchases = List<Purchase>.from(purchases);
    sortedPurchases.sort((a, b) => b.createdAt.compareTo(a.createdAt));
    return sortedPurchases.take(limit).toList();
  }

  List<Purchase> getPurchasesByStatus(String status) {
    return purchases.where((purchase) => purchase.status == status).toList();
  }

  double getTotalSpent() {
    return purchases.fold(0.0, (sum, purchase) => sum + purchase.amount.final_);
  }

  double getTotalUnits() {
    return purchases.fold(0.0, (sum, purchase) => sum + purchase.electricity.units);
  }
}