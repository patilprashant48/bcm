# BCM Platform - Complete Requirements Document

## 📱 Project Overview

**Business Capital Market (BCM)** - A digital marketplace connecting businesses seeking capital with investors, similar to a stock market trading platform.

---

## 👥 User Types

### 1. Company Admin User
- Platform administrator
- Manages all approvals and verifications
- Controls platform settings and commissions

### 2. Business User (Web Application)
- Businesses seeking capital
- Creates projects and capital raising schemes
- Manages shares, loans, FDs, partnerships

### 3. Mobile App User (Investors)
- Individual investors
- Buy/sell shares, invest in loans, FDs, partnerships
- Trade with other users

---

## 🔐 Authentication & Registration

### Registration Methods
1. **Google Login** (OAuth)
2. **Email + Mobile Registration**
   - Email verification via OTP
   - Mobile number verification

### Password Requirements
- **First Login**: Mandatory password update
- **Strength Requirements**:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character
- **Confirmation**: Must retype password
- **Notification**: Email sent (password not disclosed)

### Implementation Status
✅ JWT authentication implemented
✅ OTP verification system
✅ Google login (simplified)
✅ Password strength validation
✅ Forced password update on first login
✅ Email notifications

---

## 👤 Profile Management

### Personal Profile
- ✅ Profile photo upload
- ✅ Aadhaar number
- ✅ Name and address
- ✅ PAN number
- ✅ Contact details (email, mobile)

### Business Profile
- ✅ Business logo upload (PNG/JPG)
- ✅ Business name
- ✅ Business type: Proprietorship, Pvt. Ltd., Limited, Partnership, LLP
- ✅ Business model: Manufacturing, Trading, Service

### Document Uploads
- ✅ Registration certificate (PDF/Image)
- ✅ Udyam Aadhaar certificate
- ✅ PAN (Business/Self)
- ✅ GST certificate

### Banking Details
- ✅ Account holder name
- ✅ Bank name
- ✅ Account number
- ✅ IFSC code
- ✅ UPI ID

### Implementation Status
✅ Database schema created for all fields
✅ File upload structure ready
🚧 Frontend forms (business web app - pending)

---

## 🏢 Business Activation Workflow

### Process Flow

1. **Business User Submission**
   - Submits complete profile and documents
   - Request appears in Admin panel

2. **Admin Review** (Admin > Business Menu > Activation)
   - **New Tab**: Shows pending requests
   - Fields displayed:
     - Request Number
     - Date & Time
     - User Name
     - Business Name
     - Business Type
     - Email
     - Mobile Number
     - Action buttons

3. **Admin Actions**
   - ✅ **Approve**: 
     - Generates User Business ID
     - Sends email notification
     - Moves to Active Tab with activation date
   - ✅ **Recheck**: 
     - Admin adds comments on specific fields
     - Moves to Recheck Tab
     - User can only edit flagged fields
   - ✅ **Reject**: 
     - Permanent rejection with reason
     - Email notification sent

4. **Post-Approval**
   - User ID generated and emailed
   - Business moves to Active status
   - Admin can deactivate later if needed

### Implementation Status
✅ Database schema with approval workflow
✅ Admin approval API endpoints
✅ Email notification system
✅ Frontend approval interface (basic)
🚧 Field-level rejection UI (pending)

---

## 💰 Wallet Management

### Wallet Types

#### For Business Users
- **Business Wallet**: Main operational wallet

#### For Mobile App Users
- **Business Wallet**: For purchasing investments
- **Income Wallet**: For receiving returns/profits

### Top-Up Process

1. **User Request**
   - User goes to Wallet > Top-Up
   - Views Admin's payment details:
     - Bank Account Number
     - UPI ID
     - QR Code
   - Selects payment method
   - Makes payment
   - Uploads payment screenshot
   - Submits request

2. **Request Tracking**
   - Appears in Wallet > Requests (Submit Tab)
   - Shows: Request No., Date, Time, Payment Details, Amount

3. **Admin Review** (Wallet > Requests > New Tab)
   - ✅ **Accept**: 
     - Debits Admin wallet
     - Credits User wallet
     - Email notification sent
   - ✅ **Reject**: 
     - Moves to Rejected Tab
     - Admin adds comment
     - Email notification sent

### Ledger System
✅ **Immutable Ledger**: All transactions recorded permanently
✅ **Balance Calculation**: Computed from ledger entries
✅ **Atomic Transfers**: Ensures transaction integrity

### Implementation Status
✅ Ledger-based wallet system
✅ Payment request workflow
✅ Admin approval/rejection
✅ Email notifications
✅ Frontend payment request page
🚧 QR code upload feature

---

## 📋 Plan Activation

### Process
1. User selects plan
2. Wallet balance debited
3. Plan activated

### Plan Display
- **My Plan** section in User Profile
- Shows:
  - Plan Name
  - Activation Date
  - Expiry Date
  - Renewal button (if expired)

### Admin View
- **User > Plan-Active Tab**: Active subscriptions
- **User > Expired Tab**: Expired plans

### Implementation Status
✅ Plan database schema
✅ Plan activation API
✅ Expiry tracking (automated)
🚧 Frontend plan selection UI

---

## 📄 Legal Document System

### Process
1. Admin uploads document templates
2. After plan activation, user can access documents
3. Documents auto-filled with:
   - User name
   - Mobile number
   - Email
   - Business information
   - Address
   - Activation date

### Implementation Status
✅ Document template system
✅ Auto-fill placeholder logic
✅ Document generation service
🚧 PDF generation (currently HTML)

---

## 🚀 Project Creation

### Business User Flow

1. **Create Project** (Main Menu > Project > New Project)
   - Project Name
   - Start Date
   - Location & Full Address
   - Category: Online / Offline
   - Nature: Production / Trading / Service
   - Project Cost
   - Required Capital

2. **Submit for Approval**
   - Appears in Admin > Project > New Projects

### Admin Review
- ✅ **Accept**: Moves to Approved Tab
- ✅ **Reject**: Moves to Rejected Tab with comments
- ✅ **Recheck**: Returns to user with specific feedback

### Project Status Flow
NEW → RECHECK → APPROVED → LIVE → CLOSED

### Implementation Status
✅ Project database schema
✅ Admin approval workflow
✅ Status management
🚧 Frontend project creation form

---

## 💼 Capital Generation Methods

### A. Shares (Equity Funding)

#### Setup Process
1. Business User sets:
   - Share Value
   - Total Shares
   - Ownership Percentage

2. Admin reviews and approves

3. **Share Distribution**:
   - 50% Locked Shares (Owner's reserved)
   - 50% Open Shares (Public trading)

#### Trading Features
- ✅ Buy/Sell functionality
- ✅ Price fluctuation system
- ✅ Commission deduction
- 🚧 Quarterly audit integration
- 🚧 Market demand algorithms

#### Price Fluctuation Factors
- Quarterly audits
- Market demand
- Admin-controlled conditions

### B. Partnership Funding

#### Setup
- Business User defines:
  - Partnership Value
  - Number of partners (Single/Multiple)
  - Agreed return percentage
  - Payout frequency

#### Returns
- ✅ Auto-debit from Business Wallet
- ✅ Auto-credit to Partner Wallet
- ✅ Fixed interval payouts (monthly/quarterly/yearly)

### C. Loan Funding

#### Setup
- Business User creates:
  - Loan Amount
  - Tenure (months)
  - Interest Rate
  - EMI Amount (calculated)

#### EMI System
- ✅ Auto-debit from Business Wallet
- ✅ Auto-credit to Lender Wallet
- ✅ EMI schedule tracking
- ✅ Overdue detection

### D. Fixed Deposit (FD)

#### Setup
- Business User creates:
  - FD Amount
  - Interest Rate
  - Tenure (months)
  - Maturity Amount (calculated)

#### Maturity
- ✅ Auto-debit from Business Wallet
- ✅ Auto-credit to Investor Wallet
- ✅ Maturity date tracking
- ✅ Email notifications

### Implementation Status
✅ Database schema for all capital types
✅ Investment tracking
✅ Automated workflows (EMI, FD maturity, payouts)
🚧 Frontend creation forms
🚧 Mobile app trading interface

---

## 📱 Mobile App Specifications

### Registration & Login
1. Download from Google Play Store
2. Login with mobile number
3. OTP auto-verification
4. KYC Verification:
   - Aadhaar Card Number
   - PAN Number
   - UPI ID
   - Bank Account details
   - Profile photo

### Bottom Navigation Bar
- 🏠 **Home**: Dashboard, wallet balances, buckets
- 📊 **Portfolio**: Holdings, performance
- 📋 **Orders**: Transaction history
- ⭐ **Watchlist**: Saved projects/shares
- 👤 **Account**: Profile, settings, reports

### Top Section
- Profile Icon
- Notifications Bell
- Search Bar

### Home Screen Features
- Business Wallet balance
- Income Wallet balance
- Bucket List:
  - Shares
  - Stocks
  - Loans
  - Fixed Deposits
  - Partnerships
  - Investments
- Each bucket shows total value

### Features
- ✅ Live trading view (buy/sell activity)
- ✅ Commission auto-deduction
- ✅ Transaction statements
- ✅ Account summary
- ✅ Detailed reports
- ✅ Pop-up announcements (Admin controlled)

### Purchase Flow
1. Add items to bucket (cart-like)
2. Checkout
3. Payment debited from Wallet
4. Credited to Business User
5. Admin charges deducted automatically

### User-to-User Trading
- Users can sell to other users
- On maturity (FD/Share), holder receives benefits
- Benefits credited to Income Wallet

### Implementation Status
✅ Backend APIs ready
✅ Database schema complete
🚧 Flutter app structure (guide created)
🚧 Mobile UI implementation

---

## 📊 Transaction & Reporting System

### Admin Reports
- ✅ Business Registrations
- ✅ Wallet Transactions (Top-up, Debit, Credit, Rejects)
- ✅ Project Approvals & Status
- ✅ Share Transactions
- ✅ Loan Transactions
- ✅ Partnership Returns
- ✅ FD Maturity & Payouts

### User Reports
- Transaction Statement
- Account Summary
- Investment Performance
- Tax Reports

### Implementation Status
✅ Database tracking for all transactions
✅ Ledger-based reporting
🚧 Report generation UI
🚧 Export functionality (PDF/Excel)

---

## 🔄 Automated Workflows

### Daily Tasks
- ✅ **9:00 AM**: EMI Processing
- ✅ **10:00 AM**: FD Maturity Processing
- ✅ **12:00 AM**: Plan Expiry Check

### Monthly Tasks
- ✅ **1st, 11:00 AM**: Partnership Payouts

### Hourly Tasks
- ✅ **Every Hour**: Share Price Updates

### Implementation Status
✅ All cron jobs implemented
✅ Email notifications
✅ Automated wallet transfers
⚠️ Only runs in production mode

---

## 🎯 Implementation Checklist

### ✅ Completed (Backend)
- [x] MongoDB Atlas database schema
- [x] User authentication (JWT, OTP, Google)
- [x] Ledger-based wallet system
- [x] Payment request workflow
- [x] Business approval workflow
- [x] Project management
- [x] Share/Stock system
- [x] Capital options (Partnership, Loan, FD, Bond)
- [x] Plan management
- [x] Document generation
- [x] Automated workflows
- [x] Email notifications
- [x] API endpoints (all routes)

### ✅ Completed (Admin Web)
- [x] Login & authentication
- [x] Dashboard
- [x] Business approval interface
- [x] Payment request management
- [x] Project approvals (basic)
- [x] Navigation & routing

### 🚧 In Progress
- [ ] Business Web App (complete implementation)
- [ ] Mobile App (Flutter)
- [ ] Advanced admin features
- [ ] Reporting & analytics
- [ ] File upload handling
- [ ] PDF document generation

### 📋 Pending Features
- [ ] Field-level rejection UI
- [ ] QR code upload
- [ ] User-to-user trading
- [ ] Advanced share price algorithms
- [ ] Quarterly audit integration
- [ ] Tax report generation
- [ ] Push notifications (mobile)
- [ ] Real-time updates (WebSockets)

---

## 🚀 Current Status

**Database**: ✅ MongoDB Atlas configured
**Backend**: ✅ Fully functional with all APIs
**Admin Web**: ✅ Core features working
**Business Web**: 🚧 Structure ready, needs implementation
**Mobile App**: 🚧 Guide created, needs development

---

## 📝 Notes

1. **MVP Focus**: Current implementation prioritizes core functionality
2. **Security**: JWT auth, password hashing, RBAC implemented
3. **Scalability**: MongoDB Atlas allows easy scaling
4. **Automation**: Cron jobs handle recurring tasks
5. **Audit Trail**: Immutable ledger ensures complete transaction history

---

**Last Updated**: 2026-01-18
**Version**: 1.0 (MVP)
**Status**: Backend Complete, Frontend In Progress
