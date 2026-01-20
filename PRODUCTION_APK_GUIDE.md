# Building Production APK with ngrok

## What is ngrok?
ngrok creates a secure tunnel to your localhost, giving you a public URL that works from anywhere.

## Step 1: Install ngrok

1. Download ngrok: https://ngrok.com/download
2. Extract the zip file
3. (Optional) Sign up for a free account at ngrok.com to get an auth token

## Step 2: Start Your Backend

Make sure your backend is running:
```bash
cd "d:\Freelancing projects\BCM\backend"
node server.js
```

## Step 3: Start ngrok Tunnel

Open a new terminal and run:
```bash
ngrok http 5000
```

You'll see output like:
```
Forwarding   https://abc123.ngrok-free.app -> http://localhost:5000
```

Copy the HTTPS URL (e.g., `https://abc123.ngrok-free.app`)

## Step 4: Update Mobile App API URL

Edit `d:\Freelancing projects\BCM\bcm_investor_app\lib\services\api_service.dart`:

```dart
static const String baseUrl = 'https://abc123.ngrok-free.app/api';
```

Replace `abc123.ngrok-free.app` with your actual ngrok URL.

## Step 5: Rebuild APK

```bash
cd "d:\Freelancing projects\BCM\bcm_investor_app"
flutter build apk --release
```

## Step 6: Test

The APK will now work on ANY device with internet connection!

## ⚠️ Important Notes

- **ngrok URLs are temporary** - they change each time you restart ngrok
- **Free tier limitations**: ngrok free tier has connection limits
- **For permanent solution**: Deploy backend to cloud (Render, Railway, etc.)

## Alternative: Use ngrok Static Domain (Paid)

With ngrok paid plan, you can get a static domain that doesn't change.
