# Deploy Frontend to Vercel

## Prerequisites
- GitHub account
- Vercel account (free): https://vercel.com

## Step 1: Push Latest Code to GitHub

```bash
cd "d:\Freelancing projects\BCM"
git add .
git commit -m "Add production environment files for frontend deployment"
git push origin main
```

## Step 2: Deploy Admin Web to Vercel

### A. Via Vercel Dashboard (Easiest)

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your `bcm` repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `admin-web`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add Environment Variable:
   - Key: `VITE_API_URL`
   - Value: `https://bcm-6f7f.onrender.com/api`
6. Click "Deploy"

### B. Via Vercel CLI (Alternative)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy admin-web
cd "d:\Freelancing projects\BCM\admin-web"
vercel --prod

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? bcm-admin
# - Directory? ./
# - Override settings? No
```

## Step 3: Deploy Business Web to Vercel

Repeat the same process for business-web:

### Via Dashboard:
1. Go to https://vercel.com/new
2. Import same repository
3. Configure:
   - **Root Directory**: `business-web`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Environment Variable:
   - `VITE_API_URL=https://bcm-6f7f.onrender.com/api`
5. Deploy

### Via CLI:
```bash
cd "d:\Freelancing projects\BCM\business-web"
vercel --prod
```

## Step 4: Update Backend CORS

After deployment, you'll get URLs like:
- Admin: `https://bcm-admin-xyz.vercel.app`
- Business: `https://bcm-business-xyz.vercel.app`

Update backend CORS to allow these origins:

Edit `backend/server.js`:

```javascript
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? [
            'https://bcm-admin-xyz.vercel.app',
            'https://bcm-business-xyz.vercel.app'
          ]
        : true,
    credentials: true
}));
```

Then redeploy backend on Render.

## Step 5: Test Deployments

### Admin Web:
1. Visit your Vercel URL
2. Try logging in with: `business@test.com` / `business123`

### Business Web:
1. Visit your Vercel URL
2. Try logging in with: `business@test.com` / `business123`

## Troubleshooting

### Issue: "Network Error" or CORS Error

**Solution**: Make sure backend CORS includes your Vercel URLs

### Issue: "API URL not found"

**Solution**: Check environment variable is set in Vercel:
1. Go to Vercel Dashboard → Your Project → Settings
2. Environment Variables
3. Add `VITE_API_URL=https://bcm-6f7f.onrender.com/api`
4. Redeploy

### Issue: Build fails

**Solution**: Check build logs in Vercel dashboard

Common fixes:
- Make sure `package.json` has correct scripts
- Check all dependencies are in `package.json`
- Verify Node version compatibility

## Alternative: Deploy to Render

If you prefer Render (same platform as backend):

1. Go to Render Dashboard
2. New → Static Site
3. Connect GitHub repository
4. Configure:
   - **Root Directory**: `admin-web` (or `business-web`)
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
5. Environment Variables:
   - `VITE_API_URL=https://bcm-6f7f.onrender.com/api`
6. Create Static Site

## Summary

After deployment, you'll have:

- ✅ **Backend**: https://bcm-6f7f.onrender.com
- ✅ **Admin Web**: https://bcm-admin-xyz.vercel.app
- ✅ **Business Web**: https://bcm-business-xyz.vercel.app
- ✅ **Mobile App**: APK for Android

All connected and working together! 🚀
