# Flutter Mobile App Structure

This directory will contain the Flutter mobile app for investors.

## Setup Instructions

### Prerequisites
- Flutter SDK 3.0+
- Android Studio or VS Code
- Android SDK

### Initialize Flutter Project

```bash
flutter create mobile_app
cd mobile_app
```

### Dependencies (pubspec.yaml)

```yaml
dependencies:
  flutter:
    sdk: flutter
  provider: ^6.1.1
  http: ^1.1.0
  shared_preferences: ^2.2.2
  image_picker: ^1.0.4
  cached_network_image: ^3.3.0
```

### Project Structure

```
lib/
├── main.dart
├── models/
│   ├── user.dart
│   ├── project.dart
│   ├── share.dart
│   └── investment.dart
├── providers/
│   ├── auth_provider.dart
│   ├── wallet_provider.dart
│   └── portfolio_provider.dart
├── services/
│   ├── api_service.dart
│   └── storage_service.dart
├── screens/
│   ├── auth/
│   │   ├── login_screen.dart
│   │   └── otp_screen.dart
│   ├── home/
│   │   ├── home_screen.dart
│   │   └── project_details_screen.dart
│   ├── portfolio/
│   │   └── portfolio_screen.dart
│   ├── account/
│   │   └── account_screen.dart
│   └── investment/
│       └── share_purchase_screen.dart
└── widgets/
    ├── project_card.dart
    └── bottom_nav.dart
```

### Key Features

1. **Authentication**
   - Mobile OTP login
   - Google Sign-In
   - Password management

2. **Home Screen**
   - Browse live projects
   - Featured investments
   - Search & filter

3. **Portfolio**
   - Holdings by type
   - Performance tracking
   - Transaction history

4. **Investment**
   - Buy/sell shares
   - Loan investments
   - FD investments
   - Partnership options

5. **Wallet**
   - Business wallet
   - Income wallet
   - Top-up requests
   - Transaction history

### API Integration

```dart
class ApiService {
  static const String baseUrl = 'https://your-backend.onrender.com/api';
  
  Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      body: json.encode({'email': email, 'password': password}),
      headers: {'Content-Type': 'application/json'},
    );
    return json.decode(response.body);
  }
  
  // Add more API methods...
}
```

### State Management (Provider)

```dart
class AuthProvider with ChangeNotifier {
  User? _user;
  String? _token;
  
  bool get isAuthenticated => _token != null;
  
  Future<void> login(String email, String password) async {
    // Call API
    // Update state
    notifyListeners();
  }
}
```

### Build & Run

```bash
# Run on Android emulator
flutter run

# Build APK
flutter build apk --release

# Build for iOS
flutter build ios --release
```

## TODO

- [ ] Initialize Flutter project
- [ ] Set up folder structure
- [ ] Implement authentication screens
- [ ] Create home screen with project list
- [ ] Build portfolio screen
- [ ] Implement share trading
- [ ] Add wallet functionality
- [ ] Create investment flows
- [ ] Add KYC screens
- [ ] Implement cart system
- [ ] Add push notifications
- [ ] Test on real devices

## Design Guidelines

- Use Material Design 3
- Primary color: Blue (#2563eb)
- Follow Flutter best practices
- Implement proper error handling
- Add loading states
- Use cached images for performance

## Notes

This is a placeholder structure. The actual Flutter implementation will be built in the next phase of development.

For now, focus on:
1. Backend API completion
2. Admin web app testing
3. Business web app development
