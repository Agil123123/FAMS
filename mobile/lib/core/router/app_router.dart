import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:fams_mobile/features/auth/screens/login_screen.dart';
import 'package:fams_mobile/core/storage/secure_storage.dart';
import 'package:fams_mobile/core/network/api_client.dart';

final GoRouter appRouter = GoRouter(
  navigatorKey: ApiClient.navigatorKey,
  initialLocation: '/dashboard',
  redirect: (context, state) async {
    final token = await SecureStorage.getAccessToken();
    final isLoggingIn = state.uri.path == '/login';

    if (token == null && !isLoggingIn) {
      return '/login';
    }

    if (token != null && isLoggingIn) {
      return '/dashboard';
    }

    return null;
  },
  routes: [
    GoRoute(
      path: '/login',
      builder: (context, state) => const LoginScreen(),
    ),
    GoRoute(
      path: '/dashboard',
      builder: (context, state) => const Scaffold(
        body: Center(child: Text('Dashboard Placeholder')),
      ),
    ),
  ],
);
