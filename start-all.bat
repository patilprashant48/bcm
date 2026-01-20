@echo off
echo ========================================
echo BCM Platform - Quick Start Script
echo ========================================
echo.

echo [1/4] Starting MongoDB...
echo Make sure MongoDB is running!
echo.

echo [2/4] Starting Backend Server...
cd "%~dp0backend"
start "BCM Backend" cmd /k "npm run dev"
timeout /t 5 /nobreak >nul
echo Backend started on http://localhost:5000
echo.

echo [3/4] Starting Admin Web App...
cd "%~dp0admin-web"
start "BCM Admin Web" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul
echo Admin Web started on http://localhost:3000
echo.

echo [4/4] Starting Business Web App...
cd "%~dp0business-web"
start "BCM Business Web" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul
echo Business Web started on http://localhost:3001
echo.

echo ========================================
echo All services started successfully!
echo ========================================
echo.
echo Backend API:     http://localhost:5000
echo Admin Panel:     http://localhost:3000
echo Business Portal: http://localhost:3001
echo.
echo Default Login Credentials:
echo - Admin:    admin@bcm.com / admin123
echo - Business: business@test.com / business123
echo - Investor: investor@test.com / investor123
echo.
echo Press any key to open Admin Panel in browser...
pause >nul
start http://localhost:3000
echo.
echo Press any key to exit...
pause >nul
