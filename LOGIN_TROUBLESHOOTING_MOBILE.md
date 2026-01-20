# Mobile App Login Troubleshooting

## Issue: "Login failed, please check your credentials"

## Quick Tests to Run

### Test 1: Verify Backend is Running
```bash
netstat -ano | findstr :5000
```
You should see output showing port 5000 is LISTENING.

### Test 2: Check Investor User in Database
```bash
cd "d:\Freelancing projects\BCM\backend"
node check-investor.js
```

Expected output:
```
✅ Connected to MongoDB
✅ Investor user found in database
   Password Test: ✅ VALID
```

### Test 3: Test Login Endpoint Directly
```bash
cd "d:\Freelancing projects\BCM\backend"
node test-login.js
```

Expected output:
```
✅ Login successful!
Response: {
  "success": true,
  "token": "...",
  "user": { ... }
}
```

### Test 4: Check Backend Logs
Look at the terminal where `node server.js` is running. You should see:
```
Login attempt for: 9876543210
⚠️ USING EMERGENCY BYPASS LOGIN - INVESTOR
```

## Common Issues & Solutions

### Issue 1: Backend Not Running
**Solution**: Start the backend
```bash
cd "d:\Freelancing projects\BCM\backend"
node server.js
```

### Issue 2: Wrong IP Address in Mobile App
**Check**: Is the mobile app using the correct IP?
- Open: `d:\Freelancing projects\BCM\bcm_investor_app\lib\services\api_service.dart`
- Line 6 should be: `static const String baseUrl = 'http://192.168.0.105:5000/api';`
- Verify `192.168.0.105` is your computer's current IP (run `ipconfig`)

**If IP changed**: Update the file and rebuild APK

### Issue 3: Phone Not on Same Wi-Fi
**Solution**: Ensure both phone and computer are on the SAME Wi-Fi network

### Issue 4: Windows Firewall Blocking
**Solution**: Temporarily disable firewall or add exception
```bash
netsh advfirewall firewall add rule name="BCM Backend" dir=in action=allow protocol=TCP localport=5000
```

### Issue 5: Emergency Bypass Not Working
**Check**: Verify the bypass code is in `authController.js`

Run this to verify:
```bash
cd "d:\Freelancing projects\BCM\backend"
findstr /C:"EMERGENCY BYPASS - INVESTOR" controllers\authController.js
```

Should show: `// EMERGENCY LOGIN BYPASS - Investor User`

## Manual Login Test (Using Browser/Postman)

Test the login endpoint manually:

**URL**: `http://192.168.0.105:5000/api/auth/login`  
**Method**: POST  
**Headers**: `Content-Type: application/json`  
**Body**:
```json
{
  "mobile": "9876543210",
  "password": "investor123"
}
```

Expected Response (200 OK):
```json
{
  "success": true,
  "message": "Login successful (Bypass)",
  "token": "eyJhbGc...",
  "user": {
    "id": "507f1f77bcf86cd799439012",
    "email": "investor@test.com",
    "mobile": "9876543210",
    "role": "INVESTOR"
  }
}
```

## If Nothing Works: Add Registration

If login continues to fail, we can add a registration screen to the mobile app.

Let me know which test fails and I'll help you fix it!

## Quick Fix: Restart Everything

Sometimes the simplest solution works:

1. **Stop backend**: Ctrl+C in the terminal running `node server.js`
2. **Restart backend**:
   ```bash
   cd "d:\Freelancing projects\BCM\backend"
   node server.js
   ```
3. **Verify it's running**: You should see "Server running on port 5000"
4. **Try login again** on mobile app

## Emergency: Use Emulator Instead

If physical device testing is problematic:

1. Change API URL back to emulator:
   ```dart
   static const String baseUrl = 'http://10.0.2.2:5000/api';
   ```
2. Rebuild APK
3. Install on Android Emulator
4. Test there first
