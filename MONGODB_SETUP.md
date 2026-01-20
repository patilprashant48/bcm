# 🚀 BCM Platform - MongoDB Atlas Setup & Run Guide

## ✅ Database Changed to MongoDB Atlas

The BCM platform now uses **MongoDB Atlas** (cloud MongoDB) instead of PostgreSQL/Supabase.

---

## 📋 Step-by-Step Setup

### Step 1: Create MongoDB Atlas Account (5 minutes)

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up for free account
3. Verify your email

### Step 2: Create a Cluster (2 minutes)

1. After login, click **"Build a Database"**
2. Choose **FREE** tier (M0 Sandbox)
3. Select cloud provider: **AWS** (recommended)
4. Choose region closest to you
5. Cluster name: `BCM-Cluster` (or any name)
6. Click **"Create"**
7. Wait 1-3 minutes for cluster to be created

### Step 3: Create Database User (1 minute)

1. Click **"Database Access"** in left sidebar
2. Click **"Add New Database User"**
3. Authentication Method: **Password**
4. Username: `bcm-admin` (or your choice)
5. Password: Click **"Autogenerate Secure Password"** and **SAVE IT**
6. Database User Privileges: **"Atlas admin"**
7. Click **"Add User"**

### Step 4: Configure Network Access (1 minute)

1. Click **"Network Access"** in left sidebar
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (for development)
   - This adds `0.0.0.0/0`
4. Click **"Confirm"**

> **Note**: For production, restrict to specific IPs

### Step 5: Get Connection String (30 seconds)

1. Click **"Database"** in left sidebar
2. Click **"Connect"** button on your cluster
3. Choose **"Connect your application"**
4. Driver: **Node.js**
5. Version: **5.5 or later**
6. Copy the connection string:
   ```
   mongodb+srv://bcm-admin:<password>@bcm-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
7. **Replace `<password>`** with your actual password from Step 3

### Step 6: Configure Backend (1 minute)

1. Open `backend/.env` (or create it from `.env.example`)
2. Add your MongoDB connection string:

```env
PORT=5000
NODE_ENV=development

# MongoDB Atlas - REPLACE WITH YOUR CONNECTION STRING
MONGODB_URI=mongodb+srv://bcm-admin:YOUR_PASSWORD@bcm-cluster.xxxxx.mongodb.net/bcm-platform?retryWrites=true&w=majority

# JWT Secret
JWT_SECRET=my-super-secret-jwt-key-change-this-in-production-12345

# Platform Settings
ADMIN_COMMISSION_PERCENT=2

# Email (Optional - will log to console if not configured)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=

# Frontend URLs
ADMIN_WEB_URL=http://localhost:5173
BUSINESS_WEB_URL=http://localhost:5174
```

**Important**: 
- Replace `YOUR_PASSWORD` with your database password
- The database name `bcm-platform` is added after `.mongodb.net/`

### Step 7: Install Dependencies (2 minutes)

```bash
# Backend
cd backend
npm install

# Admin Web
cd ../admin-web
npm install
```

### Step 8: Seed the Database (30 seconds)

```bash
cd backend
npm run seed
```

You should see:
```
MongoDB Connected: bcm-cluster.xxxxx.mongodb.net
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

### Step 9: Start the Servers (1 minute)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

You should see:
```
MongoDB Connected: bcm-cluster.xxxxx.mongodb.net
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   BCM Platform Backend API                           ║
║   Server running on port 5000                        ║
║   Environment: development                           ║
║   Database: MongoDB Atlas                            ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
```

**Terminal 2 - Admin Web:**
```bash
cd admin-web
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

### Step 10: Login & Test (1 minute)

1. Open browser: http://localhost:5173
2. Login with:
   - **Email**: admin@bcm.com
   - **Password**: Admin@123
3. Update password when prompted
4. Explore the dashboard!

---

## ✅ Verification Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Database user created
- [ ] Network access configured (0.0.0.0/0)
- [ ] Connection string copied
- [ ] `.env` file configured with MONGODB_URI
- [ ] Dependencies installed (`npm install`)
- [ ] Database seeded (`npm run seed`)
- [ ] Backend running (port 5000)
- [ ] Admin web running (port 5173)
- [ ] Successfully logged in

---

## 🔍 Verify Database in MongoDB Atlas

1. Go to MongoDB Atlas dashboard
2. Click **"Browse Collections"** on your cluster
3. You should see database: **bcm-platform**
4. Collections:
   - users
   - userprofiles
   - wallets
   - ledgerentries
   - plans
   - platformsettings
   - documenttemplates
   - announcements

---

## 🐛 Troubleshooting

### "MongoServerError: bad auth"
- Check your password in MONGODB_URI
- Make sure you replaced `<password>` with actual password
- Password should NOT have special characters like `@`, `#`, `:` (or URL encode them)

### "Connection timeout"
- Check Network Access in MongoDB Atlas
- Make sure `0.0.0.0/0` is added
- Check your internet connection

### "Database not found"
- MongoDB creates database automatically on first write
- Run `npm run seed` to create and populate database

### "Cannot find module 'mongoose'"
- Run `npm install` in backend directory
- Check package.json has mongoose listed

### Backend won't start
- Check `.env` file exists in backend directory
- Verify MONGODB_URI is correct
- Check MongoDB Atlas cluster is running (green status)

---

## 📊 MongoDB vs PostgreSQL Changes

### What Changed:
- ✅ Database: PostgreSQL → MongoDB Atlas
- ✅ ORM: None → Mongoose
- ✅ Schema: SQL → Mongoose schemas
- ✅ Queries: SQL → MongoDB queries
- ✅ IDs: UUID → MongoDB ObjectId

### What Stayed the Same:
- ✅ All API endpoints
- ✅ Frontend code (no changes needed)
- ✅ Business logic
- ✅ Ledger-based wallet system
- ✅ Authentication flow
- ✅ All features

---

## 🎯 Quick Commands

### Start Everything
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd admin-web && npm run dev
```

### Reset Database
```bash
# In MongoDB Atlas, drop the database
# Then run seed again
cd backend
npm run seed
```

### Check Database
```bash
# In backend directory
node -e "require('./config/mongodb')().then(() => { require('./database/mongodb-schema'); console.log('Connected!'); process.exit(0); })"
```

---

## 💡 MongoDB Atlas Features

### Free Tier Includes:
- ✅ 512 MB storage
- ✅ Shared RAM
- ✅ Shared vCPU
- ✅ Perfect for development & testing

### Monitoring:
- Go to Atlas dashboard
- Click **"Metrics"** to see:
  - Connections
  - Operations per second
  - Network traffic
  - Storage usage

### Backup:
- Free tier: No automated backups
- Paid tier: Automated backups available

---

## 🚀 Production Deployment

For production:
1. Upgrade to M10+ cluster (paid)
2. Enable automated backups
3. Restrict network access to specific IPs
4. Use connection string with SSL
5. Set up monitoring alerts

---

## 📞 Support

### MongoDB Atlas Issues:
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com/
- Support: https://support.mongodb.com/

### BCM Platform Issues:
- Check `README.md` for general docs
- Check `QUICKSTART.md` for setup help

---

## 🎉 Success!

If you see the admin dashboard, you're all set! 🚀

**Next Steps:**
1. Explore the admin panel
2. Test payment approvals
3. Create test business users
4. Build business web app
5. Deploy to production

---

**Database**: MongoDB Atlas ✅
**Status**: READY TO USE 🚀
