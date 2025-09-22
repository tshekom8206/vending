import 'package:get/get.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../model/api_models.dart';
import 'api_service.dart';

class AuthService extends GetxService {
  final ApiService _apiService = ApiService();

  final Rx<User?> currentUser = Rx<User?>(null);
  final RxBool isAuthenticated = false.obs;
  final RxBool isLoading = false.obs;

  @override
  void onInit() {
    super.onInit();
    _loadUserData();
  }

  Future<void> _loadUserData() async {
    try {
      String? token = await _apiService.getToken();
      Map<String, dynamic>? userData = await _apiService.getUser();

      if (token != null && userData != null) {
        currentUser.value = User.fromJson(userData);
        isAuthenticated.value = true;
      }
    } catch (e) {
      print('Error loading user data: $e');
    }
  }

  Future<bool> register({
    required String firstName,
    required String lastName,
    required String email,
    required String phone,
    required String idNumber,
    required String password,
    String role = 'tenant',
  }) async {
    try {
      isLoading.value = true;

      final response = await _apiService.post<Map<String, dynamic>>(
        '/auth/register',
        data: {
          'firstName': firstName,
          'lastName': lastName,
          'email': email,
          'phone': phone,
          'idNumber': idNumber,
          'password': password,
          'role': role,
        },
      );

      if (response.success && response.data != null) {
        final authData = AuthResponse.fromJson(response.data!);
        await _saveAuthData(authData);
        return true;
      } else {
        Get.snackbar('Registration Failed', response.error ?? 'Unknown error occurred');
        return false;
      }
    } catch (e) {
      Get.snackbar('Error', 'Registration failed: $e');
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  Future<bool> login({
    required String email,
    required String password,
  }) async {
    try {
      isLoading.value = true;

      final response = await _apiService.post<Map<String, dynamic>>(
        '/auth/login',
        data: {
          'email': email,
          'password': password,
        },
      );

      if (response.success && response.data != null) {
        final authData = AuthResponse.fromJson(response.data!);
        await _saveAuthData(authData);
        Get.snackbar('Success', 'Login successful');
        return true;
      } else {
        Get.snackbar('Login Failed', response.error ?? 'Invalid credentials');
        return false;
      }
    } catch (e) {
      Get.snackbar('Error', 'Login failed: $e');
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> _saveAuthData(AuthResponse authData) async {
    await _apiService.saveToken(authData.accessToken);
    await _apiService.saveUser(authData.user.toJson());

    currentUser.value = authData.user;
    isAuthenticated.value = true;
  }

  Future<bool> updateProfile({
    required String firstName,
    required String lastName,
    required String phone,
    Address? address,
  }) async {
    try {
      isLoading.value = true;

      final response = await _apiService.put<Map<String, dynamic>>(
        '/auth/profile',
        data: {
          'firstName': firstName,
          'lastName': lastName,
          'phone': phone,
          if (address != null) 'address': address.toJson(),
        },
      );

      if (response.success && response.data != null) {
        print('🔄 AuthService: Update profile response success');
        print('🔄 AuthService: Update response data: ${response.data}');

        // Fix: Handle the correct nested structure from API
        dynamic userData;

        if (response.data!.containsKey('data') && response.data!['data'] is Map<String, dynamic>) {
          // Handle nested structure: response.data['data']['user']
          final dataPayload = response.data!['data'] as Map<String, dynamic>;
          userData = dataPayload['user'];
          print('🔄 AuthService: Update using nested structure - data.user');
        } else if (response.data!.containsKey('user')) {
          // Handle flat structure: response.data['user']
          userData = response.data!['user'];
          print('🔄 AuthService: Update using flat structure - user');
        } else {
          // Handle case where user data is directly in response.data
          userData = response.data!;
          print('🔄 AuthService: Update using direct structure - response.data');
        }

        if (userData != null && userData is Map<String, dynamic>) {
          try {
            // Merge updated data with existing user data to preserve fields not returned by update
            final existingUser = currentUser.value;
            if (existingUser != null) {
              // Create merged user data
              final mergedData = Map<String, dynamic>.from(existingUser.toJson());
              mergedData.addAll(userData);
              currentUser.value = User.fromJson(mergedData);
              await _apiService.saveUser(mergedData);
            } else {
              currentUser.value = User.fromJson(userData);
              await _apiService.saveUser(userData);
            }
            print('✅ AuthService: Profile updated successfully');
          } catch (parseError) {
            print('❌ AuthService: Error parsing updated user data: $parseError');
            print('❌ AuthService: UserData content: $userData');
          }
        }
        Get.snackbar('Success', 'Profile updated successfully');
        return true;
      } else {
        print('❌ AuthService: Profile update failed - ${response.error}');
        Get.snackbar('Update Failed', response.error ?? 'Failed to update profile');
        return false;
      }
    } catch (e) {
      Get.snackbar('Error', 'Profile update failed: $e');
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  Future<bool> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    try {
      isLoading.value = true;

      final response = await _apiService.put<Map<String, dynamic>>(
        '/auth/password',
        data: {
          'currentPassword': currentPassword,
          'newPassword': newPassword,
        },
      );

      if (response.success) {
        Get.snackbar('Success', 'Password changed successfully');
        return true;
      } else {
        Get.snackbar('Change Password Failed', response.error ?? 'Failed to change password');
        return false;
      }
    } catch (e) {
      Get.snackbar('Error', 'Password change failed: $e');
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> logout() async {
    await _apiService.removeToken();
    await _apiService.removeUser();

    currentUser.value = null;
    isAuthenticated.value = false;

    Get.offAllNamed('/login');
  }

  Future<void> refreshProfile() async {
    try {
      print('🔄 AuthService: Refreshing profile...');
      final response = await _apiService.get<Map<String, dynamic>>('/auth/me');

      print('🔄 AuthService: Response success: ${response.success}');
      print('🔄 AuthService: Response data type: ${response.data?.runtimeType}');
      print('🔄 AuthService: Response data keys: ${response.data?.keys}');

      if (response.success && response.data != null) {
        // Fix: Handle the correct nested structure from API
        // API returns: { success, data: { user: {...} } }
        // But ApiResponse.fromJson puts entire 'data' payload into response.data
        dynamic userData;

        if (response.data!.containsKey('data') && response.data!['data'] is Map<String, dynamic>) {
          // Handle nested structure: response.data['data']['user']
          final dataPayload = response.data!['data'] as Map<String, dynamic>;
          userData = dataPayload['user'];
          print('🔄 AuthService: Using nested structure - data.user');
        } else if (response.data!.containsKey('user')) {
          // Handle flat structure: response.data['user']
          userData = response.data!['user'];
          print('🔄 AuthService: Using flat structure - user');
        } else {
          // Handle case where user data is directly in response.data
          userData = response.data!;
          print('🔄 AuthService: Using direct structure - response.data');
        }

        print('🔄 AuthService: UserData type: ${userData?.runtimeType}');
        print('🔄 AuthService: UserData keys: ${userData is Map ? userData.keys : 'Not a Map'}');

        if (userData != null && userData is Map<String, dynamic>) {
          try {
            currentUser.value = User.fromJson(userData);
            await _apiService.saveUser(userData);
            print('✅ AuthService: Profile refreshed successfully');
          } catch (parseError) {
            print('❌ AuthService: Error parsing user data: $parseError');
            print('❌ AuthService: UserData content: $userData');
          }
        } else {
          print('❌ AuthService: No valid user data found in response');
        }
      } else {
        print('❌ AuthService: Profile refresh failed - ${response.error}');
      }
    } catch (e) {
      print('❌ AuthService: Exception refreshing profile: $e');
    }
  }

  Future<Map<String, dynamic>?> getUserUnit() async {
    try {
      final response = await _apiService.get<Map<String, dynamic>>('/auth/my-unit');

      if (response.success && response.data != null) {
        return response.data;
      } else {
        print('Failed to get user unit: ${response.error}');
        return null;
      }
    } catch (e) {
      print('Error getting user unit: $e');
      return null;
    }
  }
}