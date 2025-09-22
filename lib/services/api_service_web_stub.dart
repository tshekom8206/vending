// Web implementation for Dio using HTTP package

import 'dart:convert';
import 'dart:developer';
import 'package:http/http.dart' as http;

class Dio {
  final BaseOptions baseOptions;

  Dio(this.baseOptions);

  InterceptorsWrapper get interceptors => InterceptorsWrapper();

  Future<Response> get(String path, {
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    final uri = Uri.parse('${baseOptions.baseUrl}$path').replace(
      queryParameters: queryParameters?.map((key, value) => MapEntry(key, value.toString())),
    );

    final headers = <String, String>{};
    if (baseOptions.headers != null) {
      baseOptions.headers!.forEach((key, value) {
        headers[key] = value.toString();
      });
    }
    if (options?.headers != null) {
      options!.headers!.forEach((key, value) {
        headers[key] = value.toString();
      });
    }

    log('🌐 WEB HTTP GET: $uri');
    final response = await http.get(uri, headers: headers);
    log('🌐 WEB HTTP Response: ${response.statusCode}');

    return Response()
      ..data = jsonDecode(response.body)
      ..statusCode = response.statusCode;
  }

  Future<Response> post(String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    final uri = Uri.parse('${baseOptions.baseUrl}$path').replace(
      queryParameters: queryParameters?.map((key, value) => MapEntry(key, value.toString())),
    );

    final headers = <String, String>{};
    if (baseOptions.headers != null) {
      baseOptions.headers!.forEach((key, value) {
        headers[key] = value.toString();
      });
    }
    if (options?.headers != null) {
      options!.headers!.forEach((key, value) {
        headers[key] = value.toString();
      });
    }

    final body = data != null ? jsonEncode(data) : null;

    log('🌐 WEB HTTP POST: $uri');
    log('🌐 WEB HTTP Data: $body');
    final response = await http.post(uri, headers: headers, body: body);
    log('🌐 WEB HTTP Response: ${response.statusCode}');

    return Response()
      ..data = jsonDecode(response.body)
      ..statusCode = response.statusCode;
  }

  Future<Response> put(String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    final uri = Uri.parse('${baseOptions.baseUrl}$path').replace(
      queryParameters: queryParameters?.map((key, value) => MapEntry(key, value.toString())),
    );

    final headers = <String, String>{};
    if (baseOptions.headers != null) {
      baseOptions.headers!.forEach((key, value) {
        headers[key] = value.toString();
      });
    }
    if (options?.headers != null) {
      options!.headers!.forEach((key, value) {
        headers[key] = value.toString();
      });
    }

    final body = data != null ? jsonEncode(data) : null;

    log('🌐 WEB HTTP PUT: $uri');
    final response = await http.put(uri, headers: headers, body: body);
    log('🌐 WEB HTTP Response: ${response.statusCode}');

    return Response()
      ..data = jsonDecode(response.body)
      ..statusCode = response.statusCode;
  }

  Future<Response> delete(String path, {
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    final uri = Uri.parse('${baseOptions.baseUrl}$path').replace(
      queryParameters: queryParameters?.map((key, value) => MapEntry(key, value.toString())),
    );

    final headers = <String, String>{};
    if (baseOptions.headers != null) {
      baseOptions.headers!.forEach((key, value) {
        headers[key] = value.toString();
      });
    }
    if (options?.headers != null) {
      options!.headers!.forEach((key, value) {
        headers[key] = value.toString();
      });
    }

    log('🌐 WEB HTTP DELETE: $uri');
    final response = await http.delete(uri, headers: headers);
    log('🌐 WEB HTTP Response: ${response.statusCode}');

    return Response()
      ..data = jsonDecode(response.body)
      ..statusCode = response.statusCode;
  }
}

class BaseOptions {
  final String? baseUrl;
  final int? connectTimeout;
  final int? receiveTimeout;
  final Map<String, dynamic>? headers;

  BaseOptions({
    this.baseUrl,
    this.connectTimeout,
    this.receiveTimeout,
    this.headers,
  });
}

class InterceptorsWrapper {
  InterceptorsWrapper({
    Function? onRequest,
    Function? onResponse,
    Function? onError,
  });

  void add(InterceptorsWrapper wrapper) {
    // No-op for web
  }
}

class DioError implements Exception {
  DioErrorType? type;
  Response? response;
  String? message;
}

enum DioErrorType {
  connectTimeout,
  sendTimeout,
  receiveTimeout,
  response,
  cancel,
  other,
}

class Response {
  dynamic data;
  int? statusCode;
}

class Options {
  final Map<String, dynamic>? headers;

  Options({this.headers});
}