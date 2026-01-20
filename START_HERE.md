# 🚀 BCM Platform - Quick Start (3 Steps)

## ⚠️ Important: Run commands from the correct directory!

---

## Step 1: Seed the Database (First Time Only)

Open **Command Prompt** or **PowerShell** and run:

```bash
cd "d:\Freelancing projects\BCM\backend"
npm run seed
```

**Expected Output:**
```
MongoDB Connected: cluster0.cwbhsgj.mongodb.net
Starting database seeding...
✓ Admin user created
✓ Admin profile created
✓ Admin wallet created
✓ Platform settings created
✓ Sample plans created
✓ Document templates created
✓ Sample announcement created

✅ Database seeding completed successfully!

Default Admin Credentials:
Email: admin@bcm.com
Password: Admin@123
```

---

## Step 2: Start Backend Server

**Keep the same terminal open** and run:

```bash
npm run dev
```

**Expected Output:**
```
MongoDB Connected: cluster0.cwbhsgj.mongodb.net
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   BCM Platform Backend API                           ║
║   Server running on port 5000                        ║
║   Environment: development                           ║
║   Database: MongoDB Atlas                            ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
```

✅ **Backend is now running!** Leave this terminal open.

---

## Step 3: Start Admin Web App

Open a **NEW terminal** (Command Prompt or PowerShell) and run:

```bash
cd "d:\Freelancing projects\BCM\admin-web"
npm run dev
```

**Expected Output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

✅ **Admin web is now running!**

---

## Step 4: Login

1. Open your browser
2. Go to: **http://localhost:5173**
3. Login with:
   - **Email**: `admin@bcm.com`
   - **Password**: `Admin@123`
4. You'll be prompted to update your password
5. New password must have:
   - At least 8 characters
   - Uppercase letter
   - Lowercase letter
   - Number
   - Special character

---

## 🎯 Summary

**Two terminals needed:**

### Terminal 1 - Backend
```bash
cd "d:\Freelancing projects\BCM\backend"
npm run seed    # First time only
npm run dev     # Every time
```

### Terminal 2 - Admin Web
```bash
cd "d:\Freelancing projects\BCM\admin-web"
npm run dev     # Every time
```

---

## 🐛 Common Errors

### Error: "Cannot find module"
**Solution:**
```bash
cd backend
npm install

cd ../admin-web
npm install
```

### Error: "Port 5000 already in use"
**Solution:** Kill the process using port 5000 or change PORT in `backend/.env`

### Error: "ENOENT: no such file or directory, open package.json"
**Solution:** You're in the wrong directory! Use `cd backend` or `cd admin-web`

### Error: "MongoServerError: bad auth"
**Solution:** Check your password in `backend/.env` - make sure it's correct

---

## ✅ Verification

### Check Backend
Open: http://localhost:5000/health

Should return:
```json
{
  "success": true,
  "message": "BCM Backend API is running",
  "database": "MongoDB Atlas"
}
```

### Check Admin Web
Open: http://localhost:5173

Should show login page.

---

## 🔄 Restart Instructions

### To Stop:
Press `Ctrl+C` in each terminal

### To Start Again:
```bash
# Terminal 1
cd "d:\Freelancing projects\BCM\backend"
npm run dev

# Terminal 2
cd "d:\Freelancing projects\BCM\admin-web"
npm run dev
```

**Note:** You only need to run `npm run seed` once (first time).

---

## 📁 Directory Structure

```
BCM/
├── backend/           ← Run backend commands here
│   ├── .env          ← MongoDB connection configured
│   └── package.json
│
├── admin-web/        ← Run admin-web commands here
│   └── package.json
│
├── start-backend.bat ← Double-click to start backend
└── start-admin.bat   ← Double-click to start admin web
```

---

## 🎉 Success Checklist

- [ ] Database seeded (admin account created)
- [ ] Backend running on port 5000
- [ ] Admin web running on port 5173
- [ ] Can access http://localhost:5173
- [ ] Can login with admin@bcm.com
- [ ] Dashboard loads successfully

---

**Ready to go!** 🚀
