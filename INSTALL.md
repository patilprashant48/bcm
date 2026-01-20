# BCM Platform - Installation & Run

## 🔧 One-Time Setup

### Step 1: Install Backend Dependencies
```bash
cd "d:\Freelancing projects\BCM\backend"
npm install
```
⏳ This will take 2-3 minutes...

### Step 2: Install Admin Web Dependencies
```bash
cd "d:\Freelancing projects\BCM\admin-web"
npm install
```
⏳ This will take 2-3 minutes...

### Step 3: Create Admin Account
```bash
cd "d:\Freelancing projects\BCM\backend"
npm run seed
```

✅ You should see:
```
MongoDB Connected: cluster0.cwbhsgj.mongodb.net
✓ Admin user created
✓ Admin profile created
✓ Admin wallet created
...
Default Admin Credentials:
Email: admin@bcm.com
Password: Admin@123
```

---

## 🚀 Running the Application (Every Time)

### Terminal 1 - Backend
```bash
cd "d:\Freelancing projects\BCM\backend"
npm run dev
```

✅ Wait for:
```
Server running on port 5000
Database: MongoDB Atlas
```

### Terminal 2 - Admin Web (Open NEW terminal)
```bash
cd "d:\Freelancing projects\BCM\admin-web"
npm run dev
```

✅ Wait for:
```
Local: http://localhost:5173/
```

### Open Browser
- URL: http://localhost:5173
- Email: admin@bcm.com
- Password: Admin@123

---

## 📝 Current Status

✅ MongoDB configured
✅ .env file created
⏳ Installing dependencies (in progress)

**Next:** Wait for npm install to complete, then run the seed command.

---

## ⚡ Quick Reference

| Command | Purpose |
|---------|---------|
| `npm install` | Install dependencies (first time) |
| `npm run seed` | Create admin account (first time) |
| `npm run dev` | Start server (every time) |

---

**Installation in progress... Please wait for npm install to complete!**
