# 🚀 BCM Platform - Run Instructions

## ⚠️ IMPORTANT: Before Running

You need to configure your Supabase database connection first!

## Step 1: Setup Supabase Database (Required)

### Option A: Create New Supabase Project

1. Go to https://supabase.com and sign up/login
2. Click "New Project"
3. Fill in:
   - **Name**: BCM Platform
   - **Database Password**: (save this!)
   - **Region**: Choose closest to you
4. Wait for project to be created (~2 minutes)

### Option B: Use Existing Supabase Project

If you already have a Supabase project, skip to Step 2.

## Step 2: Run Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy entire contents of `backend/database/schema.sql`
4. Paste and click **Run**
5. Wait for completion (should see "Success")

6. Create another new query
7. Copy entire contents of `backend/database/seed.sql`
8. Paste and click **Run**
9. This creates the admin account

## Step 3: Get Supabase Credentials

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like: https://xxxxx.supabase.co)
   - **anon public** key (under "Project API keys")
   - **service_role** secret key (under "Project API keys")

## Step 4: Configure Backend Environment

1. Open `backend/.env` file (or create it if it doesn't exist)
2. Add your Supabase credentials:

```env
PORT=5000
NODE_ENV=development

# Supabase Configuration (REQUIRED)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-public-key-here
SUPABASE_SERVICE_KEY=your-service-role-secret-key-here

# JWT Secret (REQUIRED)
JWT_SECRET=my-super-secret-jwt-key-change-this-in-production-12345

# Platform Settings
ADMIN_COMMISSION_PERCENT=2

# Email Configuration (Optional - emails will be logged to console)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads

# Frontend URLs (for CORS)
ADMIN_WEB_URL=http://localhost:5173
BUSINESS_WEB_URL=http://localhost:5174
```

**Replace**:
- `SUPABASE_URL` with your Project URL
- `SUPABASE_ANON_KEY` with your anon public key
- `SUPABASE_SERVICE_KEY` with your service_role secret key

## Step 5: Install Dependencies

### Backend
```bash
cd backend
npm install
```

### Admin Web
```bash
cd admin-web
npm install
```

## Step 6: Start the Servers

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

You should see:
```
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   BCM Platform Backend API                           ║
║   Server running on port 5000                        ║
║   Environment: development                           ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
```

### Terminal 2 - Admin Web
```bash
cd admin-web
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

## Step 7: Access the Application

1. Open browser: http://localhost:5173
2. Login with default admin account:
   - **Email**: admin@bcm.com
   - **Password**: Admin@123

3. You'll be prompted to update your password
4. New password must have:
   - Minimum 8 characters
   - At least one uppercase letter
   - At least one lowercase letter
   - At least one number
   - At least one special character (@$!%*?&)

## ✅ Verification

### Test Backend
```bash
curl http://localhost:5000/health
```

Should return:
```json
{
  "success": true,
  "message": "BCM Backend API is running",
  "timestamp": "2026-01-18T..."
}
```

### Test Admin Web
- Dashboard should load
- Navigation should work
- No console errors

## 🐛 Troubleshooting

### "Cannot connect to database"
- Check Supabase credentials in `.env`
- Verify Supabase project is active
- Check internet connection

### "Port 5000 already in use"
- Change `PORT=5001` in `backend/.env`
- Restart backend

### "CORS error" in browser
- Check `ADMIN_WEB_URL` in backend `.env`
- Should be `http://localhost:5173`

### "Module not found"
- Run `npm install` in the respective directory
- Delete `node_modules` and reinstall

### Backend won't start
- Check all environment variables are set
- Verify `.env` file exists
- Check for syntax errors in `.env`

## 📝 Quick Commands

### Start Everything (PowerShell)
```powershell
# Terminal 1
cd "d:\Freelancing projects\BCM\backend"
npm run dev

# Terminal 2 (new terminal)
cd "d:\Freelancing projects\BCM\admin-web"
npm run dev
```

### Stop Servers
- Press `Ctrl+C` in each terminal

## 🎯 What to Do Next

Once running:
1. ✅ Login to admin panel
2. ✅ Update password
3. ✅ Explore dashboard
4. ✅ Check payment requests page
5. ✅ Review business activation pages

## 📚 Additional Resources

- **Full Documentation**: `README.md`
- **Quick Setup**: `QUICKSTART.md`
- **Deployment**: `DEPLOYMENT.md`
- **Project Summary**: `PROJECT_SUMMARY.md`

## 💡 Tips

- Keep both terminals open while developing
- Backend logs show API requests
- Frontend shows in browser console
- Email notifications are logged to backend console

## 🆘 Still Having Issues?

1. Check that Supabase database is set up correctly
2. Verify all environment variables
3. Check Node.js version (need 18+)
4. Review error messages in terminal
5. Check browser console for frontend errors

---

**Ready to run? Follow the steps above!** 🚀
