# Final Verification Checklist

## ✅ Database Check - PASSED
- Investor user exists
- Password is valid
- User is ACTIVE

## Next: Network & Connectivity Checks

### 1. Verify Your Computer's IP Address
```bash
ipconfig
```

Look for **IPv4 Address** under your active Wi-Fi adapter.
Example: `192.168.0.105`

### 2. Check Mobile App Configuration

Open: `d:\Freelancing projects\BCM\bcm_investor_app\lib\services\api_service.dart`

Line 6 should be:
```dart
static const String baseUrl = 'http://YOUR_IP_HERE:5000/api';
```

**IMPORTANT**: Replace `YOUR_IP_HERE` with the IP from step 1.

### 3. Test Backend Login
```bash
node test-login-simple.js
```

Expected output:
```
Status Code: 200
✅ Login successful!
```

### 4. Test from Phone's Browser

On your phone, open the browser and go to:
```
http://YOUR_IP_HERE:5000/api/auth/login
```

**Expected**: You should see an error message (because GET is not allowed), but this proves your phone can reach the backend.

**If you see "Can't reach this page"**: Network issue - phone can't connect to computer.

### 5. Check Firewall

If phone can't reach backend, temporarily disable Windows Firewall:
1. Open Windows Security
2. Firewall & network protection
3. Turn off for Private networks (temporarily)
4. Try again

### 6. Verify Same Wi-Fi Network

**CRITICAL**: Both devices MUST be on the SAME Wi-Fi network.

- Computer Wi-Fi: Check in Windows network settings
- Phone Wi-Fi: Check in phone settings

They must show the SAME network name.

### 7. Rebuild APK (if IP changed)

If you updated the IP in `api_service.dart`:

```bash
cd "d:\Freelancing projects\BCM\bcm_investor_app"
flutter build apk --release
```

Then install the new APK on your phone.

## Quick Test Summary

Run these in order:

```bash
# 1. Check IP
ipconfig

# 2. Test login locally
cd "d:\Freelancing projects\BCM\backend"
node test-login-simple.js

# 3. Verify IP in app matches your computer's IP
# Open: bcm_investor_app\lib\services\api_service.dart
# Check line 6

# 4. If IP is different, update it and rebuild
cd "d:\Freelancing projects\BCM\bcm_investor_app"
flutter build apk --release
```

## Most Common Issue: IP Mismatch

Your computer's IP might have changed since you last built the APK.

**Solution**:
1. Run `ipconfig` to get current IP
2. Update `api_service.dart` line 6 with that IP
3. Rebuild APK
4. Install new APK on phone
5. Try login again

## If Still Failing

Share with me:
1. Your computer's IP (from `ipconfig`)
2. The IP in `api_service.dart` line 6
3. Are phone and computer on same Wi-Fi?
4. Can you access `http://YOUR_IP:5000` from phone's browser?
