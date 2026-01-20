@echo off
echo ========================================
echo BCM Platform - Quick Start
echo ========================================
echo.

echo Step 1: Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Backend npm install failed
    pause
    exit /b 1
)

echo.
echo Step 2: Seeding database...
call npm run seed
if %errorlevel% neq 0 (
    echo ERROR: Database seeding failed
    pause
    exit /b 1
)

echo.
echo Step 3: Installing admin-web dependencies...
cd ..\admin-web
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Admin-web npm install failed
    pause
    exit /b 1
)

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo To start the application:
echo.
echo Terminal 1: cd backend ^&^& npm run dev
echo Terminal 2: cd admin-web ^&^& npm run dev
echo.
echo Then open: http://localhost:5173
echo Login: admin@bcm.com / Admin@123
echo.
pause
