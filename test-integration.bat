@echo off
REM Test BCM Platform Integration
echo.
echo ===================================================
echo   Testing BCM Platform Integration
echo ===================================================
echo.

REM Check if node is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo Running integration tests...
echo.

node test-integration.js

echo.
pause
