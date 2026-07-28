import 'package:dio/dio.dart';

class User {
  final String id;
  final String username;
  final String email;
  final String fullName;
  final String? phone;
  final String status;
  final String? avatar;

  User({
    required this.id,
    required this.username,
    required this.email,
    required this.fullName,
    this.phone,
    required this.status,
    this.avatar,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      username: json['username'],
      email: json['email'],
      fullName: json['full_name'],
      phone: json['phone'],
      status: json['status'],
      avatar: json['avatar'],
    );
  }
}

class UserRepository {
  final Dio dio;

  UserRepository({required this.dio});

  Future<User> getProfile() async {
    try {
      // The profile endpoint from api_contract.yaml is GET /auth/profile
      // Alternatively we can use GET /users/me if it exists. 
      // For now, assuming GET /auth/profile returns the current user.
      final response = await dio.get('/auth/profile');
      return User.fromJson(response.data);
    } catch (e) {
      throw Exception('Failed to load profile');
    }
  }

  Future<void> updateProfile(Map<String, dynamic> data) async {
    try {
      await dio.patch('/auth/profile', data: data);
    } catch (e) {
      throw Exception('Failed to update profile');
    }
  }
}
