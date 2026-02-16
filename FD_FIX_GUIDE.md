# FD Creation Fix - Deployment Guide

## Issue
"Failed to create FD scheme. Please try again."

## Fixes Applied

### 1. Backend Schema Fix ✅
**File**: `backend/database/mongodb-schema.js`
- Added missing `interestPercent` field to FDScheme schema

### 2. Frontend API Fix ✅
**File**: `business-web/src/services/api.js`
- Changed `interestTransferType: 'MATURITY'` → `interestTransferType: ['MAIN']`
- Added proper `maturityTransferDivision` object

### 3. Error Logging Enhancement ✅
**File**: `business-web/src/pages/CapitalTools.jsx`
- Added detailed error logging to show actual error message

## How to Deploy & Test

### Option 1: Test Locally First (Recommended)

```bash
# 1. Stop any running processes

# 2. Rebuild business-web
cd business-web
npm run dev

# 3. Open browser to http://localhost:5174
# 4. Login as business user
# 5. Go to Capital Tools > Fixed Deposits
# 6. Try creating an FD scheme
# 7. Open DevTools (F12) > Console tab
# 8. Look for error details if it fails
```

### Option 2: Deploy to Production

**For Business Web (Vercel):**
```bash
cd business-web
git add .
git commit -m "Fix FD creation API and add error logging"
git push origin main
# Vercel will auto-deploy
```

**For Backend (Render) - Already Deployed:**
- Backend schema changes are already deployed ✅
- The `interestPercent` field is now in the schema

## Check Browser Console

After making changes, when you try to create an FD:

1. Open Browser DevTools (Press F12)
2. Go to **Console** tab
3. Try creating the FD scheme
4. Look for logs like:
   ```
   FD Creation Error: [actual error]
   Error Response: {detailed error message}
   ```

This will show you the EXACT error message from the backend.

## Expected Request Format

The API now sends:
```json
{
  "name": "hr fd",
  "interestPercent": 5,
  "minAmount": 1000,
  "maturityDays": 450,
  "interestCalculationDays": 365,
  "interestTransferType": ["MAIN"],
  "taxDeductionPercent": 0,
  "maturityTransferDivision": {
    "mainWallet": 100,
    "incomeWallet": 0
  }
}
```

## Possible Remaining Issues

If still failing, check:

1. **Authentication**: Make sure you're logged in as a business user
2. **Business Profile**: Business might need to complete onboarding first
3. **Backend Logs**: Check Render.com dashboard for backend errors
4. **CORS**: Verify Vercel domain is in backend CORS whitelist

## Clear Browser Cache

If you deployed but still see old behavior:
1. Press `Ctrl + Shift + Delete`
2. Clear cached images and files
3. Reload page with `Ctrl + F5`

## Next Steps

1. ✅ Backend is deployed with schema fix
2. 🔄 Deploy business-web frontend changes
3. 🧪 Test FD creation
4. 📋 Check browser console for specific error
5. 📧 Share console error if still failing
