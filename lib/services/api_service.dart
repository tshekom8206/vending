import 'dart:convert';
import 'dart:developer';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter/foundation.dart';
import 'package:dio/dio.dart';
import 'package:khanyi_vending_app/config/environment.dart';

class ApiService {
  static String get baseUrl => Environment.apiBaseUrl;

  dynamic _dio;
  bool get isWeb => kIsWeb;

  ApiService() {
    if (!isWeb) {
      try {
        // Initialize Dio only for mobile platforms
        _dio = Dio(BaseOptions(
          baseUrl: baseUrl,
          connectTimeout: 10000,
          receiveTimeout: 10000,
          headers: {
            'Content-Type': 'application/json',
          },
        ));

        // Add simple logging interceptor for mobile
        (_dio as Dio).interceptors.add(
              InterceptorsWrapper(
                onRequest: (options, handler) {
                  log('API Request: ${options.method} ${options.uri}');
                  handler.next(options);
                },
                onResponse: (response, handler) {
                  log('API Response: ${response.statusCode}');
                  handler.next(response);
                },
                onError: (error, handler) {
                  log('API Error: ${error.response?.statusCode} ${error.message}');
                  handler.next(error);
                },
              ),
            );
      } catch (e) {
        // If Dio fails to initialize on web, fall back to HTTP
        log('🌐 Dio failed to initialize, using HTTP client: $e');
        _dio = null;
      }
    } else {
      // For web, we'll use HTTP package only
      _dio = null;
      log('🌐 API Service: Using HTTP client for web platform');
    }
  }

  // Token management
  Future<void> saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_token', token);
  }

  Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('auth_token');
  }

  Future<void> removeToken() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
  }

  Future<void> saveUser(Map<String, dynamic> user) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('user_data', jsonEncode(user));
  }

  Future<Map<String, dynamic>?> getUser() async {
    final prefs = await SharedPreferences.getInstance();
    String? userData = prefs.getString('user_data');
    if (userData != null) {
      return jsonDecode(userData);
    }
    return null;
  }

  Future<void> removeUser() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('user_data');
  }

  // Helper method to build headers
  Future<Map<String, String>> _buildHeaders() async {
    Map<String, String> headers = {
      'Content-Type': 'application/json',
    };

    String? token = await getToken();
    if (token != null && token.isNotEmpty) {
      headers['Authorization'] = 'Bearer $token';
    }

    return headers;
  }

  // Specific method for purchases to avoid generic typing issues
  Future<Map<String, dynamic>> fetchPurchasesRaw() async {
    try {
      print('🔥 FETCH PURCHASES RAW: Starting direct HTTP call');
      final headers = await _buildHeaders();
      final uri = Uri.parse('$baseUrl/purchases');

      print('🌐 HTTP GET Request: $uri');
      final response = await http.get(uri, headers: headers);
      print(
          '🔥 FETCH PURCHASES RAW: Response status code: ${response.statusCode}');

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final data = jsonDecode(response.body);
        print(
            '🔥 FETCH PURCHASES RAW: Response data type: ${data.runtimeType}');
        print('🔥 FETCH PURCHASES RAW: Response success: ${data['success']}');
        return data as Map<String, dynamic>;
      } else {
        final errorData = jsonDecode(response.body);
        return {
          'success': false,
          'error': errorData['error'] ?? 'Request failed',
        };
      }
    } catch (e) {
      print('🔥 FETCH PURCHASES RAW: Error occurred: $e');
      return {
        'success': false,
        'error': 'Network error: $e',
      };
    }
  }

  // Generic API methods
  Future<ApiResponse<T>> get<T>(
    String endpoint, {
    Map<String, dynamic>? queryParameters,
  }) async {
    print('🔥🔥🔥 API SERVICE GET METHOD ENTRY - endpoint: $endpoint');
    try {
      print('🔥 About to check isWeb value...');
      print('🔥 isWeb = $isWeb');
      if (isWeb) {
        print('🔥 Taking WEB path for GET');
        print('🔥 About to call _httpGet...');
        final result =
            await _httpGet<T>(endpoint, queryParameters: queryParameters);
        print('🔥 _httpGet returned: ${result.success}');
        return result;
      } else {
        print('🔥 Taking MOBILE path for GET');
        return _dioGet<T>(endpoint, queryParameters: queryParameters);
      }
    } catch (e) {
      print('🔥 EXCEPTION in API service get: $e');
      return ApiResponse<T>.error('Exception in get method: $e');
    }
  }

  // HTTP implementation for web
  Future<ApiResponse<T>> _httpGet<T>(
    String endpoint, {
    Map<String, dynamic>? queryParameters,
  }) async {
    try {
      final headers = await _buildHeaders();
      final uri = Uri.parse('$baseUrl$endpoint').replace(
        queryParameters: queryParameters
            ?.map((key, value) => MapEntry(key, value.toString())),
      );

      log('🌐 HTTP GET Request: $uri');

      final response = await http.get(uri, headers: headers);

      log('API Response: ${response.statusCode}');

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final data = jsonDecode(response.body);
        log('🔥 API SERVICE _httpGet: Response data type: ${data.runtimeType}');
        log('🔥 API SERVICE _httpGet: Response data content: $data');

        // Handle case where backend returns List directly instead of Map
        if (data is List) {
          log('🔥 API SERVICE _httpGet: Converting List to Map format');
          return ApiResponse<T>.success(data as T);
        } else if (data is Map<String, dynamic>) {
          return ApiResponse<T>.fromJson(data);
        } else {
          log('🔥 API SERVICE _httpGet: Unexpected data type: ${data.runtimeType}');
          return ApiResponse<T>.error('Unexpected response format');
        }
      } else {
        final errorData = jsonDecode(response.body);
        return ApiResponse<T>.error(errorData['error'] ?? 'Request failed');
      }
    } catch (e) {
      log('API Error: $e');
      return ApiResponse<T>.error('Network error: $e');
    }
  }

  // Dio implementation for mobile
  Future<ApiResponse<T>> _dioGet<T>(
    String endpoint, {
    Map<String, dynamic>? queryParameters,
  }) async {
    try {
      final headers = await _buildHeaders();
      final dio = _dio as Dio;

      final response = await dio.get(
        endpoint,
        queryParameters: queryParameters,
        options: Options(headers: headers),
      );
      return ApiResponse<T>.fromJson(response.data);
    } on DioError catch (e) {
      return ApiResponse<T>.error(_handleDioError(e));
    } catch (e) {
      return ApiResponse<T>.error('Unexpected error occurred: $e');
    }
  }

  Future<ApiResponse<T>> post<T>(
    String endpoint, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
  }) async {
    print('🔥🔥🔥 API SERVICE POST METHOD ENTRY - endpoint: $endpoint');
    try {
      print('🔥 About to check isWeb value...');
      print('🔥 isWeb = $isWeb');
      log('🔥 API SERVICE POST CALLED - endpoint: $endpoint, isWeb: $isWeb');
      if (isWeb) {
        print('🔥 Taking WEB path');
        print('🔥 About to call _httpPost...');
        log('🔥 CALLING _httpPost for web');
        final result = await _httpPost<T>(endpoint,
            data: data, queryParameters: queryParameters);
        print('🔥 _httpPost returned: ${result.success}');
        return result;
      } else {
        print('🔥 Taking MOBILE path');
        log('🔥 CALLING _dioPost for mobile');
        return _dioPost<T>(endpoint,
            data: data, queryParameters: queryParameters);
      }
    } catch (e) {
      print('🔥 EXCEPTION in API service post: $e');
      return ApiResponse<T>.error('Exception in post method: $e');
    }
  }

  // HTTP implementation for web
  Future<ApiResponse<T>> _httpPost<T>(
    String endpoint, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
  }) async {
    print('🔥🔥🔥 _httpPost METHOD ENTRY - endpoint: $endpoint');
    try {
      print('🔥 _httpPost: Starting HTTP POST request...');
      final headers = await _buildHeaders();
      final uri = Uri.parse('$baseUrl$endpoint').replace(
        queryParameters: queryParameters
            ?.map((key, value) => MapEntry(key, value.toString())),
      );
      final body = data != null ? jsonEncode(data) : null;

      log('🌐 HTTP POST Request: $uri');
      log('🌐 POST Data: $body');

      final response = await http.post(uri, headers: headers, body: body);

      log('API Response: ${response.statusCode}');

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final responseData = jsonDecode(response.body);
        return ApiResponse<T>.fromJson(responseData);
      } else {
        final errorData = jsonDecode(response.body);
        return ApiResponse<T>.error(errorData['error'] ?? 'Request failed');
      }
    } catch (e) {
      log('API Error: $e');
      return ApiResponse<T>.error('Network error: $e');
    }
  }

  // Dio implementation for mobile
  Future<ApiResponse<T>> _dioPost<T>(
    String endpoint, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
  }) async {
    try {
      final headers = await _buildHeaders();
      final dio = _dio as Dio;

      final response = await dio.post(
        endpoint,
        data: data,
        queryParameters: queryParameters,
        options: Options(headers: headers),
      );
      return ApiResponse<T>.fromJson(response.data);
    } on DioError catch (e) {
      return ApiResponse<T>.error(_handleDioError(e));
    } catch (e) {
      return ApiResponse<T>.error('Unexpected error occurred: $e');
    }
  }

  Future<ApiResponse<T>> put<T>(
    String endpoint, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
  }) async {
    if (isWeb) {
      return _httpPut<T>(endpoint,
          data: data, queryParameters: queryParameters);
    } else {
      return _dioPut<T>(endpoint, data: data, queryParameters: queryParameters);
    }
  }

  // HTTP implementation for web
  Future<ApiResponse<T>> _httpPut<T>(
    String endpoint, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
  }) async {
    try {
      final headers = await _buildHeaders();
      final uri = Uri.parse('$baseUrl$endpoint').replace(
        queryParameters: queryParameters
            ?.map((key, value) => MapEntry(key, value.toString())),
      );
      final body = data != null ? jsonEncode(data) : null;

      log('API Request: PUT $uri');

      final response = await http.put(uri, headers: headers, body: body);

      log('API Response: ${response.statusCode}');

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final responseData = jsonDecode(response.body);
        return ApiResponse<T>.fromJson(responseData);
      } else {
        final errorData = jsonDecode(response.body);
        return ApiResponse<T>.error(errorData['error'] ?? 'Request failed');
      }
    } catch (e) {
      log('API Error: $e');
      return ApiResponse<T>.error('Network error: $e');
    }
  }

  // Dio implementation for mobile
  Future<ApiResponse<T>> _dioPut<T>(
    String endpoint, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
  }) async {
    try {
      final headers = await _buildHeaders();
      final dio = _dio as Dio;

      final response = await dio.put(
        endpoint,
        data: data,
        queryParameters: queryParameters,
        options: Options(headers: headers),
      );
      return ApiResponse<T>.fromJson(response.data);
    } on DioError catch (e) {
      return ApiResponse<T>.error(_handleDioError(e));
    } catch (e) {
      return ApiResponse<T>.error('Unexpected error occurred: $e');
    }
  }

  Future<ApiResponse<T>> delete<T>(
    String endpoint, {
    Map<String, dynamic>? queryParameters,
  }) async {
    if (isWeb) {
      return _httpDelete<T>(endpoint, queryParameters: queryParameters);
    } else {
      return _dioDelete<T>(endpoint, queryParameters: queryParameters);
    }
  }

  // HTTP implementation for web
  Future<ApiResponse<T>> _httpDelete<T>(
    String endpoint, {
    Map<String, dynamic>? queryParameters,
  }) async {
    try {
      final headers = await _buildHeaders();
      final uri = Uri.parse('$baseUrl$endpoint').replace(
        queryParameters: queryParameters
            ?.map((key, value) => MapEntry(key, value.toString())),
      );

      log('API Request: DELETE $uri');

      final response = await http.delete(uri, headers: headers);

      log('API Response: ${response.statusCode}');

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final responseData = jsonDecode(response.body);
        return ApiResponse<T>.fromJson(responseData);
      } else {
        final errorData = jsonDecode(response.body);
        return ApiResponse<T>.error(errorData['error'] ?? 'Request failed');
      }
    } catch (e) {
      log('API Error: $e');
      return ApiResponse<T>.error('Network error: $e');
    }
  }

  // Dio implementation for mobile
  Future<ApiResponse<T>> _dioDelete<T>(
    String endpoint, {
    Map<String, dynamic>? queryParameters,
  }) async {
    try {
      final dio = _dio as Dio;
      final response = await dio.delete(
        endpoint,
        queryParameters: queryParameters,
      );
      return ApiResponse<T>.fromJson(response.data);
    } on DioError catch (e) {
      return ApiResponse<T>.error(_handleDioError(e));
    } catch (e) {
      return ApiResponse<T>.error('Unexpected error occurred: $e');
    }
  }

  String _handleDioError(DioError e) {
    switch (e.type) {
      case DioErrorType.connectTimeout:
        return 'Connection timeout. Please check your internet connection.';
      case DioErrorType.sendTimeout:
        return 'Send timeout. Please try again.';
      case DioErrorType.receiveTimeout:
        return 'Receive timeout. Please try again.';
      case DioErrorType.response:
        if (e.response?.data != null && e.response?.data is Map) {
          return e.response?.data['error'] ?? 'Server error occurred.';
        }
        return 'Server error: ${e.response?.statusCode}';
      case DioErrorType.cancel:
        return 'Request was cancelled.';
      case DioErrorType.other:
        return 'Connection error. Please check your internet connection.';
      default:
        return 'Network error occurred. Please try again.';
    }
  }
}

class ApiResponse<T> {
  final bool success;
  final String? message;
  final T? data;
  final String? error;
  final Map<String, dynamic>? pagination;

  ApiResponse({
    required this.success,
    this.message,
    this.data,
    this.error,
    this.pagination,
  });

  factory ApiResponse.success(T data, {String? message}) {
    return ApiResponse<T>(
      success: true,
      data: data,
      message: message,
    );
  }

  factory ApiResponse.error(String error) {
    return ApiResponse<T>(
      success: false,
      error: error,
    );
  }

  factory ApiResponse.fromJson(Map<String, dynamic> json) {
    return ApiResponse<T>(
      success: json['success'] ?? false,
      message: json['message'],
      data: json['data'], // Remove the cast here - let it be dynamic
      error: json['error'],
      pagination: json['pagination'],
    );
  }
}
