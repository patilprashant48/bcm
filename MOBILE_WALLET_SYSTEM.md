# BCM Mobile App - Wallet System Specification

## 💰 Dual Wallet System

The BCM mobile app uses a **two-wallet system** for clear separation of funds:

### 1. Main Wallet 💳
**Purpose**: For making purchases and investments

**Use Cases**:
- Buy shares
- Buy stocks
- Invest in loans
- Purchase FDs
- Buy partnership stakes
- Make any investment

**Top-Up Process**:
1. User requests top-up
2. Views Admin's payment details (Bank/UPI/QR)
3. Makes payment via chosen method
4. Uploads payment screenshot
5. Admin verifies and approves
6. Balance credited to Main Wallet

**Balance Flow**:
```
User Payment → Admin Verification → Main Wallet Credit
```

---

### 2. Income Wallet 💰
**Purpose**: For receiving returns, profits, and benefits

**Receives**:
- EMI payments (from loans given)
- FD maturity amounts
- Partnership profit distributions
- Dividend from shares
- Interest income
- Sale proceeds (when selling to other users)

**Withdrawal**:
- User can withdraw to bank account
- Processed by admin
- Transferred to registered bank account

**Balance Flow**:
```
Returns/Profits → Income Wallet → Bank Withdrawal
```

---

## 🔄 Transaction Flow Examples

### Example 1: Buying Shares
```
1. User selects shares worth ₹10,000
2. Commission (2%) = ₹200
3. Total deducted from Main Wallet = ₹10,200
4. ₹10,000 → Business User
5. ₹200 → Admin Commission
```

### Example 2: Receiving FD Maturity
```
1. FD matures (Principal ₹50,000 + Interest ₹5,000)
2. Total ₹55,000 credited to Income Wallet
3. User can withdraw or reinvest
```

### Example 3: Loan EMI Received
```
1. Monthly EMI of ₹5,000 due
2. Auto-debited from borrower's Main Wallet
3. Credited to lender's Income Wallet
4. Email notification sent
```

### Example 4: User-to-User Trading
```
Seller:
- Sells 100 shares @ ₹150 = ₹15,000
- Commission (2%) = ₹300
- Net amount ₹14,700 → Income Wallet

Buyer:
- Buys 100 shares @ ₹150 = ₹15,000
- Commission (2%) = ₹300
- Total ₹15,300 deducted from Main Wallet
```

---

## 📊 Wallet Display on Home Screen

### Main Wallet Card
```
┌─────────────────────────────┐
│  Main Wallet          💳    │
│  Available Balance          │
│  ₹50,000.00                │
│                             │
│  [Top Up]                   │
└─────────────────────────────┘
```

### Income Wallet Card
```
┌─────────────────────────────┐
│  Income Wallet        💰    │
│  Total Earnings             │
│  ₹12,500.00                │
│                             │
│  [Withdraw]                 │
└─────────────────────────────┘
```

---

## 🎯 Investment Categories (Buckets)

All 6 investment types available:

### 1. Shares 📈
- Equity ownership in projects
- Price fluctuates based on market
- Can buy/sell to other users
- Dividends → Income Wallet

### 2. Stocks 📊
- Similar to shares
- Listed projects
- Real-time trading
- Capital gains → Income Wallet

### 3. Loans 💵
- Lend money to businesses
- Fixed interest rate
- Monthly EMI → Income Wallet
- Principal + Interest on completion

### 4. Fixed Deposits (FDs) 🏦
- Fixed tenure investment
- Guaranteed returns
- Maturity amount → Income Wallet
- Can be sold to other users before maturity

### 5. Partners 🤝
- Partnership stake in business
- Profit sharing
- Monthly/Quarterly payouts → Income Wallet
- Long-term investment

### 6. Investments 📁
- General investment category
- Mixed investment types
- Custom terms
- Returns → Income Wallet

---

## 💳 Payment Flow

### Top-Up to Main Wallet

**Step 1: Request**
```
User → Request Top-Up → Enter Amount
```

**Step 2: Payment Details**
```
Admin Bank Details Displayed:
- Bank Name: HDFC Bank
- Account Number: 1234567890
- IFSC: HDFC0001234
- UPI ID: bcm@hdfc
- QR Code: [Display QR]
```

**Step 3: Payment**
```
User → Select Method → Make Payment → Upload Screenshot
```

**Step 4: Verification**
```
Admin → Verify Payment → Approve/Reject
```

**Step 5: Credit**
```
If Approved:
  Admin Wallet (-) → User Main Wallet (+)
  Email Notification Sent
  
If Rejected:
  Comment Added
  Email Notification Sent
  User can resubmit
```

---

## 🔄 Automated Transactions

### Daily (9:00 AM) - EMI Processing
```
Business Main Wallet → Investor Income Wallet
Auto-debit EMI amount
Email notification to both parties
```

### Daily (10:00 AM) - FD Maturity
```
Business Main Wallet → Investor Income Wallet
Credit maturity amount
Email notification
```

### Monthly (1st, 11:00 AM) - Partnership Payouts
```
Business Main Wallet → Partner Income Wallet
Credit profit share
Email notification
```

---

## 📱 Mobile App Screens

### Home Screen Components
1. **Top Bar**: Profile, Notifications, Search
2. **Wallet Cards**: Main Wallet + Income Wallet
3. **Investment Buckets**: 6 categories (horizontal scroll)
4. **Live Projects**: Real-time price list
5. **Bottom Nav**: Home, Portfolio, Orders, Watchlist, Account

### Wallet Screen Components
1. **Main Wallet Card**: Balance + Top Up button
2. **Income Wallet Card**: Balance + Withdraw button
3. **Transaction History**: All transactions with filters
4. **Request Top-Up FAB**: Floating action button

### Portfolio Screen Components
1. **Total Value**: Combined portfolio worth
2. **Allocation Chart**: Donut chart by category
3. **Holdings List**: All investments with P&L
4. **Performance Metrics**: Returns, gains, losses

---

## 🎨 Visual Design

### Main Wallet
- **Color**: Blue gradient (#2196F3 to #1976D2)
- **Icon**: 💳 Credit card
- **Button**: "Top Up" (Blue)

### Income Wallet
- **Color**: Green gradient (#00D084 to #00A86B)
- **Icon**: 💰 Money bag
- **Button**: "Withdraw" (Green)

### Transaction Icons
- **Credit** (↑): Green arrow up
- **Debit** (↓): Red arrow down

---

## 🔐 Security Features

### Main Wallet
- PIN verification for large transactions
- Biometric authentication option
- Transaction limits
- Fraud detection

### Income Wallet
- Withdrawal verification
- Bank account validation
- Daily withdrawal limits
- Email/SMS alerts

---

## 📊 Reporting

### Transaction Statement
- All Main Wallet transactions
- All Income Wallet transactions
- Date range filter
- Export to PDF/Excel

### Account Summary
- Total invested (from Main Wallet)
- Total earned (in Income Wallet)
- Active investments
- Completed investments
- Net profit/loss

### Tax Reports
- Income from FDs
- Income from partnerships
- Capital gains from shares
- Interest income from loans

---

## ✅ Implementation Checklist

### Database Schema
- [x] Main Wallet (INVESTOR_BUSINESS wallet type)
- [x] Income Wallet (INVESTOR_INCOME wallet type)
- [x] Ledger entries for all transactions
- [x] Payment request system

### Backend APIs
- [x] Get wallet balances
- [x] Request top-up
- [x] Admin approve/reject
- [x] Automated transfers (EMI, FD, Partnership)
- [x] Transaction history

### Mobile App
- [ ] Wallet screen UI
- [ ] Top-up request flow
- [ ] Transaction history
- [ ] Withdrawal request
- [ ] Real-time balance updates

---

## 🎯 User Experience Flow

### First-Time User
1. Download app
2. Register with mobile number
3. Complete KYC
4. **Main Wallet shows ₹0**
5. **Income Wallet shows ₹0**
6. Request first top-up
7. Start investing

### Regular User
1. Open app
2. Check wallet balances
3. Browse live projects
4. Make investment (Main Wallet debited)
5. Receive returns (Income Wallet credited)
6. Withdraw earnings to bank

---

**Key Difference from Business User**:
- Business User has: **Business Wallet** (for operations)
- Mobile User has: **Main Wallet** (for investments) + **Income Wallet** (for returns)

This separation ensures clear tracking of:
- Money invested vs Money earned
- Capital vs Returns
- Purchases vs Income

---

**Last Updated**: 2026-01-18
**Version**: 2.0 (Corrected Wallet Terminology)
