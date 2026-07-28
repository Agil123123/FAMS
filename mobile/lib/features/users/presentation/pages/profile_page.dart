import 'package:flutter/material.dart';
import '../../data/repositories/user_repository.dart';
import 'package:dio/dio.dart';

class ProfilePage extends StatefulWidget {
  final Dio dio;

  const ProfilePage({Key? key, required this.dio}) : super(key: key);

  @override
  _ProfilePageState createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  late UserRepository _userRepository;
  User? _user;
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _userRepository = UserRepository(dio: widget.dio);
    _loadProfile();
  }

  Future<void> _loadProfile() async {
    try {
      final user = await _userRepository.getProfile();
      setState(() {
        _user = user;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = 'Failed to load profile. Please try again.';
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Profile'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(_error!, style: const TextStyle(color: Colors.red)),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: () {
                          setState(() {
                            _isLoading = true;
                            _error = null;
                          });
                          _loadProfile();
                        },
                        child: const Text('Retry'),
                      )
                    ],
                  ),
                )
              : _user == null
                  ? const Center(child: Text('User not found'))
                  : Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Center(
                            child: CircleAvatar(
                              radius: 50,
                              backgroundImage: _user!.avatar != null
                                  ? NetworkImage(_user!.avatar!)
                                  : null,
                              child: _user!.avatar == null
                                  ? const Icon(Icons.person, size: 50)
                                  : null,
                            ),
                          ),
                          const SizedBox(height: 24),
                          _buildInfoRow('Username', _user!.username),
                          const SizedBox(height: 12),
                          _buildInfoRow('Full Name', _user!.fullName),
                          const SizedBox(height: 12),
                          _buildInfoRow('Email', _user!.email),
                          const SizedBox(height: 12),
                          _buildInfoRow('Phone', _user!.phone ?? 'N/A'),
                          const SizedBox(height: 12),
                          _buildInfoRow('Status', _user!.status),
                          const SizedBox(height: 32),
                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton(
                              onPressed: () {
                                // TODO: Implement edit profile logic
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(content: Text('Edit Profile coming soon!')),
                                );
                              },
                              child: const Text('Edit Profile'),
                            ),
                          ),
                        ],
                      ),
                    ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.bold,
            color: Colors.grey,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: const TextStyle(
            fontSize: 16,
          ),
        ),
      ],
    );
  }
}
