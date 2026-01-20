# 📱 Mobile App Login - Quick Reference

## ✅ What I've Done

1. **Added Investor Emergency Bypass** - The backend now accepts investor login even if database is down
2. **Updated Auth Middleware** - Allows investor test user to bypass database checks
3. **Created Investor User Script** - `backend/create-investor.js` to create/update investor in database
4. **Restarted Backend** - Server is running with updated code

## 🔑 Login Credentials

### For Mobile App (Investor Role)
```
Mobile: 9876543210
Password: investor123
```

### For Web Apps (Business Role)
```
Email: business@test.com
Password: business123
```

## 📋 Current Status

✅ **Backend**: Running on port 5000 with emergency bypass for both users
✅ **API URL**: Configured for `http://192.168.0.105:5000/api`
✅ **Emergency Bypass**: Works for investor login
⏳ **APK Build**: Should be complete or nearly complete

## 🚀 Next Steps

### 1. Verify APK Build Completed
Check if you see this message in your terminal:
```
✓ Built build\app\outputs\flutter-apk\app-release.apk
```

### 2. Install APK on Phone
- **Location**: `d:\Freelancing projects\BCM\bcm_investor_app\build\app\outputs\flutter-apk\app-release.apk`
- Transfer to phone and install

### 3. Test Login
1. Open BCM Investor app
2. Enter mobile: `9876543210`
3. Enter password: `investor123`
4. Tap Login

## ⚠️ Important Notes

- **Same Wi-Fi**: Phone and computer must be on same network
- **Firewall**: May need to allow port 5000 in Windows Firewall
- **IP Address**: If your computer's IP changes, you'll need to update `api_service.dart` and rebuild

## 🔧 Troubleshooting

### If login fails:
1. Check backend is running: `netstat -ano | findstr :5000`
2. Verify IP address hasn't changed: `ipconfig`
3. Check backend logs for error messages
4. Try the emergency bypass (should work even if DB is down)

### If you need to rebuild:
```bash
cd "d:\Freelancing projects\BCM\bcm_investor_app"
flutter build apk --release
```

## 📚 Full Documentation
See `MOBILE_TESTING_GUIDE.md` for complete testing instructions and troubleshooting.
