# FDS Not Showing in APK - RESOLVED

## Issue
New FD schemes created were not appearing in the investor mobile app.

## Root Cause
The FD scheme "Invvesta-1" was:
- ✅ **APPROVED** (`approvalStatus: 'APPROVED'`)
- ✅ **ACTIVE** (`isActive: true`)
- ❌ **NOT PUBLISHED** (`isPublished: false`)

For an FD scheme to be visible to investors, it must meet ALL three conditions:
```javascript
{
  isActive: true,
  isPublished: true,
  approvalStatus: 'APPROVED'
}
```

## Solution Applied

### 1. Created Publish Script
**File**: `backend/publish-fds.js`

This script:
- Finds all approved schemes that are not published
- Sets `isPublished: true` and `isActive: true`
- Saves the changes to database

### 2. Published the Scheme
Ran the script:
```bash
node backend/publish-fds.js
```

**Result**:
```
Publishing: Invvesta-1 (FDS202602176053)
✓ Published: Invvesta-1

=== SCHEMES NOW VISIBLE TO INVESTORS ===
Count: 2

1. gr fd
   Scheme ID: FDS202602135524
   Interest: 5% | Min: ₹20000
   Maturity: 450 days

2. Invvesta-1
   Scheme ID: FDS202602176053
   Interest: 18% | Min: ₹99
   Maturity: 365 days
```

## Current Status

✅ **Both FD schemes are now visible to investors**:

| Scheme | Interest | Min Amount | Maturity | Status |
|--------|----------|------------|----------|--------|
| gr fd | 5% | ₹20,000 | 450 days | ✅ Visible |
| Invvesta-1 | 18% | ₹99 | 365 days | ✅ Visible |

## How to Prevent This Issue

### Option 1: Admin Panel (Recommended for Production)
When creating/approving FD schemes in the Admin Panel:
1. **Approve** the scheme (Status Management)
2. **Publish** the scheme (toggle the "Published" switch)
3. **Activate** the scheme (toggle the "Active" switch)

### Option 2: Automated Script (For Testing/Development)
Use the publish script to automatically publish approved schemes:
```bash
cd backend
node publish-fds.js
```

## Diagnostic Tools

### Check FDS Status
```bash
node backend/check-fds.js
```
Shows:
- All FD schemes in database
- Their approval/published/active status
- Which schemes are visible to investors

### Approve Pending FDS
```bash
node backend/approve-fds.js
```
Approves all schemes with `approvalStatus != 'APPROVED'`

### Publish Approved FDS
```bash
node backend/publish-fds.js
```
Publishes all approved schemes that are not yet published

## Admin Panel Enhancement Needed

The Admin Panel should be updated to:
1. Show clear indicators for:
   - ⚪ Draft (not approved)
   - 🟡 Approved but not published
   - 🟢 Published and active
   - 🔴 Inactive

2. Provide a single "Publish" button that:
   - Approves the scheme
   - Sets `isPublished: true`
   - Sets `isActive: true`
   - All in one action

3. Add validation to prevent:
   - Publishing unapproved schemes
   - Activating unpublished schemes

## Testing in Mobile App

The FD schemes should now appear in:
1. **Market Screen** → FDs tab
2. Shows both schemes with their details
3. Investors can invest in either scheme

## Notes

- The mobile app already has the correct logic to fetch FDS
- The API endpoint `/api/investor/fds` correctly filters for visible schemes
- The issue was purely a data state problem (not published)
- No code changes were needed, only database updates

## Files Created/Modified

### New Scripts
- `backend/publish-fds.js` - Publishes approved schemes
- `backend/test-fds-api.js` - Tests the FDS API endpoint

### Existing Scripts
- `backend/check-fds.js` - Diagnostic tool (already existed)
- `backend/approve-fds.js` - Approval tool (already existed)

## Workflow for Future FDS

1. **Create** FD scheme in Admin Panel
2. **Approve** the scheme (sets `approvalStatus: 'APPROVED'`)
3. **Publish** the scheme (sets `isPublished: true`)
4. **Activate** the scheme (sets `isActive: true`)
5. Scheme is now visible in investor app

Or use the automated script:
```bash
node backend/publish-fds.js
```

This will handle steps 3-4 automatically for all approved schemes.
