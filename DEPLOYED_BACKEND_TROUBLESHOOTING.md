# Deployed Backend Troubleshooting

## Issue: "route not found" on deployed backend

### Quick Tests

Try these URLs in your browser:

1. **Health Check:**
   ```
   https://bcm-6f7f.onrender.com/health
   ```
   **Expected:** `{"success":true,"message":"BCM Backend API is running",...}`

2. **Root URL:**
   ```
   https://bcm-6f7f.onrender.com/
   ```
   **Expected:** `{"success":false,"message":"route not found"}` (this is normal)

3. **Login Endpoint (GET - will fail but shows route exists):**
   ```
   https://bcm-6f7f.onrender.com/api/auth/login
   ```
   **Expected:** `{"success":false,"message":"Email/Mobile and password are required"}`
   OR `Cannot GET /api/auth/login`

### Common Issues

#### Issue 1: Routes Not Loaded
**Symptom:** All URLs show "route not found"
**Solution:** Check Render logs for errors during deployment

#### Issue 2: Missing Environment Variables
**Symptom:** Server crashes or routes don't work
**Solution:** 
1. Go to Render Dashboard
2. Select your service
3. Go to "Environment" tab
4. Add these variables:
   - `MONGODB_URI` = your MongoDB connection string
   - `JWT_SECRET` = your secret key
   - `NODE_ENV` = production
   - `PORT` = 5000

#### Issue 3: Wrong Start Command
**Symptom:** Server doesn't start
**Solution:** 
1. In Render Dashboard → Settings
2. Build Command: `npm install`
3. Start Command: `node server.js`

#### Issue 4: Old Code Deployed
**Symptom:** Emergency bypass doesn't work
**Solution:** Redeploy latest code

### Test Login with curl

```bash
curl -X POST https://bcm-6f7f.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"mobile":"9876543210","password":"investor123"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful (Bypass)",
  "token": "...",
  "user": {...}
}
```

### Check Render Logs

1. Go to Render Dashboard
2. Select your service
3. Click "Logs" tab
4. Look for errors

Common errors:
- `Cannot find module` → Missing dependencies
- `MongoDB connection failed` → Wrong MONGODB_URI
- `Port already in use` → Wrong port configuration

### Redeploy Steps

If you need to redeploy:

1. **Push latest code to GitHub:**
   ```bash
   cd "d:\Freelancing projects\BCM"
   git add .
   git commit -m "Fix: Updated backend with emergency bypass and correct routes"
   git push origin main
   ```

2. **Trigger Render deployment:**
   - Go to Render Dashboard
   - Click "Manual Deploy" → "Deploy latest commit"
   - Wait for deployment to complete (5-10 minutes)

3. **Verify deployment:**
   - Check logs for "Server running on port 5000"
   - Test `/health` endpoint
   - Test `/api/auth/login` endpoint

### Environment Variables Checklist

Make sure these are set in Render:

- ✅ `MONGODB_URI` - Your MongoDB Atlas connection string
- ✅ `JWT_SECRET` - Random string (min 32 characters)
- ✅ `NODE_ENV` - Set to `production`
- ✅ `PORT` - Set to `5000` (or leave empty, Render sets this automatically)

### Quick Fix: Test Locally First

Before debugging production, verify the code works locally:

```bash
cd "d:\Freelancing projects\BCM\backend"
node server.js
```

Then test:
```bash
node test-login-simple.js
```

If local works but production doesn't, it's a deployment configuration issue.
