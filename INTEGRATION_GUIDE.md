# BCM Platform Integration Guide

## Overview

This guide explains how the Admin Panel, Business Panel, and Investor APK are integrated to work with real backend data.

## Architecture

```
┌──────────────────┐
│  Admin Web Panel │ ──┐
│  (Vercel)        │   │
└──────────────────┘   │
                       │     ┌─────────────────────┐
┌──────────────────┐   ├────►│  Backend API        │◄────┐
│ Business Web     │   │     │  (Render.com)       │     │
│  (Vercel)        │ ──┘     │  MongoDB Atlas      │     │
└──────────────────┘         └─────────────────────┘     │
                                                          │
┌──────────────────┐                                      │
│ Investor Mobile  │──────────────────────────────────────┘
│  (Flutter APK)   │
└──────────────────┘
```

## Backend API

**Production URL**: `https://bcm-6f7f.onrender.com`
**API Base**: `https://bcm-6f7f.onrender.com/api`

### Available Endpoints

#### Authentication
- `POST /api/auth/login` - Login for all user types
- `POST /api/auth/register-simple` - User registration
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/update-password` - Update password

#### Admin APIs (`/api/admin`)
- `/admin/dashboard/stats` - Dashboard statistics
- `/admin/businesses` - Business management
- `/admin/customers` - Customer management
- `/admin/kyc` - KYC verification
- `/admin/projects` - Project approvals
- `/admin/plans` - Plan management

#### Business APIs (`/api/business`)
- `/business/onboarding` - Business onboarding
- `/business/dashboard/stats` - Business dashboard
- `/business/projects` - Project management
- `/business/capital` - Capital tools (shares, loans, FDs)

#### Investor APIs (`/api/investor`)
- `/investor/projects/live` - Live investment projects
- `/investor/buy` - Buy project shares
- `/investor/portfolio` - User portfolio
- `/investor/watchlist` - Investment watchlist

#### Wallet APIs (`/api/wallet`)
- `/wallet` - Get wallet balance
- `/wallet/transactions` - Transaction history
- `/wallet/topup` - Top-up wallet
- `/wallet/withdraw` - Withdraw funds
- `/wallet/payment-requests` - Payment request management

## 1. Admin Web Panel

### Environment Configuration

**Local Development** (`.env`):
```env
VITE_API_URL=http://localhost:5000/api
```

**Production** (`.env.production`):
```env
VITE_API_URL=https://bcm-6f7f.onrender.com/api
```

### Features Connected to Real Data

1. **Dashboard**
   - Real-time statistics from MongoDB
   - Active users, businesses, projects
   - Revenue and transaction metrics

2. **Business Management**
   - Approve/reject business registrations
   - KYC verification
   - Business activation status

3. **Project Management**
   - Review project submissions
   - Approve/reject/recheck projects
   - Close completed projects

4. **Wallet Management**
   - View all payment requests
   - Approve/reject withdrawals
   - Monitor platform wallet

5. **User Management**
   - View all customers and investors
   - Suspend/activate accounts
   - Monitor user activity

### Admin Login Credentials

```javascript
Email: admin@bcm.com
Password: admin123
```

### Running Locally

```bash
cd admin-web
npm install
npm run dev
```

### Deployed URL
`https://bcm-theta.vercel.app`

## 2. Business Web Panel

### Environment Configuration

**Local Development** (`.env`):
```env
VITE_API_URL=http://localhost:5000/api
```

**Production** (`.env.production`):
```env
VITE_API_URL=https://bcm-6f7f.onrender.com/api
```

### Features Connected to Real Data

1. **Dashboard**
   - Business statistics
   - Active projects status
   - Wallet balance

2. **Project Management**
   - Create new projects
   - Update project details
   - Monitor project investments

3. **Capital Tools**
   - Create share offerings
   - Setup FD schemes
   - Manage partnerships
   - Issue loans

4. **Wallet**
   - View balance
   - Request top-ups
   - Transaction history
   - Payment request tracking

5. **Business Onboarding**
   - Submit business documents
   - Complete KYC
   - Activation workflow

### Running Locally

```bash
cd business-web
npm install
npm run dev
```

### Deployed URL
`https://business-web-orcin.vercel.app`

## 3. Investor Mobile App (Flutter)

### Environment Configuration

The app now uses a centralized configuration file for environment management.

**File**: `lib/config/app_config.dart`

```dart
class AppConfig {
  // Switch between environments
  static const String currentEnvironment = production; // or development
  
  static const String productionUrl = 'https://bcm-6f7f.onrender.com/api';
  static const String developmentUrl = 'http://10.0.2.2:5000/api'; // For emulator
}
```

### Switching Environments

**For Production** (Default):
```dart
static const String currentEnvironment = production;
```

**For Local Development**:
```dart
static const String currentEnvironment = development;
```

**For Physical Device Testing**:
Update `developmentUrl` with your local IP:
```dart
static const String developmentUrl = 'http://192.168.x.x:5000/api';
```

### Features Connected to Real Data

1. **Authentication**
   - Login with mobile number
   - Register as investor
   - Profile management

2. **Market/Projects**
   - Browse live investment projects
   - View project details
   - Real-time investment data

3. **Portfolio**
   - View owned investments
   - Track returns and performance
   - Investment history

4. **Wallet**
   - Real wallet balance
   - Top-up wallet
   - Withdraw funds
   - Transaction history

5. **Orders**
   - Buy project shares
   - Investment tracking
   - Order history

6. **Account**
   - Profile details
   - Bank account setup
   - Settings management

### Building the App

**Development APK**:
```bash
cd bcm_investor_app
flutter build apk --debug
```

**Production APK**:
```bash
# 1. Set environment to production in app_config.dart
# 2. Build release APK
flutter build apk --release
```

**Install on Device**:
```bash
flutter install
```

## Real Data Flow Examples

### Example 1: Business Creates a Project

1. **Business Panel**: Business user logs in
2. **Business Panel**: Creates a new project with details
3. **Backend**: Stores project in MongoDB with status "NEW"
4. **Admin Panel**: Admin sees new project in pending list
5. **Admin Panel**: Admin approves the project
6. **Backend**: Updates project status to "LIVE"
7. **Investor App**: Project appears in market for investors
8. **Investor App**: Investor can now buy shares

### Example 2: Investor Makes an Investment

1. **Investor App**: User browses live projects
2. **Investor App**: Selects project and amount to invest
3. **Backend**: Checks wallet balance
4. **Backend**: Creates investment transaction
5. **Backend**: Updates project funding status
6. **Business Panel**: Business sees new investment
7. **Investor App**: Investment appears in portfolio
8. **Admin Panel**: Admin sees transaction in reports

### Example 3: Wallet Top-Up Flow

1. **User**: Requests wallet top-up (any panel/app)
2. **Backend**: Creates payment request with status "PENDING"
3. **Admin Panel**: Admin sees payment request
4. **Admin Panel**: Admin verifies payment and approves
5. **Backend**: Credits user wallet
6. **User**: Sees updated balance

## Testing Integration

### 1. Start Backend Locally

```bash
cd backend
npm install
npm start
# Backend runs on http://localhost:5000
```

### 2. Start Admin Panel

```bash
cd admin-web
echo VITE_API_URL=http://localhost:5000/api > .env
npm run dev
# Admin panel runs on http://localhost:5173
```

### 3. Start Business Panel

```bash
cd business-web
echo VITE_API_URL=http://localhost:5000/api > .env
npm run dev
# Business panel runs on http://localhost:5174
```

### 4. Run Mobile App

```bash
cd bcm_investor_app
# Update app_config.dart to use development environment
flutter run
```

## Production Deployment Status

✅ **Backend**: Deployed on Render.com
- URL: `https://bcm-6f7f.onrender.com`
- Database: MongoDB Atlas
- Status: Active

✅ **Admin Panel**: Deployed on Vercel
- URL: `https://bcm-theta.vercel.app`
- Status: Active

✅ **Business Panel**: Deployed on Vercel
- URL: `https://business-web-orcin.vercel.app`
- Status: Active

✅ **Investor App**: APK available
- Environment: Production
- Backend: Real API integration

## Database Schema

All data is stored in MongoDB Atlas:

- **users** - All user accounts (admin, business, investor)
- **businesses** - Business profiles and KYC data
- **projects** - Investment projects
- **wallets** - User wallet balances
- **transactions** - All financial transactions
- **investments** - Project investments
- **payment_requests** - Top-up and withdrawal requests
- **plans** - Business subscription plans
- **fds** - Fixed deposit schemes

## API Authentication

All three platforms use JWT (JSON Web Tokens) for authentication:

1. User logs in with credentials
2. Backend returns JWT token
3. Token stored locally:
   - **Web**: `localStorage`
   - **Mobile**: `SharedPreferences`
4. Token sent in Authorization header: `Bearer <token>`
5. Backend validates token for protected routes

## CORS Configuration

Backend allows requests from:
- Admin Panel (local & production)
- Business Panel (local & production)
- Mobile App (all origins)

## Common Issues & Solutions

### Issue: "Network Error" in Mobile App

**Solution**:
1. Check backend is running
2. Verify `app_config.dart` has correct URL
3. For emulator: Use `http://10.0.2.2:5000/api`
4. For physical device: Use your local IP

### Issue: "Unauthorized" Error

**Solution**:
1. Login again to get fresh token
2. Clear app data/localStorage
3. Check token not expired

### Issue: Web Panel Not Connecting

**Solution**:
1. Check `.env` file exists
2. Verify `VITE_API_URL` is correct
3. Restart dev server after .env changes

### Issue: Backend Connection Timeout

**Solution**:
1. Render.com free tier spins down after inactivity
2. First request may take 30-60 seconds
3. Subsequent requests will be fast

## Monitoring & Logs

### Backend Logs
Access via Render.com dashboard:
`https://dashboard.render.com`

### Frontend Errors
Check browser console (F12) for errors

### Mobile App Logs
```bash
flutter logs
```

## Next Steps

1. ✅ All platforms integrated with real backend
2. ✅ Production deployments active
3. ✅ Environment configuration complete
4. 📱 Test complete user flows
5. 🚀 Ready for users!

## Support

For issues or questions:
1. Check backend health: `https://bcm-6f7f.onrender.com/health`
2. Review API logs in Render dashboard
3. Check browser/mobile console for errors
4. Verify environment configurations
