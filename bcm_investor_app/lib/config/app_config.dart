/// App Configuration for different environments
class AppConfig {
  // Environment modes
  static const String development = 'development';
  static const String production = 'production';
  
  // Current environment (change this to switch between environments)
  static const String currentEnvironment = production; // Change to 'development' for local testing
  
  // Backend URLs
  static const String productionUrl = 'https://bcm-6f7f.onrender.com/api';
  static const String developmentUrl = 'http://10.0.2.2:5000/api'; // For Android emulator
  // Use 'http://localhost:5000/api' for web
  // Use 'http://YOUR_LOCAL_IP:5000/api' for physical device
  
  // Get the current base URL
  static String get baseUrl {
    switch (currentEnvironment) {
      case development:
        return developmentUrl;
      case production:
        return productionUrl;
      default:
        return productionUrl;
    }
  }
  
  // Get environment name
  static String get environmentName {
    return currentEnvironment;
  }
  
  // Check if in development mode
  static bool get isDevelopment {
    return currentEnvironment == development;
  }
  
  // Check if in production mode
  static bool get isProduction {
    return currentEnvironment == production;
  }
  
  // API endpoints
  static String get healthEndpoint => '${baseUrl.replaceAll('/api', '')}/health';
  
  // App version
  static const String appVersion = '1.0.0';
  static const String appName = 'BCM Investor';
}
