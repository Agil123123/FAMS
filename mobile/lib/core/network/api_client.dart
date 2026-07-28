import 'package:dio/dio.dart';
import 'package:fams_mobile/core/config/env.dart';
import 'package:fams_mobile/core/storage/secure_storage.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter/material.dart';

class ApiClient {
  final Dio _dio;
  
  // We need a navigator key or a way to redirect on global auth failure
  static final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();

  ApiClient() : _dio = Dio(BaseOptions(
    baseUrl: Env.apiUrl,
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 10),
    headers: {
      'Content-Type': 'application/json',
    },
  )) {
    _setupInterceptors();
  }

  void _setupInterceptors() {
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await SecureStorage.getAccessToken();
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onError: (DioException error, handler) async {
          if (error.response?.statusCode == 401) {
            // Try refresh token
            final refreshToken = await SecureStorage.getRefreshToken();
            if (refreshToken != null) {
              try {
                final refreshDio = Dio(BaseOptions(baseUrl: Env.apiUrl));
                final response = await refreshDio.post('/auth/refresh', data: {
                  'refresh_token': refreshToken,
                });
                
                final newAccessToken = response.data['data']['access_token'];
                final newRefreshToken = response.data['data']['refresh_token'] ?? refreshToken;
                
                await SecureStorage.saveTokens(newAccessToken, newRefreshToken);
                
                // Retry original request
                final options = error.requestOptions;
                options.headers['Authorization'] = 'Bearer $newAccessToken';
                
                final retryResponse = await _dio.fetch(options);
                return handler.resolve(retryResponse);
              } catch (e) {
                // Refresh failed
                await SecureStorage.deleteTokens();
                _redirectToLogin();
                return handler.reject(error);
              }
            } else {
              // No refresh token available
              await SecureStorage.deleteTokens();
              _redirectToLogin();
              return handler.reject(error);
            }
          }
          return handler.next(error);
        },
      ),
    );
  }

  void _redirectToLogin() {
    final context = navigatorKey.currentContext;
    if (context != null) {
      context.go('/login');
    }
  }

  Dio get dio => _dio;
}
