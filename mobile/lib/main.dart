import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fams_mobile/core/theme/app_theme.dart';
import 'package:fams_mobile/features/auth/screens/login_screen.dart';
// Note: router will be implemented later, returning direct LoginScreen for skeleton

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(
    const ProviderScope(
      child: FamsApp(),
    ),
  );
}

class FamsApp extends StatelessWidget {
  const FamsApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'FAMS Mobile',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.system,
      home: const LoginScreen(),
    );
  }
}
