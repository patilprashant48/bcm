# Building APK for BCM Mobile App

## Prerequisites
- Flutter SDK installed
- Android SDK installed
- Java JDK installed

## Quick Build APK

### Step 1: Navigate to Mobile App Directory
```bash
cd "d:\Freelancing projects\BCM\mobile_app"
```

### Step 2: Get Dependencies
```bash
flutter pub get
```

### Step 3: Build APK
```bash
# Build debug APK (for testing)
flutter build apk --debug

# OR build release APK (for production)
flutter build apk --release
```

### Step 4: Find Your APK
The APK will be located at:
```
d:\Freelancing projects\BCM\mobile_app\build\app\outputs\flutter-apk\app-release.apk
```

Or for debug:
```
d:\Freelancing projects\BCM\mobile_app\build\app\outputs\flutter-apk\app-debug.apk
```

---

## Build Options

### 1. Debug APK (Faster, Larger File)
```bash
flutter build apk --debug
```
- **Size**: ~40-50 MB
- **Use**: Testing only
- **Features**: Includes debugging tools

### 2. Release APK (Optimized, Smaller)
```bash
flutter build apk --release
```
- **Size**: ~15-20 MB
- **Use**: Production/Distribution
- **Features**: Optimized, minified

### 3. Split APKs by Architecture (Smallest)
```bash
flutter build apk --split-per-abi
```
This creates separate APKs for different CPU architectures:
- `app-armeabi-v7a-release.apk` (32-bit ARM)
- `app-arm64-v8a-release.apk` (64-bit ARM)
- `app-x86_64-release.apk` (64-bit x86)

**Benefit**: Each APK is ~8-10 MB instead of 15-20 MB

---

## Complete Build Process

### Step-by-Step:

```bash
# 1. Navigate to project
cd "d:\Freelancing projects\BCM\mobile_app"

# 2. Clean previous builds
flutter clean

# 3. Get dependencies
flutter pub get

# 4. Build release APK
flutter build apk --release

# 5. APK location will be shown in output
```

**Expected Output:**
```
✓ Built build\app\outputs\flutter-apk\app-release.apk (15.2MB).
```

---

## Update API URL for Production

Before building for production, update the API URL:

**File**: `lib/services/api_service.dart`

```dart
// Change from:
static const String baseUrl = 'http://10.0.2.2:5000/api';

// To your production URL:
static const String baseUrl = 'https://your-domain.com/api';
```

---

## Build for Google Play Store (AAB)

For Play Store submission, build an Android App Bundle:

```bash
flutter build appbundle --release
```

Output location:
```
build\app\outputs\bundle\release\app-release.aab
```

---

## Signing the APK (For Production)

### Step 1: Generate Keystore
```bash
keytool -genkey -v -keystore bcm-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias bcm
```

### Step 2: Create `key.properties`
Create file: `android/key.properties`
```properties
storePassword=your-store-password
keyPassword=your-key-password
keyAlias=bcm
storeFile=../bcm-release-key.jks
```

### Step 3: Update `android/app/build.gradle`
Add before `android {`:
```gradle
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('key.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}
```

Add inside `android { buildTypes {`:
```gradle
release {
    signingConfig signingConfigs.release
}
```

Add after `android { defaultConfig {`:
```gradle
signingConfigs {
    release {
        keyAlias keystoreProperties['keyAlias']
        keyPassword keystoreProperties['keyPassword']
        storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
        storePassword keystoreProperties['storePassword']
    }
}
```

### Step 4: Build Signed APK
```bash
flutter build apk --release
```

---

## Testing the APK

### Install on Physical Device:
```bash
# Connect device via USB
# Enable USB debugging on device
flutter install
```

### Or manually install:
1. Copy APK to device
2. Open file manager
3. Tap APK file
4. Allow installation from unknown sources
5. Install

---

## Troubleshooting

### Error: "Flutter SDK not found"
```bash
flutter doctor
```
Fix any issues shown.

### Error: "Android SDK not found"
Set environment variable:
```bash
ANDROID_HOME=C:\Users\YourName\AppData\Local\Android\Sdk
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

### APK too large
Use split APKs:
```bash
flutter build apk --split-per-abi --release
```

---

## Quick Commands Summary

```bash
# Debug APK (testing)
flutter build apk --debug

# Release APK (production)
flutter build apk --release

# Split APKs (smallest size)
flutter build apk --split-per-abi --release

# App Bundle (Play Store)
flutter build appbundle --release

# Install on connected device
flutter install

# Check Flutter setup
flutter doctor
```

---

## File Sizes (Approximate)

| Build Type | Size |
|------------|------|
| Debug APK | 40-50 MB |
| Release APK | 15-20 MB |
| Split APK (per arch) | 8-10 MB |
| App Bundle (AAB) | 12-15 MB |

---

## Next Steps After Building

1. **Test the APK** on a physical device
2. **Update app icon** (if needed)
3. **Update app name** in `android/app/src/main/AndroidManifest.xml`
4. **Set version** in `pubspec.yaml`
5. **Create screenshots** for Play Store
6. **Write app description**
7. **Submit to Play Store** (if ready)

---

## Important Notes

⚠️ **Before building for production:**
- Update API URL to production server
- Test thoroughly on real devices
- Update app version in `pubspec.yaml`
- Sign the APK with release keystore
- Test the signed APK

✅ **For testing:**
- Debug APK is fine
- Can use emulator localhost (10.0.2.2)
- No signing needed

---

**Ready to build? Run:**
```bash
cd "d:\Freelancing projects\BCM\mobile_app"
flutter build apk --release
```

The APK will be at:
```
build\app\outputs\flutter-apk\app-release.apk
```

🚀 **That's it! You'll have your APK file ready to install!**
