# Fix "This site can't be reached" Error

## Problem
Your phone cannot connect to your computer's backend server due to Windows Firewall blocking the connection.

## Solutions (Try in Order)

### Solution 1: Add Firewall Rule (Best)

**Run this command in Command Prompt (as Administrator):**

```bash
netsh advfirewall firewall add rule name="BCM Backend Port 5000" dir=in action=allow protocol=TCP localport=5000
```

**How to run as Administrator:**
1. Press Windows key
2. Type "cmd"
3. Right-click "Command Prompt"
4. Select "Run as administrator"
5. Paste the command above and press Enter

**Expected output:**
```
Ok.
```

**Then test again:**
- Open phone browser
- Go to: `http://192.168.0.105:5000`
- Should now work!

---

### Solution 2: Temporarily Disable Windows Firewall

**Steps:**
1. Press Windows key
2. Type "Windows Security"
3. Open Windows Security
4. Click "Firewall & network protection"
5. Click on "Private network"
6. Turn OFF "Microsoft Defender Firewall"
7. Try accessing from phone again

**⚠️ Remember to turn it back ON after testing!**

---

### Solution 3: Check Network Profile

Your network might be set as "Public" instead of "Private".

**Steps:**
1. Press Windows key + I (Settings)
2. Go to "Network & Internet"
3. Click "Wi-Fi"
4. Click on your connected network
5. Under "Network profile type", select **"Private"**
6. Try Solution 1 again

---

### Solution 4: Verify Same Wi-Fi Network

**On Computer:**
1. Click Wi-Fi icon in taskbar
2. Note the network name

**On Phone:**
1. Go to Settings → Wi-Fi
2. Verify connected to SAME network name

**If different networks:**
- Connect both to the same Wi-Fi
- Try again

---

### Solution 5: Check Router Settings

Some routers have "AP Isolation" or "Client Isolation" enabled.

**Steps:**
1. Open router admin page (usually `http://192.168.0.1`)
2. Login with router credentials
3. Look for settings like:
   - "AP Isolation"
   - "Client Isolation"  
   - "Wireless Isolation"
4. **Disable** these if found
5. Save and restart router

---

## Quick Test After Each Solution

**From your phone's browser, go to:**
```
http://192.168.0.105:5000
```

**Success looks like:**
- You see SOME response (even an error message is good!)
- NOT "This site can't be reached"

---

## Alternative: Use ngrok (Bypass Network Issues)

If firewall solutions don't work, use ngrok to create a public URL:

### Step 1: Download ngrok
https://ngrok.com/download

### Step 2: Start ngrok
```bash
ngrok http 5000
```

### Step 3: Copy the HTTPS URL
You'll see something like:
```
Forwarding   https://abc123.ngrok-free.app -> http://localhost:5000
```

### Step 4: Update Mobile App
Edit `d:\Freelancing projects\BCM\bcm_investor_app\lib\services\api_service.dart`:
```dart
static const String baseUrl = 'https://abc123.ngrok-free.app/api';
```

### Step 5: Rebuild APK
```bash
cd "d:\Freelancing projects\BCM\bcm_investor_app"
flutter build apk --release
```

### Step 6: Install and Test
The app will now work from ANYWHERE with internet!

---

## Recommended Solution

**For Testing:** Use Solution 1 (Firewall Rule) - Quick and safe

**For Production:** Use ngrok or deploy backend to cloud (Render, Railway, etc.)

---

## After Fixing

Once you can access `http://192.168.0.105:5000` from your phone's browser:

1. Install the APK (the one currently building with better error logging)
2. Try logging in
3. If it still fails, check the Flutter logs for the actual error message

The backend is working perfectly - we just need to fix the network connectivity!
