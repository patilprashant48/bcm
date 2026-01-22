@echo off
echo ========================================
echo BCM Mobile App - APK Builder
echo ========================================
echo.

echo Step 1: Checking Flutter installation...
flutter --version
if errorlevel 1 (
    echo ERROR: Flutter not found!
    pause
    exit /b 1
)
echo.

echo Step 2: Checking Android SDK...
if exist "%LOCALAPPDATA%\Android\Sdk" (
    echo Found Android SDK at: %LOCALAPPDATA%\Android\Sdk
    setx ANDROID_HOME "%LOCALAPPDATA%\Android\Sdk"
    set ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk
) else if exist "C:\Android\Sdk" (
    echo Found Android SDK at: C:\Android\Sdk
    setx ANDROID_HOME "C:\Android\Sdk"
    set ANDROID_HOME=C:\Android\Sdk
) else (
    echo ERROR: Android SDK not found!
    echo Please install Android Studio or Android SDK
    pause
    exit /b 1
)
echo.

echo Step 3: Cleaning previous build...
flutter clean
echo.

echo Step 4: Getting dependencies...
flutter pub get
echo.

echo Step 5: Building APK (Release)...
flutter build apk --release
echo.

if errorlevel 1 (
    echo.
    echo ========================================
    echo BUILD FAILED!
    echo ========================================
    pause
    exit /b 1
)

echo.
echo ========================================
echo BUILD SUCCESSFUL!
echo ========================================
echo.
echo APK Location:
echo build\app\outputs\flutter-apk\app-release.apk
echo.
echo Next steps:
echo 1. Transfer APK to your phone
echo 2. Uninstall old version
echo 3. Install new APK
echo 4. Wake up backend: https://bcm-6f7f.onrender.com/health
echo 5. Login with: 9876543210 / investor123
echo.
pause
