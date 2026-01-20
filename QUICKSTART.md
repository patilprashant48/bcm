# BCM Platform - Quick Start Guide

## 🚀 5-Minute Setup

### Step 1: Database (2 minutes)

1. Go to [Supabase](https://supabase.com) and create account
2. Create new project
3. Go to SQL Editor
4. Copy and paste `backend/database/schema.sql` → Run
5. Copy and paste `backend/database/seed.sql` → Run
6. Go to Project Settings → API → Copy:
   - Project URL
   - `anon` public key
   - `service_role` secret key

### Step 2: Backend (1 minute)

```bash
cd backend
npm install
```

Create `.env` file (copy from `.env.example`):
```env
SUPABASE_URL=<paste your URL>
SUPABASE_ANON_KEY=<paste anon key>
SUPABASE_SERVICE_KEY=<paste service key>
JWT_SECRET=my-secret-key-12345
```

Start backend:
```bash
npm run dev
```

✅ Backend running on http://localhost:5000

### Step 3: Admin Web App (1 minute)

```bash
cd admin-web
npm install
npm run dev
```

✅ Admin panel running on http://localhost:5173

### Step 4: Login (30 seconds)

Open http://localhost:5173

```
Email: admin@bcm.com
Password: Admin@123
```

Update password when prompted (must include uppercase, lowercase, number, special char).

✅ You're in! 🎉

## 🧪 Testing the System

### Test Payment Approval Flow

1. **As Admin**: Go to Payments tab
2. You'll see pending payment requests (if any)
3. Click "Approve" or "Reject"
4. Check wallet balance updates

### Test Business Approval

1. **As Admin**: Go to "New Businesses" tab
2. Review business applications
3. Click "Approve", "Recheck", or view details
4. Approved businesses move to "Active Businesses"

## 📱 Mobile App (Coming Soon)

Flutter app for investors will include:
- Browse live projects
- Buy/sell shares
- Portfolio management
- Wallet & transactions
- Investment tracking

## 🔧 Common Issues

**Port already in use:**
```bash
# Change PORT in backend/.env
PORT=5001
```

**CORS error:**
```bash
# Add your frontend URL to backend/.env
ADMIN_WEB_URL=http://localhost:5173
```

**Database connection failed:**
- Check Supabase project is active
- Verify credentials in .env
- Check internet connection

## 📚 Next Steps

1. ✅ Backend API running
2. ✅ Admin panel working
3. 🚧 Build business web app
4. 🚧 Create Flutter mobile app
5. 🚧 Deploy to production

## 🎯 MVP Features Checklist

### Backend
- [x] Authentication (JWT, OTP)
- [x] Wallet ledger system
- [x] User management
- [x] Business onboarding APIs
- [x] Admin approval APIs
- [x] Payment verification
- [x] Automated workflows

### Admin Web
- [x] Login & auth
- [x] Dashboard
- [x] Business approvals
- [x] Payment management
- [x] Project approvals

### Business Web
- [ ] Onboarding flow
- [ ] Project creation
- [ ] Share management
- [ ] Wallet interface

### Mobile App
- [ ] Investor login
- [ ] Project browsing
- [ ] Share trading
- [ ] Portfolio view
- [ ] Wallet management

## 💡 Tips

- Use Chrome DevTools to inspect API calls
- Check backend console for logs
- Email notifications logged to console (if SMTP not configured)
- Automation jobs only run in production mode

## 🆘 Need Help?

1. Check `README.md` for detailed documentation
2. Review `implementation_plan.md` for architecture
3. Inspect browser console for errors
4. Check backend logs for API errors

---

**Happy Building! 🚀**
