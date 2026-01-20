# BCM Investor Mobile App

## Overview
Flutter mobile application for BCM platform where investors can browse projects, invest, and manage their portfolio.

## Features Implemented
✅ Authentication (Login)
✅ Home screen with wallet cards
✅ Live projects listing
✅ Portfolio with P&L tracking
✅ Wallet with transactions
✅ Account/Profile screen
✅ Bottom navigation
✅ Dark theme (Stock market style)
✅ State management with Provider
✅ API integration

## Setup

### Prerequisites
- Flutter SDK (3.0.0 or higher)
- Android Studio / VS Code
- Android device or emulator

### Install Dependencies
```bash
cd mobile_app
flutter pub get
```

### Run the App
```bash
# On Android emulator/device
flutter run

# Build APK
flutter build apk
```

## Project Structure
```
lib/
├── config/
│   └── theme.dart ✅ (Dark theme configuration)
├── providers/
│   └── auth_provider.dart ✅ (Authentication state)
├── services/
│   └── api_service.dart ✅ (API calls)
├── screens/
│   ├── auth/
│   │   └── login_screen.dart ✅
│   ├── home/
│   │   └── home_screen.dart ✅
│   ├── portfolio/
│   │   └── portfolio_screen.dart ✅
│   ├── wallet/
│   │   └── wallet_screen.dart ✅
│   ├── account/
│   │   └── account_screen.dart ✅
│   └── main_screen.dart ✅ (Bottom nav)
├── widgets/
│   ├── wallet_card.dart ✅
│   └── project_card.dart ✅
└── main.dart ✅
```

## Screens

### 1. Login Screen ✅
- Mobile number and password authentication
- Form validation
- Loading states
- Error handling

### 2. Home Screen ✅
- Main wallet card (gradient)
- Income wallet card (gradient)
- Investment categories (Shares, Loans, FDs, Partnerships)
- Live projects list
- Pull to refresh

### 3. Portfolio Screen ✅
- Total portfolio value
- P&L tracking (amount and percentage)
- Holdings list
- Individual investment performance

### 4. Wallet Screen ✅
- Available balance
- Top-up and withdraw buttons
- Transaction history
- Transaction type indicators (credit/debit)

### 5. Account Screen ✅
- User profile with avatar
- Menu items (Profile, History, Watchlist, Settings, Help, About)
- Logout functionality

## API Endpoints Used
- `POST /auth/login` - User login
- `GET /auth/profile` - Get user profile
- `GET /investor/projects` - Get all projects
- `GET /investor/projects/:id` - Get project details
- `GET /wallet` - Get wallet balance
- `GET /wallet/transactions` - Get transactions
- `POST /investor/buy` - Buy shares
- `GET /investor/investments` - Get user's investments

## Dependencies
```yaml
dependencies:
  flutter:
    sdk: flutter
  provider: ^6.1.1          # State management
  http: ^1.1.0              # HTTP requests
  dio: ^5.4.0               # Advanced HTTP client
  shared_preferences: ^2.2.2 # Local storage
  flutter_svg: ^2.0.9       # SVG support
  cached_network_image: ^3.3.0 # Image caching
  shimmer: ^3.0.0           # Loading animations
  fl_chart: ^0.65.0         # Charts (for future use)
  image_picker: ^1.0.5      # Image selection
  intl: ^0.18.1             # Internationalization
  url_launcher: ^6.2.2      # URL launching
```

## Theme
- **Dark Mode**: Stock market inspired dark theme
- **Primary Color**: Blue (#1E88E5)
- **Secondary Color**: Green (#00E676)
- **Background**: Dark blue (#0A0E27)
- **Cards**: Lighter blue (#252B4A)
- **Gradients**: Used for wallet cards and headers

## Features by Screen

### Home
- Dual wallet display (Main + Income)
- Investment category quick access
- Live projects with progress bars
- Pull-to-refresh

### Portfolio
- Total value with gradient card
- Invested vs Current value
- P&L with color coding (green/red)
- Individual holdings breakdown

### Wallet
- Large balance display
- Quick action buttons
- Chronological transaction list
- Credit/Debit indicators

### Account
- Circular avatar with initial
- User information display
- Menu navigation
- Logout with confirmation

## Status
✅ **Core Features Complete** - 5 screens fully functional!

## Next Steps (Optional Enhancements)
1. Project detail screen with charts
2. Buy/checkout flow
3. KYC verification flow
4. Push notifications
5. Biometric authentication
6. Transaction filters
7. Watchlist functionality
8. Settings page
9. Help & Support chat
10. User-to-user trading

## API Configuration
The app connects to the backend at:
- **Android Emulator**: `http://10.0.2.2:5000/api`
- **Real Device**: Update to your server IP in `api_service.dart`

## Testing
```bash
# Run tests
flutter test

# Run on specific device
flutter run -d <device-id>

# Build release APK
flutter build apk --release
```

## Notes
- Backend must be running and accessible
- For real devices, update API URL in `api_service.dart`
- Requires Android 5.0 (API 21) or higher
- iOS support can be added (not configured yet)

## Screenshots
(Add screenshots here after running the app)

## License
Proprietary - BCM Platform
