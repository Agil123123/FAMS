class Env {
  static const String apiUrl = String.fromEnvironment(
    'API_URL',
    defaultValue: 'http://10.0.2.2:3000/api/v1', // Android emulator default to localhost
  );
  
  static const bool isDebug = bool.fromEnvironment(
    'DEBUG',
    defaultValue: true,
  );
}
