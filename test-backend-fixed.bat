 @echo off
echo ====================================
echo Testing BCM Backend Deployment
echo ====================================
echo.

echo [1/4] Checking backend health...
curl -s https://bcm-6f7f.onrender.com/health
echo.
echo.

echo [2/4] Waiting for backend to be ready...
timeout /t 3 /nobreak >nul
echo.

echo [3/4] Testing FD creation endpoint with correct payload...
echo Note: This will fail with 401 (unauthorized) but that's OK - 
echo we just want to verify the endpoint exists and accepts the payload format.
echo.

curl -X POST https://bcm-6f7f.onrender.com/api/fds/schemes ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Test FD\",\"interestPercent\":10,\"minAmount\":10000,\"maturityDays\":360,\"interestCalculationDays\":365,\"interestTransferType\":[\"MAIN\"],\"taxDeductionPercent\":0,\"maturityTransferDivision\":{\"mainWallet\":100,\"incomeWallet\":0}}"

echo.
echo.

echo [4/4] Checking if error mentions MATURITY (bad) or shows 401 (good)...
echo Expected: Should see 401 Unauthorized (means endpoint works, just need login)
echo Bad: Should NOT see "MATURITY is not a valid enum value"
echo.

echo ====================================
echo Test Complete
echo ====================================
echo.
echo Next steps:
echo 1. If you see 401 error - GOOD! Backend is working
echo 2. If you see MATURITY error - backend still deploying, wait 2 more minutes
echo 3. Test in browser: https://business-web-orcin.vercel.app
echo.

pause
