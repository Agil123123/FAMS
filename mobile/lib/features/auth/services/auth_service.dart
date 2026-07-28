import 'package:fams_mobile/core/network/api_client.dart';
import 'package:fams_mobile/core/storage/secure_storage.dart';
import 'package:dio/dio.dart';

class AuthService {
  final ApiClient _apiClient;

  AuthService(this._apiClient);

  Future<bool> login(String email, String password) async {
    try {
      final response = await _apiClient.dio.post('/auth/login', data: {
        'email': email,
        'password': password,
      });

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = response.data;
        // Depending on backend structure, tokens are at root or in `data` object
        final access_token = data['access_token'] ?? data['data']?['access_token'];
        final refresh_token = data['refresh_token'] ?? data['data']?['refresh_token'];
        
        if (access_token != null && refresh_token != null) {
          await SecureStorage.saveTokens(access_token, refresh_token);
          return true;
        }
      }
      return false;
    } on DioException catch (_) {
      return false;
    }
  }

  Future<void> logout() async {
    try {
      await _apiClient.dio.post('/auth/logout');
    } catch (_) {
      // Ignore errors on logout
    } finally {
      await SecureStorage.deleteTokens();
    }
  }

  Future<Map<String, dynamic>?> getProfile() async {
    try {
      final response = await _apiClient.dio.get('/auth/profile');
      return response.data['data'] ?? response.data;
    } catch (_) {
      return null;
    }
  }
}
