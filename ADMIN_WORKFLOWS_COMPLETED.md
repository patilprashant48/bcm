# Admin Panel Workflows - Completed

The following administrative workflows have been fully implemented in the Admin Panel (`admin-web`) and Backend (`backend`).

## 1. Business User Activation
**Components:** `NewBusinesses.jsx`, `RecheckBusinesses.jsx`, `ActiveBusinesses.jsx`
- **Features:**
  - **New Requests:** View detailed business info, documents (Aadhaar, PAN, etc.).
  - **Verification:** 'Verify' modal to check each document individually.
  - **Actions:** Approve (Active), Recheck (with comments), Reject (with reason).
  - **Active List:** View status of plans (Active/Expired), project counts, and Deactivate businesses.

## 2. Wallet Management
**Components:** `PaymentRequests.jsx`
- **Features:**
  - **Top-up Requests:** View pending wallet top-up requests with screenshots.
  - **Screenshot Viewer:** Modal to zoom in on payment proof.
  - **Actions:** Approve (credits wallet), Reject (with reason).

## 3. Plan Management
**Components:** `PlanManagement.jsx`
- **Features:**
  - **CRUD:** Create, Read, Update, Delete investment plans.
  - **Plan Details:** Name, Price, Validity, Project Limit, Investment Limit.

## 4. Legal Document Management
**Components:** `LegalTemplates.jsx`
- **Features:**
  - **Template Management:** Create and edit legal templates (Agreements, NDAs, Terms).
  - **Backend:** New `LegalTemplate` model and API endpoints implemented.

## 5. Project Management
**Components:** `ProjectApprovals.jsx`
- **Features:**
  - **7-Stage Workflow:** New -> Recheck -> Resubmit -> Reject -> Approve -> Live -> Closed.
  - **Detail View:** Comprehensive project details, documents, and founding team info.
  - **Actions:** Admin controls for every stage transition.

## 6. Share Value Approval
**Components:** `ShareManagement.jsx`
- **Features:**
  - **Structure Review:** Validates Owner vs. Open share distribution (must equal 100%).
  - **Actions:** Approve, Recheck, Reject share offering proposals.

## 7. Loan Approval
**Components:** `LoanManagement.jsx`
- **Features:**
  - **Request Review:** View loan amount, tenure, interest rate, and EMI calculations.
  - **Backend:** Added missing `approveLoan`, `rejectLoan`, `recheckLoan` endpoints.
  - **Actions:** Approve, Recheck, Reject.

## 8. FD & Bonds Approval
**Components:** `FixedDeposits.jsx` (mapped to `/capital/fds`)
- **Features:**
  - **Scheme Review:** Interest rates, maturity, min/max amounts, and returns preview.
  - **Actions:** Approve & Publish, Recheck, Reject.

## 9. Partnership Approval
**Components:** `Partnerships.jsx`
- **Features:**
  - **Offer Review:** Investment amount, equity offered, business details.
  - **Backend:** Added missing `approvePartnership`, `rejectPartnership`, `recheckPartnership` endpoints.
  - **Actions:** Approve, Recheck, Reject.

## 10. Settings & Charges Control
**Components:** `PlatformSettings.jsx`
- **Features:**
  - **Global Config:** Commission rates, transaction charges, wallet rules.
  - **Content:** Email configuration, contact info, social links.
  - **Live Preview:** See how settings affect the platform in real-time.

## Backend Updates
- **Models:** Added `LegalTemplate.js`.
- **Controllers:** Updated `adminController.js` to include missing logic for Capital Tools (Shares, Loans, Partnerships, FDs) and Legal Templates.
- **Routes:** Updated `admin.routes.js` to expose all new endpoints.
- **Frontend API:** Updated `api.js` to match backend routes.

## Navigation
- Updated `App.jsx` and `Layout.jsx` to correctly route to the new modules.
