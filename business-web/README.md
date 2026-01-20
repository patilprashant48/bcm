# Business Web Application

## Overview
Business portal for BCM platform where businesses can manage projects, wallet, and capital raising tools.

## Features Implemented
✅ Authentication (Login)
✅ Dashboard with stats
✅ Wallet management with top-up
✅ My Projects page with filtering
✅ Create Project form
✅ Capital Tools (Shares, Loans, FDs, Partnerships)
✅ Plans selection and activation
✅ Profile management
✅ Responsive layout with sidebar
✅ Protected routes

## Setup

### Install Dependencies
```bash
npm install
```

### Environment Configuration
Create `.env` file (already created):
```
VITE_API_URL=http://localhost:5000/api
```

### Run Development Server
```bash
npm run dev
```

The app will run on `http://localhost:3001`

## Project Structure
```
src/
├── components/
│   ├── Auth/
│   │   └── Login.jsx ✅
│   └── Layout/
│       └── Layout.jsx ✅
├── pages/
│   ├── Dashboard.jsx ✅
│   ├── Wallet.jsx ✅
│   ├── CapitalTools.jsx ✅
│   ├── Plans.jsx ✅
│   ├── Profile.jsx ✅
│   └── Projects/
│       ├── MyProjects.jsx ✅
│       └── CreateProject.jsx ✅
├── context/
│   └── AuthContext.jsx ✅
├── services/
│   └── api.js ✅
├── App.jsx ✅
└── main.jsx ✅
```

## Pages - All Complete! ✅

1. **Login** (`/login`) - Email/password authentication
2. **Dashboard** (`/`) - Stats overview and quick actions
3. **Wallet** (`/wallet`) - Balance, transactions, top-up requests
4. **My Projects** (`/projects`) - List all projects with status filtering
5. **Create Project** (`/projects/create`) - Comprehensive project creation form
6. **Capital Tools** (`/capital`) - Create shares, loans, FDs, partnerships
7. **Plans** (`/plans`) - View and activate subscription plans
8. **Profile** (`/profile`) - Edit business profile and banking details

## API Endpoints Used
- `POST /auth/login` - User login
- `GET /auth/profile` - Get user profile
- `GET /business/dashboard/stats` - Dashboard statistics
- `GET /wallet` - Get wallet balance
- `GET /wallet/transactions` - Get transaction history
- `POST /wallet/topup-request` - Request wallet top-up
- `GET /business/projects` - Get user's projects
- `POST /business/projects` - Create new project
- `POST /business/capital/shares` - Create share offering
- `POST /business/capital/loans` - Create loan scheme
- `POST /business/capital/fds` - Create FD scheme
- `POST /business/capital/partnerships` - Create partnership
- `GET /plans` - Get all plans
- `POST /plans/:id/activate` - Activate plan
- `PUT /business/profile` - Update profile

## Technologies
- React 18
- Vite
- React Router v6
- Tailwind CSS
- Axios

## Features by Page

### Dashboard
- Wallet balance card
- Total projects count
- Active projects tracking
- Total capital raised
- Quick action buttons
- Pending approvals alert

### Wallet
- Gradient balance card
- Transaction history with icons
- Top-up request modal
- File upload for payment screenshot
- Transaction type filtering

### My Projects
- Project cards with progress bars
- Status filtering (ALL, PENDING, LIVE, CLOSED)
- Raised amount tracking
- Quick navigation to details

### Create Project
- Comprehensive form with validation
- Project type selection
- Financial details (capital, ROI, duration)
- Business plan and risk factors
- Location and start date

### Capital Tools
- 4 tool types: Shares, Loans, FDs, Partnerships
- Modal-based creation forms
- Custom forms for each tool type
- Visual tool cards

### Plans
- Active plan banner
- Plan comparison cards
- Feature lists
- Activation modal
- Payment integration ready

### Profile
- Editable business information
- Tax details (PAN, GST)
- Banking information
- Read-only email field
- Save/cancel functionality

## Status
✅ **100% Complete** - All 8 pages fully functional!

## Next Steps (Optional Enhancements)
1. Add file upload for project documents
2. Implement project detail view page
3. Add transaction export functionality
4. Create onboarding wizard for new users
5. Add notifications system
6. Implement real-time updates

## Notes
- Backend must be running on `http://localhost:5000`
- MongoDB must be connected
- Admin account needed for testing approvals
- All forms include validation
- All API calls have error handling
