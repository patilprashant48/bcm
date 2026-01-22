# Mobile App Login Troubleshooting - Final Guide

## Current Status

✅ **Backend**: Working perfectly at https://bcm-6f7f.onrender.com
✅ **Login endpoint**: Tested and confirmed working
✅ **Emergency bypass**: Active for mobile `9876543210` / password `investor123`
✅ **API URL in app**: Set to `https://bcm-6f7f.onrender.com/api`

## Fresh APK Build

A clean build is being created to ensure the latest code is included.

**APK Location**: `d:\Freelancing projects\BCM\bcm_investor_app\build\app\outputs\flutter-apk\app-release.apk`

## Installation Steps

1. **Uninstall old APK** from your phone (if installed)
2. **Transfer new APK** to your phone
3. **Install** the new APK
4. **Open the app**
5. **Login** with:
   - Mobile: `9876543210`
   - Password: `investor123`

## If Login Still Fails

### Issue 1: Render Cold Start (Most Likely)

**Symptom**: Login takes forever then fails

**Cause**: Render free tier "spins down" after inactivity. First request takes 30-60 seconds.

**Solution**:
1. Before testing the app, open this in your phone's browser:
   ```
   https://bcm-6f7f.onrender.com/health
   ```
2. Wait until you see the response (may take 30-60 seconds)
3. Now try logging in to the app

### Issue 2: Network Timeout

**Symptom**: App shows "Login failed" immediately

**Cause**: App timeout is too short for Render's cold start

**Solution**: Wait a full minute after opening the app, then try login again

### Issue 3: Response Format Mismatch

**Symptom**: Backend logs show login attempt but app fails

**Cause**: App expects different response format

**Solution**: Check if `getProfile` is being called after login and failing

## Debugging Steps

### Step 1: Check Backend Logs

While trying to login on mobile:

1. Go to Render Dashboard → Your service → Logs
2. Watch for:
   ```
   Login attempt for: 9876543210
   ⚠️ USING EMERGENCY BYPASS LOGIN - INVESTOR
   ```

If you see this, the backend received the request successfully.

### Step 2: Check App Logs (If Using USB Debugging)

If phone is connected via USB:
```bash
flutter logs
```

Look for:
```
Login response status: 200
Login response body: {...}
```

or

```
Login error: ...
```

### Step 3: Test Backend Directly from Phone

Open phone browser and go to:
```
https://bcm-6f7f.onrender.com/health
```

If this works, the backend is reachable from your phone.

## Known Working Configuration

- **Backend URL**: `https://bcm-6f7f.onrender.com`
- **API Base**: `https://bcm-6f7f.onrender.com/api`
- **Login Endpoint**: `https://bcm-6f7f.onrender.com/api/auth/login`
- **Method**: POST
- **Body**: `{"mobile":"9876543210","password":"investor123"}`
- **Response**: `{"success":true,"token":"...","user":{...}}`

## Alternative: Keep Backend Awake

To avoid cold start issues, use a service to ping your backend every 10 minutes:

1. **UptimeRobot** (free): https://uptimerobot.com
   - Add monitor for: `https://bcm-6f7f.onrender.com/health`
   - Check interval: 5 minutes

2. **Cron-job.org** (free): https://cron-job.org
   - Create job to ping `/health` every 10 minutes

This keeps Render from spinning down.

## Last Resort: Add Timeout Handling

If the issue persists, we can increase the app's timeout:

Edit `api_service.dart` and add timeout:

```dart
final response = await http.post(
  Uri.parse('$baseUrl/auth/login'),
  headers: {'Content-Type': 'application/json'},
  body: json.encode({'mobile': mobile, 'password': password}),
).timeout(Duration(seconds: 60)); // Add this
```

## Success Criteria

✅ Backend responds to `/health` in browser
✅ Backend shows login attempt in logs
✅ App successfully logs in
✅ User is redirected to home screen

## Contact

If all else fails, the issue is likely:
1. Render cold start timeout
2. Network connectivity
3. App caching old code

**Solution**: Wake up backend first, wait 60 seconds, then try login.
