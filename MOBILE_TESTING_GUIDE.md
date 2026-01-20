# 📱 BCM Mobile App - Physical Device Testing Guide

## Current Configuration
- **API URL**: `http://192.168.0.105:5000/api`
- **Your Computer IP**: `192.168.0.105`
- **Backend Port**: `5000`

## Prerequisites
✅ Both devices on the **same Wi-Fi network**
✅ Backend server running on your computer (port 5000)
✅ Windows Firewall allows port 5000 (or temporarily disabled)

## Login Credentials (Mobile App - Investor)
- **Mobile Number**: `9876543210`
- **Password**: `investor123`

**Alternative (Business User - Web)**:
- **Email**: `business@test.com`
- **Password**: `business123`

## Installation Steps

### 1. Build APK (Already Done)
```bash
cd "d:\Freelancing projects\BCM\bcm_investor_app"
flutter build apk --release
```

### 2. Transfer APK to Phone
**APK Location**: `d:\Freelancing projects\BCM\bcm_investor_app\build\app\outputs\flutter-apk\app-release.apk`

**Transfer Methods**:
- USB cable → Copy to phone storage
- Email → Send to yourself and download on phone
- Cloud storage (Google Drive, Dropbox, etc.)
- ADB: `adb install app-release.apk` (if phone connected via USB)

### 3. Install on Phone
1. Enable **"Install from Unknown Sources"** in phone settings
2. Open the APK file from your phone's file manager
3. Tap **Install**
4. Open the app

### 4. Verify Backend is Running
On your computer, check that the backend is running:
```bash
# Check if server is running
netstat -ano | findstr :5000
```

You should see output indicating port 5000 is listening.

### 5. Test the App
1. Open the BCM Investor app on your phone
2. Enter mobile: `9876543210`
3. Enter password: `investor123`
4. Tap **Login**

## Troubleshooting

### ❌ "Connection refused" or "Network error"
**Cause**: Phone can't reach your computer

**Solutions**:
1. Verify both devices are on the same Wi-Fi network
2. Check your computer's IP hasn't changed:
   ```bash
   ipconfig
   ```
   If IP changed, update `api_service.dart` and rebuild APK

3. Temporarily disable Windows Firewall:
   - Open Windows Security
   - Firewall & network protection
   - Turn off for Private networks (temporarily)

4. Or add firewall rule for port 5000:
   ```bash
   netsh advfirewall firewall add rule name="BCM Backend" dir=in action=allow protocol=TCP localport=5000
   ```

### ❌ "Invalid credentials"
**Cause**: Backend not accepting login

**Solution**: Check backend logs for errors

### ❌ App crashes on startup
**Cause**: Code issue or missing dependencies

**Solution**: Check if you're using the correct APK (release build)

## Changing IP Address (If Needed)

If your computer's IP changes, update the app:

1. Edit `d:\Freelancing projects\BCM\bcm_investor_app\lib\services\api_service.dart`
2. Change line 6:
   ```dart
   static const String baseUrl = 'http://YOUR_NEW_IP:5000/api';
   ```
3. Rebuild:
   ```bash
   flutter build apk --release
   ```
4. Reinstall on phone

## For Emulator Testing (Alternative)

If physical device testing is problematic, use Android emulator:

1. Change `api_service.dart` back to:
   ```dart
   static const String baseUrl = 'http://10.0.2.2:5000/api';
   ```
2. Rebuild APK
3. Start emulator and install APK:
   ```bash
   adb install app-release.apk
   ```

---

**Note**: The emergency bypass login works for both roles:
- **Investor**: Mobile `9876543210` / Password `investor123` OR Email `investor@test.com` / Password `investor123`
- **Business**: Email `business@test.com` / Password `business123`
