# Adding Investor User to MongoDB

## Method 1: Using the Script (Recommended)

Run this command in your terminal:

```bash
cd "d:\Freelancing projects\BCM\backend"
node create-investor.js
```

This will:
- Check if an investor user already exists
- Create a new investor user if none exists
- Update the password if user already exists

**Expected Output:**
```
✅ Connected to MongoDB
✅ Created new investor user:
   Email: investor@test.com
   Mobile: 9876543210
   Password: investor123

📱 Mobile App Login Credentials:
   Mobile: 9876543210
   Password: investor123
```

---

## Method 2: Using MongoDB Compass (Manual)

If the script doesn't work, you can add the user manually:

### Step 1: Open MongoDB Compass
1. Launch MongoDB Compass
2. Connect to your database using the connection string from `.env`

### Step 2: Navigate to Users Collection
1. Select database: `bcm`
2. Select collection: `users`

### Step 3: Insert New Document
Click **"Add Data"** → **"Insert Document"** and paste this JSON:

```json
{
  "email": "investor@test.com",
  "mobile": "9876543210",
  "passwordHash": "$2a$10$YourHashHere",
  "role": "INVESTOR",
  "isActive": true,
  "passwordUpdated": true,
  "emailVerified": true,
  "mobileVerified": true,
  "createdAt": { "$date": "2026-01-20T08:00:00.000Z" },
  "updatedAt": { "$date": "2026-01-20T08:00:00.000Z" }
}
```

### Step 4: Generate Password Hash

You need to generate a bcrypt hash for the password. Run this in your terminal:

```bash
cd "d:\Freelancing projects\BCM\backend"
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('investor123', 10).then(hash => console.log(hash));"
```

Copy the output hash and replace `$2a$10$YourHashHere` in the JSON above.

### Step 5: Insert the Document
Click **"Insert"** to add the user to the database.

---

## Method 3: Using Node.js REPL

```bash
cd "d:\Freelancing projects\BCM\backend"
node
```

Then paste this code:

```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const User = require('./models/User');
  
  const hash = await bcrypt.hash('investor123', 10);
  
  const user = new User({
    email: 'investor@test.com',
    mobile: '9876543210',
    passwordHash: hash,
    role: 'INVESTOR',
    isActive: true,
    passwordUpdated: true,
    emailVerified: true,
    mobileVerified: true
  });
  
  await user.save();
  console.log('✅ Investor user created!');
  process.exit(0);
});
```

---

## Verification

After adding the user, verify it exists:

### Using MongoDB Compass:
1. Go to `bcm` database → `users` collection
2. Look for document with `email: "investor@test.com"`

### Using Script:
```bash
cd "d:\Freelancing projects\BCM\backend"
node -e "const mongoose = require('mongoose'); require('dotenv').config(); const User = require('./models/User'); mongoose.connect(process.env.MONGODB_URI).then(async () => { const user = await User.findOne({email: 'investor@test.com'}); console.log(user ? '✅ User exists' : '❌ User not found'); process.exit(0); });"
```

---

## Important Notes

⚠️ **You don't actually need to add the user to the database** because the emergency bypass I created will allow login even without a database entry!

The emergency bypass works for:
- Mobile: `9876543210` / Password: `investor123`
- Email: `investor@test.com` / Password: `investor123`

**However**, adding the user to the database is recommended for:
- Testing real database authentication
- Having a persistent user for production
- Testing database-dependent features (profile, wallet, etc.)
