# BCM Platform - Login Credentials

## Admin Panel

**URL**: Your Vercel deployment URL for admin-web

**Credentials**:
- **Email**: `admin@bcm.com`
- **Password**: `Admin@123`
- **Mobile**: `9999999999`
- **Role**: ADMIN

## Business Portal

**URL**: Your Vercel deployment URL for business-web

**Credentials**:
- **Email**: `business@test.com`
- **Password**: `business123`
- **Role**: BUSINESS_USER

## Mobile App (Investor)

**APK**: `bcm_investor_app/build/app/outputs/flutter-apk/app-release.apk`

**Credentials**:
- **Mobile**: `9876543210`
- **Password**: `investor123`
- **Role**: INVESTOR

## Backend API

**URL**: https://bcm-6f7f.onrender.com

**Endpoints**:
- Health Check: `/health`
- Login: `/api/auth/login`
- Debug Routes: `/debug/routes`

## Database Users

All users are created in MongoDB Atlas with emergency bypass enabled.

### Admin User
```javascript
{
  email: 'admin@bcm.com',
  mobile: '9999999999',
  password: 'Admin@123', // Hashed in DB
  name: 'BCM Administrator',
  user_type: 'ADMIN',
  status: 'ACTIVE'
}
```

### Business User
```javascript
{
  email: 'business@test.com',
  password: 'business123', // Emergency bypass
  role: 'BUSINESS_USER'
}
```

### Investor User
```javascript
{
  email: 'investor@test.com',
  mobile: '9876543210',
  password: 'investor123', // Hashed in DB
  name: 'Test Investor',
  user_type: 'INVESTOR',
  status: 'ACTIVE'
}
```

## Emergency Bypass

All three users have emergency bypass enabled in the backend for testing purposes.

**Location**: `backend/controllers/authController.js`

**To disable**: Remove the bypass code blocks after testing is complete.

## Testing Checklist

### Admin Panel
- [ ] Login with admin@bcm.com
- [ ] Access dashboard
- [ ] View businesses
- [ ] View projects
- [ ] Manage users

### Business Portal
- [ ] Login with business@test.com
- [ ] Complete onboarding (if required)
- [ ] Create project
- [ ] View wallet
- [ ] Manage capital raising

### Mobile App
- [ ] Install APK
- [ ] Login with 9876543210
- [ ] View projects
- [ ] Check portfolio
- [ ] View wallet
- [ ] Browse opportunities

## Notes

- All passwords are case-sensitive
- Admin password includes special characters: `Admin@123`
- Backend must be awake (visit `/health` first if using Render free tier)
- Frontend deployments on Vercel auto-deploy from GitHub
- Backend deployment on Render auto-deploys from GitHub

## Security Reminder

⚠️ **IMPORTANT**: These are test credentials with emergency bypass enabled.

**Before going to production:**
1. Remove all emergency bypass code
2. Create real admin user with strong password
3. Disable test users
4. Enable proper authentication flow
5. Add rate limiting
6. Enable HTTPS only
7. Update CORS to specific origins
