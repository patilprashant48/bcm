# BCM Platform - Login Troubleshooting Guide

## Current Issue: Login Not Working

### Quick Diagnosis

Run these commands to diagnose the issue:

#### 1. Check if backend is running
```bash
curl http://localhost:5000/health
```
Expected: `{"success":true,"message":"BCM Backend API is running"...}`

#### 2. Test login API directly
```bash
curl -X POST http://localhost:5000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"business@test.com\",\"password\":\"business123\"}"
```

#### 3. Check MongoDB connection
Open MongoDB Compass and connect to your Atlas cluster to verify:
- Database name: `bcm`
- Collection: `users`
- Check if any users exist

---

## Solution 1: Create User via MongoDB Compass (EASIEST)

1. **Open MongoDB Compass**
2. **Connect to your cluster**
3. **Select database**: `bcm`
4. **Create collection**: `users` (if doesn't exist)
5. **Insert Document** with this exact JSON:

```json
{
  "email": "business@test.com",
  "passwordHash": "$2a$10$YourHashHere",
  "mobile": "9876543210",
  "role": "BUSINESS_USER",
  "isActive": true,
  "passwordUpdated": true,
  "createdAt": {"$date": "2026-01-19T00:00:00.000Z"},
  "updatedAt": {"$date": "2026-01-19T00:00:00.000Z"}
}
```

**Problem**: The passwordHash above won't work. You need to generate it.

---

## Solution 2: Generate Password Hash

Run this in Node.js console or create a file:

```javascript
const bcrypt = require('bcryptjs');
bcrypt.hash('business123', 10).then(hash => console.log(hash));
```

This will output something like:
```
$2a$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNO
```

Copy that hash and use it in the MongoDB document above.

---

## Solution 3: Manual User Creation Script

Create file `d:\Freelancing projects\BCM\backend\manual-user.js`:

```javascript
const bcrypt = require('bcryptjs');

async function generateHash() {
    const hash = await bcrypt.hash('business123', 10);
    console.log('\nCopy this passwordHash:');
    console.log(hash);
    console.log('\nThen insert this document in MongoDB Compass:');
    console.log(JSON.stringify({
        email: 'business@test.com',
        passwordHash: hash,
        mobile: '9876543210',
        role: 'BUSINESS_USER',
        isActive: true,
        passwordUpdated: true,
        createdAt: new Date(),
        updatedAt: new Date()
    }, null, 2));
}

generateHash();
```

Run: `node manual-user.js`

---

## Solution 4: Check Backend Logs

Look at the terminal where backend is running. When you try to login, you should see:
- Request received
- Any error messages

Common errors:
- "User not found" → User doesn't exist in database
- "Invalid credentials" → Password doesn't match
- "Account is inactive" → isActive is false
- CORS error → Backend not allowing requests

---

## Solution 5: Verify Database Schema

The backend expects this exact schema:

```javascript
{
  email: String,           // Required, unique
  passwordHash: String,    // NOT "password" - must be "passwordHash"
  mobile: String,
  role: String,           // 'ADMIN', 'BUSINESS_USER', or 'INVESTOR'
  isActive: Boolean,      // Must be true
  passwordUpdated: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Solution 6: Test with Admin Account

Try creating an admin user instead:

```json
{
  "email": "admin@bcm.com",
  "passwordHash": "<generated-hash>",
  "mobile": "9999999999",
  "role": "ADMIN",
  "isActive": true,
  "passwordUpdated": true,
  "createdAt": {"$date": "2026-01-19T00:00:00.000Z"},
  "updatedAt": {"$date": "2026-01-19T00:00:00.000Z"}
}
```

Then login at http://localhost:5173 with:
- Email: admin@bcm.com
- Password: admin123

---

## Debugging Checklist

- [ ] Backend running on port 5000
- [ ] MongoDB connected (check backend logs)
- [ ] Frontend running (5173 or 3001)
- [ ] CORS configured correctly
- [ ] User exists in database
- [ ] User has `passwordHash` field (not `password`)
- [ ] User `isActive` is `true`
- [ ] Password hash matches the password
- [ ] No errors in browser console (F12)
- [ ] No errors in backend logs

---

## Quick Test Commands

```bash
# 1. Check backend health
curl http://localhost:5000/health

# 2. List all users (if you have mongosh)
mongosh "your-connection-string" --eval "db.users.find().pretty()"

# 3. Count users
mongosh "your-connection-string" --eval "db.users.countDocuments()"

# 4. Check specific user
mongosh "your-connection-string" --eval "db.users.findOne({email:'business@test.com'})"
```

---

## Next Steps

1. **Use MongoDB Compass** to manually insert a user (easiest)
2. **Generate password hash** using bcrypt
3. **Verify user exists** in database
4. **Try login again**

If still not working, check:
- Browser console for errors
- Backend terminal for errors
- Network tab in DevTools to see the actual API response
