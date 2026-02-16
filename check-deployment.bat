@echo off
echo ========================================
echo Checking if Customer Activation Fix is Deployed
echo ========================================
echo.

:CHECK_LOOP
echo [%TIME%] Checking Render deployment status...
echo.

REM Check backend health
curl -s https://bcm-6f7f.onrender.com/health | findstr "timestamp"
echo.

echo Press Ctrl+C to stop checking
echo Waiting 30 seconds before next check...
timeout /t 30 /nobreak >nul
echo.
goto CHECK_LOOP
