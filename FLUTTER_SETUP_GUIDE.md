# Flutter Mobile App - Complete Setup Guide

## Issue
The current `mobile_app` folder only has the `lib` directory and `pubspec.yaml`. 
Flutter needs the complete project structure (android, ios, etc.) to build APK.

## Solution: Create New Flutter Project

### Step 1: Create New Flutter Project
```bash
cd "d:\Freelancing projects\BCM"
flutter create -t app bcm_investor_app
```

This creates a complete Flutter project with all necessary files.

### Step 2: Copy Your Code
```bash
# Copy lib folder (your Dart code)
xcopy mobile_app\lib bcm_investor_app\lib /E /Y /I

# Copy pubspec.yaml (dependencies)
copy mobile_app\pubspec.yaml bcm_investor_app\pubspec.yaml /Y

# Copy README if exists
copy mobile_app\README.md bcm_investor_app\README.md /Y
```

### Step 3: Get Dependencies
```bash
cd bcm_investor_app
flutter pub get
```

### Step 4: Build APK
```bash
# Debug APK (for testing)
flutter build apk --debug

# OR Release APK (for production)
flutter build apk --release
```

### Step 5: Find Your APK
```
d:\Freelancing projects\BCM\bcm_investor_app\build\app\outputs\flutter-apk\app-release.apk
```

---

## Manual Steps (If Commands Don't Work)

### 1. Create Project via Command
```bash
flutter create -t app bcm_investor_app
```

### 2. Manually Copy Files

**Copy these folders/files from `mobile_app` to `bcm_investor_app`:**
- `lib/` → `lib/` (replace entire folder)
- `pubspec.yaml` → `pubspec.yaml` (replace file)
- `README.md` → `README.md` (optional)

### 3. Update pubspec.yaml

Make sure `pubspec.yaml` has:
```yaml
name: bcm_investor_app  # Update this line
description: BCM Investor Mobile App
```

### 4. Get Dependencies
```bash
cd bcm_investor_app
flutter pub get
```

### 5. Build
```bash
flutter build apk --release
```

---

## Project Structure After Setup

```
bcm_investor_app/
├── android/           ✅ (needed for APK)
├── ios/              ✅ (needed for iOS)
├── lib/              ✅ (your Dart code)
│   ├── config/
│   ├── providers/
│   ├── screens/
│   ├── services/
│   ├── widgets/
│   └── main.dart
├── test/             ✅
├── pubspec.yaml      ✅
├── README.md         ✅
└── ...other files
```

---

## Quick Commands Summary

```bash
# 1. Create new Flutter project
cd "d:\Freelancing projects\BCM"
flutter create -t app bcm_investor_app

# 2. Copy your code
xcopy mobile_app\lib bcm_investor_app\lib /E /Y /I
copy mobile_app\pubspec.yaml bcm_investor_app\pubspec.yaml /Y

# 3. Get dependencies
cd bcm_investor_app
flutter pub get

# 4. Build APK
flutter build apk --release

# 5. APK location
# build\app\outputs\flutter-apk\app-release.apk
```

---

## Update App Name and Icon (Optional)

### App Name
**File**: `android/app/src/main/AndroidManifest.xml`
```xml
<application
    android:label="BCM Investor"
    ...>
```

### App Icon
Replace files in:
```
android/app/src/main/res/mipmap-*/ic_launcher.png
```

Or use flutter_launcher_icons package.

---

## Troubleshooting

### Error: "Flutter not found"
```bash
flutter doctor
```

### Error: "Gradle build failed"
```bash
cd android
gradlew clean
cd ..
flutter clean
flutter pub get
flutter build apk
```

### Error: "SDK not found"
Set environment variables:
```
ANDROID_HOME=C:\Users\YourName\AppData\Local\Android\Sdk
JAVA_HOME=C:\Program Files\Java\jdk-XX
```

---

## After Building Successfully

Your APK will be at:
```
d:\Freelancing projects\BCM\bcm_investor_app\build\app\outputs\flutter-apk\app-release.apk
```

**File size**: ~15-20 MB

**Install on phone**:
1. Copy APK to phone
2. Open file
3. Allow installation
4. Done!

---

## Next Steps

1. ✅ Create Flutter project
2. ✅ Copy your code
3. ✅ Build APK
4. 📱 Test on device
5. 🚀 Deploy/Share

---

**The `flutter create` command is running now. Once it completes, follow Step 2 onwards!**
