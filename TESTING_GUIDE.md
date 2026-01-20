# BCM Platform - Complete Testing Guide

## 🚀 Quick Start Testing

### Prerequisites
- Node.js 18+ installed
- MongoDB running (local or Atlas)
- Flutter SDK (for mobile app)
- Android emulator or device (for mobile app)

---

## 1️⃣ Backend Testing

### Step 1: Start MongoDB
```bash
# If using local MongoDB
mongod

# If using MongoDB Atlas, ensure connection string is in .env
```

### Step 2: Configure Environment
```bash
cd "d:\Freelancing projects\BCM\backend"

# Create .env file if not exists
echo MONGODB_URI=mongodb://localhost:27017/bcm > .env
echo JWT_SECRET=your-secret-key-here >> .env
echo PORT=5000 >> .env
```

### Step 3: Install Dependencies & Seed Database
```bash
npm install
npm run seed
```

### Step 4: Start Backend Server
```bash
npm run dev
```

**Expected Output:**
```
Server running on port 5000
MongoDB connected successfully
```

### Step 5: Test API Endpoints
```bash
# Test health check
curl http://localhost:5000/api/health

# Test login (use seeded admin credentials)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@bcm.com\",\"password\":\"admin123\"}"
```

**Default Seeded Accounts:**
- **Admin**: admin@bcm.com / admin123
- **Business**: business@test.com / business123
- **Investor**: investor@test.com / investor123

---

## 2️⃣ Admin Web App Testing

### Step 1: Install Dependencies
```bash
cd "d:\Freelancing projects\BCM\admin-web"
npm install
```

### Step 2: Configure Environment
```bash
# Create .env file
echo VITE_API_URL=http://localhost:5000/api > .env
```

### Step 3: Start Development Server
```bash
npm run dev
```

**Expected Output:**
```
VITE ready in XXX ms
➜  Local:   http://localhost:3000/
```

### Step 4: Test Admin Panel

**Open Browser:** http://localhost:3000

**Login:**
- Email: admin@bcm.com
- Password: admin123

**Test All Pages (22 pages):**

#### Business Activation (4 pages)
- [ ] `/businesses/new` - View new business applications
- [ ] `/businesses/recheck` - View businesses pending corrections
- [ ] `/businesses/active` - View active businesses
- [ ] `/businesses/inactive` - View inactive businesses

#### User Management (2 pages)
- [ ] `/customers` - View all customers
- [ ] `/kyc` - KYC verification

#### Projects (3 pages)
- [ ] `/projects` - Project approvals
- [ ] `/projects/live` - Live projects
- [ ] `/projects/closed` - Closed projects

#### Wallets & Payments (3 pages)
- [ ] `/payments` - Payment requests
- [ ] `/transactions` - Transaction history
- [ ] `/wallet` - Admin wallet

#### Plans & Settings (2 pages)
- [ ] `/plans` - Plan management
- [ ] `/settings` - Platform settings

#### Capital Tools (2 pages)
- [ ] `/capital/shares` - Share management
- [ ] `/capital/loans` - Loan management

#### Reports (1 page)
- [ ] `/reports/transactions` - Transaction reports

#### Content (1 page)
- [ ] `/content/notifications` - Send notifications

#### Admin & Security (2 pages)
- [ ] `/settings/admins` - Admin management
- [ ] `/settings/audit-logs` - Audit logs

#### Dashboard (1 page)
- [ ] `/` - Dashboard with stats

**Key Features to Test:**
- ✅ Login/logout
- ✅ Sidebar navigation
- ✅ Approve/reject workflows
- ✅ Search and filter
- ✅ Modal dialogs
- ✅ Form submissions
- ✅ Data loading states
- ✅ Error handling

---

## 3️⃣ Business Web App Testing

### Step 1: Install Dependencies
```bash
cd "d:\Freelancing projects\BCM\business-web"
npm install
```

### Step 2: Configure Environment
```bash
# Create .env file
echo VITE_API_URL=http://localhost:5000/api > .env
```

### Step 3: Start Development Server
```bash
npm run dev
```

**Expected Output:**
```
VITE ready in XXX ms
➜  Local:   http://localhost:3001/
```

### Step 4: Test Business Portal

**Open Browser:** http://localhost:3001

**Login:**
- Email: business@test.com
- Password: business123

**Test All Pages (8 pages):**

- [ ] `/` - Dashboard with stats
- [ ] `/wallet` - Wallet management
- [ ] `/projects` - My projects list
- [ ] `/projects/create` - Create new project
- [ ] `/capital` - Capital raising tools
- [ ] `/plans` - Subscription plans
- [ ] `/profile` - Business profile

**Key Features to Test:**
- ✅ Login/logout
- ✅ Dashboard stats display
- ✅ Wallet top-up request
- ✅ Project creation form
- ✅ Capital tools (shares, loans, FDs, partnerships)
- ✅ Plan activation
- ✅ Profile editing

---

## 4️⃣ Mobile App Testing

### Step 1: Install Dependencies
```bash
cd "d:\Freelancing projects\BCM\mobile_app"
flutter pub get
```

### Step 2: Start Android Emulator
```bash
# List available emulators
flutter emulators

# Start an emulator
flutter emulators --launch <emulator_id>

# Or use Android Studio to start emulator
```

### Step 3: Update API URL (for emulator)
**File:** `lib/services/api_service.dart`
```dart
// For Android emulator (already configured)
static const String baseUrl = 'http://10.0.2.2:5000/api';

// For real device, use your computer's IP
// static const String baseUrl = 'http://192.168.1.XXX:5000/api';
```

### Step 4: Run the App
```bash
flutter run
```

**Expected Output:**
```
Launching lib/main.dart on Android SDK built for x86...
Running Gradle task 'assembleDebug'...
✓ Built build/app/outputs/flutter-apk/app-debug.apk
```

### Step 5: Test Mobile App

**Login:**
- Mobile: investor@test.com (or use mobile number if configured)
- Password: investor123

**Test All Screens (5 screens):**

- [ ] Login screen
- [ ] Home screen (wallets + projects)
- [ ] Portfolio screen (holdings + P&L)
- [ ] Wallet screen (balance + transactions)
- [ ] Account screen (profile + menu)

**Key Features to Test:**
- ✅ Login/logout
- ✅ Bottom navigation
- ✅ Wallet cards display
- ✅ Project list with progress bars
- ✅ Portfolio P&L calculation
- ✅ Transaction history
- ✅ Pull to refresh

---

## 5️⃣ End-to-End Testing Scenarios

### Scenario 1: Business Onboarding Flow
1. **Business Web**: Register new business
2. **Admin Web**: Approve business activation
3. **Business Web**: Login and create project
4. **Admin Web**: Approve project
5. **Mobile App**: View live project

### Scenario 2: Investment Flow
1. **Mobile App**: Browse live projects
2. **Mobile App**: Buy shares
3. **Admin Web**: Approve payment
4. **Mobile App**: View updated portfolio
5. **Business Web**: See raised amount increase

### Scenario 3: Wallet Operations
1. **Business Web**: Request wallet top-up
2. **Admin Web**: Approve payment request
3. **Business Web**: See updated balance
4. **Business Web**: Create capital tool
5. **Admin Web**: Approve capital tool

### Scenario 4: Plan Management
1. **Admin Web**: Create new plan
2. **Business Web**: View available plans
3. **Business Web**: Activate plan
4. **Admin Web**: See subscription in dashboard

---

## 6️⃣ Testing Checklist

### Backend API
- [ ] All endpoints return 200 for valid requests
- [ ] Authentication works (JWT tokens)
- [ ] Database operations (CRUD)
- [ ] Wallet ledger immutability
- [ ] Email notifications sent
- [ ] Automated workflows running

### Admin Web
- [ ] All 22 pages load without errors
- [ ] Forms validate correctly
- [ ] API calls successful
- [ ] Loading states display
- [ ] Error messages show
- [ ] Modals open/close
- [ ] Sidebar navigation works
- [ ] Logout redirects to login

### Business Web
- [ ] All 8 pages load without errors
- [ ] Dashboard shows real data
- [ ] Forms submit successfully
- [ ] Wallet operations work
- [ ] Project creation works
- [ ] Capital tools functional
- [ ] Profile updates save

### Mobile App
- [ ] All 5 screens load
- [ ] Login successful
- [ ] Bottom navigation works
- [ ] Data fetches from API
- [ ] Pull to refresh works
- [ ] Cards display correctly
- [ ] Logout works

---

## 7️⃣ Common Issues & Solutions

### Issue: Backend won't start
**Solution:**
```bash
# Check if MongoDB is running
mongosh

# Check if port 5000 is available
netstat -ano | findstr :5000

# Kill process if needed
taskkill /PID <process_id> /F
```

### Issue: Frontend can't connect to backend
**Solution:**
- Check `.env` file has correct `VITE_API_URL`
- Ensure backend is running on port 5000
- Check browser console for CORS errors
- Verify firewall isn't blocking connections

### Issue: Mobile app can't connect
**Solution:**
```dart
// For Android emulator, use:
http://10.0.2.2:5000/api

// For real device, use computer's IP:
http://192.168.1.XXX:5000/api

// Find your IP:
ipconfig (Windows)
```

### Issue: Database seed fails
**Solution:**
```bash
# Drop existing database
mongosh
use bcm
db.dropDatabase()

# Re-run seed
npm run seed
```

### Issue: npm install fails
**Solution:**
```bash
# Clear cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

---

## 8️⃣ Performance Testing

### Load Testing
```bash
# Install artillery
npm install -g artillery

# Create test script (artillery.yml)
# Run load test
artillery run artillery.yml
```

### API Response Times
- Dashboard stats: < 500ms
- List endpoints: < 1s
- CRUD operations: < 300ms
- File uploads: < 2s

---

## 9️⃣ Security Testing

### Test Authentication
- [ ] Login with wrong credentials fails
- [ ] JWT token expires after timeout
- [ ] Protected routes redirect to login
- [ ] Password update works
- [ ] Logout clears session

### Test Authorization
- [ ] Admin can access admin routes
- [ ] Business can't access admin routes
- [ ] Investor can't access business routes
- [ ] API returns 403 for unauthorized access

### Test Input Validation
- [ ] SQL injection attempts blocked
- [ ] XSS attempts sanitized
- [ ] File upload validates types
- [ ] Form inputs validated

---

## 🔟 Automated Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd admin-web
npm test

cd business-web
npm test
```

### Mobile Tests
```bash
cd mobile_app
flutter test
```

---

## 📊 Testing Report Template

```markdown
# BCM Platform Test Report

**Date:** [Date]
**Tester:** [Name]
**Environment:** Development

## Backend
- [ ] Server starts successfully
- [ ] Database connected
- [ ] All APIs responding
- **Issues:** None

## Admin Web
- [ ] All 22 pages tested
- [ ] No console errors
- [ ] All features working
- **Issues:** None

## Business Web
- [ ] All 8 pages tested
- [ ] Forms working
- [ ] API integration successful
- **Issues:** None

## Mobile App
- [ ] All 5 screens tested
- [ ] Navigation working
- [ ] Data loading correctly
- **Issues:** None

## Overall Status: ✅ PASS / ❌ FAIL
```

---

## 🎯 Next Steps After Testing

1. **Fix any bugs found**
2. **Optimize performance**
3. **Add more test coverage**
4. **Prepare for production deployment**
5. **Create user documentation**
6. **Set up monitoring**

---

## 📞 Support

If you encounter issues:
1. Check console logs (browser/terminal)
2. Verify all services are running
3. Check network tab in browser DevTools
4. Review error messages
5. Check database for data

**All applications are ready for testing!** 🚀
