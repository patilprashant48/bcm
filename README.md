# BCM Platform - Business Capital Marketplace

A comprehensive platform connecting businesses seeking capital with investors, featuring web applications for admin and business users, plus a mobile app for investors.

## 🚀 Features

### Admin Web Application
- User management (businesses and investors)
- Business verification and approval
- Project oversight and monitoring
- Plan management
- Transaction monitoring
- Analytics dashboard

### Business Web Application
- Business registration and profile management
- Project creation and management
- Capital raising tools (shares, loans, FDs, partnerships)
- Wallet management
- Investor communication
- Plan subscription

### Mobile App (Investor)
- Browse investment opportunities
- Portfolio management
- Wallet and transactions
- Real-time project updates
- Investment tracking

## 📁 Project Structure

```
BCM/
├── backend/              # Node.js/Express API
├── admin-web/           # React admin dashboard
├── business-web/        # React business portal
├── bcm_investor_app/    # Flutter mobile app
└── mobile_app/          # Original Flutter code
```

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB Atlas
- **Authentication:** JWT
- **Password Hashing:** bcrypt

### Frontend (Web)
- **Framework:** React
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios
- **Routing:** React Router

### Mobile
- **Framework:** Flutter
- **State Management:** Provider
- **HTTP:** http package
- **Storage:** SharedPreferences

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- Flutter SDK (for mobile app)

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB connection string
node server.js
```

### Admin Web Setup

```bash
cd admin-web
npm install
npm run dev
```

### Business Web Setup

```bash
cd business-web
npm install
npm run dev
```

### Mobile App Setup

```bash
cd bcm_investor_app
flutter pub get
flutter run
# Or build APK:
flutter build apk --release
```

## 🔑 Environment Variables

### Backend (.env)
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
NODE_ENV=development
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## 🚀 Running the Application

1. **Start Backend:**
   ```bash
   cd backend
   node server.js
   ```

2. **Start Admin Web:**
   ```bash
   cd admin-web
   npm run dev
   # Runs on http://localhost:5173
   ```

3. **Start Business Web:**
   ```bash
   cd business-web
   npm run dev
   # Runs on http://localhost:3001
   ```

4. **Run Mobile App:**
   ```bash
   cd bcm_investor_app
   flutter run
   ```

## 👤 Test Credentials

### Business User
- **Email:** business@test.com
- **Password:** business123

### Investor User
- **Mobile:** 9876543210
- **Password:** investor123

## 📱 Mobile App Testing

### For Emulator
- API URL is already configured for Android emulator (`http://10.0.2.2:5000/api`)

### For Physical Device
1. Get your computer's IP: `ipconfig`
2. Update `bcm_investor_app/lib/services/api_service.dart` line 6
3. Rebuild APK: `flutter build apk --release`
4. Ensure phone and computer are on same Wi-Fi
5. Add firewall rule: 
   ```bash
   netsh advfirewall firewall add rule name="BCM Backend" dir=in action=allow protocol=TCP localport=5000
   ```

## 🔧 Troubleshooting

See detailed guides:
- `LOGIN_TROUBLESHOOTING_MOBILE.md` - Mobile login issues
- `FIX_NETWORK_ISSUE.md` - Network connectivity
- `MOBILE_TESTING_GUIDE.md` - Complete mobile testing guide
- `PRODUCTION_APK_GUIDE.md` - Production deployment

## 📚 Documentation

- `PROJECT_STATUS.md` - Current project status
- `MOBILE_LOGIN_SETUP.md` - Mobile login configuration
- `ADD_INVESTOR_USER.md` - Adding users to database

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is proprietary and confidential.

## 🆘 Support

For issues and questions, please create an issue in the repository.

---

**Built with ❤️ for connecting businesses with investors**
