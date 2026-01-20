# BCM Platform - Deployment Guide

## 🚀 Production Deployment

### Prerequisites

- GitHub account
- Supabase account (database)
- Render account (backend)
- Netlify account (frontend)

---

## 1. Database Deployment (Supabase)

### Setup

1. Create Supabase project at https://supabase.com
2. Go to **SQL Editor**
3. Run `backend/database/schema.sql`
4. Run `backend/database/seed.sql`

### Configure Storage

1. Go to **Storage** → Create buckets:
   - `profile-photos`
   - `business-logos`
   - `documents`
   - `payment-screenshots`

2. Set bucket policies (make them public or authenticated based on needs)

### Configure Authentication

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Enable **Google** provider (optional):
   - Add Google OAuth credentials
   - Configure redirect URLs

### Get Credentials

Go to **Settings** → **API**:
- Copy **Project URL**
- Copy **anon public** key
- Copy **service_role** secret key

✅ Database ready!

---

## 2. Backend Deployment (Render)

### Prepare Repository

1. Push code to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/bcm-platform.git
git push -u origin main
```

### Deploy on Render

1. Go to https://render.com
2. Click **New** → **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name**: bcm-backend
   - **Environment**: Node
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && node server.js`
   - **Instance Type**: Free (for testing) or Starter

### Environment Variables

Add these in Render dashboard:

```
PORT=5000
NODE_ENV=production

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

JWT_SECRET=your-production-secret-key-min-32-chars

ADMIN_COMMISSION_PERCENT=2

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

ADMIN_WEB_URL=https://your-admin.netlify.app
BUSINESS_WEB_URL=https://your-business.netlify.app
```

### Deploy

1. Click **Create Web Service**
2. Wait for deployment (5-10 minutes)
3. Note your backend URL: `https://bcm-backend.onrender.com`

### Test Backend

```bash
curl https://bcm-backend.onrender.com/health
```

Should return:
```json
{
  "success": true,
  "message": "BCM Backend API is running"
}
```

✅ Backend deployed!

---

## 3. Admin Web App Deployment (Netlify)

### Build the App

```bash
cd admin-web
```

Update `.env`:
```env
VITE_API_URL=https://bcm-backend.onrender.com/api
```

Build:
```bash
npm install
npm run build
```

### Deploy to Netlify

#### Option A: Netlify CLI

```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir=dist
```

#### Option B: Netlify Dashboard

1. Go to https://netlify.com
2. Click **Add new site** → **Deploy manually**
3. Drag and drop the `dist` folder
4. Configure:
   - **Site name**: bcm-admin
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

### Environment Variables

In Netlify dashboard → **Site settings** → **Environment variables**:

```
VITE_API_URL=https://bcm-backend.onrender.com/api
```

### Configure Redirects

Create `admin-web/public/_redirects`:
```
/*    /index.html   200
```

This enables client-side routing.

### Redeploy

If using Git:
1. Connect GitHub repository
2. Set build command: `cd admin-web && npm install && npm run build`
3. Set publish directory: `admin-web/dist`
4. Auto-deploy on push

✅ Admin web app deployed!

---

## 4. Business Web App Deployment

Follow same steps as Admin Web App:

1. Build the app
2. Update API URL
3. Deploy to Netlify
4. Configure environment variables

---

## 5. Post-Deployment Configuration

### Update CORS

In backend `.env` on Render:
```env
ADMIN_WEB_URL=https://bcm-admin.netlify.app
BUSINESS_WEB_URL=https://bcm-business.netlify.app
```

### Test Email

Configure SMTP or use Supabase email:
1. Supabase → **Authentication** → **Email Templates**
2. Customize templates
3. Test email sending

### Enable Automation

Automation services (EMI, FD maturity, etc.) run automatically in production mode.

Verify in Render logs:
```
✓ Automation services started
```

### Monitor Logs

- **Backend**: Render dashboard → Logs
- **Database**: Supabase → Logs
- **Frontend**: Netlify → Functions → Logs

---

## 6. Custom Domain (Optional)

### Backend (Render)

1. Render → Settings → Custom Domain
2. Add domain: `api.yourdomain.com`
3. Update DNS records as instructed

### Frontend (Netlify)

1. Netlify → Domain settings → Add custom domain
2. Add domain: `admin.yourdomain.com`
3. Enable HTTPS (automatic)

---

## 7. Security Checklist

- [ ] Change default admin password
- [ ] Use strong JWT_SECRET (min 32 characters)
- [ ] Enable HTTPS (automatic on Render/Netlify)
- [ ] Configure CORS properly
- [ ] Set up rate limiting (add to backend)
- [ ] Enable Supabase RLS policies
- [ ] Rotate API keys regularly
- [ ] Set up monitoring (Sentry, LogRocket)
- [ ] Configure backup strategy

---

## 8. Monitoring & Maintenance

### Health Checks

Set up monitoring:
- **UptimeRobot**: Monitor API uptime
- **Sentry**: Error tracking
- **LogRocket**: Session replay

### Backup Strategy

1. **Database**: Supabase auto-backups (paid plan)
2. **Manual backups**: Export SQL weekly
3. **Code**: GitHub repository

### Performance

- Monitor Render metrics
- Check Supabase query performance
- Optimize slow API endpoints
- Add caching where needed

---

## 9. Scaling Considerations

### When to Scale

- Backend response time > 1s
- Database queries > 100ms
- Concurrent users > 100

### Scaling Options

1. **Backend**: Upgrade Render instance
2. **Database**: Upgrade Supabase plan
3. **Caching**: Add Redis (Render Redis)
4. **CDN**: Use Cloudflare for static assets
5. **Load Balancing**: Multiple backend instances

---

## 10. Troubleshooting

### Backend not responding

1. Check Render logs
2. Verify environment variables
3. Test database connection
4. Check Supabase status

### Frontend shows network error

1. Verify VITE_API_URL is correct
2. Check CORS settings
3. Test API endpoint directly
4. Check browser console

### Database connection fails

1. Verify Supabase credentials
2. Check connection pooling
3. Review Supabase logs
4. Test with SQL editor

### Automation not running

1. Verify NODE_ENV=production
2. Check Render logs for cron job execution
3. Test cron schedule syntax
4. Monitor email notifications

---

## 📊 Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Environment variables documented
- [ ] Database schema finalized
- [ ] API endpoints tested
- [ ] Security review completed

### Deployment
- [ ] Database deployed (Supabase)
- [ ] Backend deployed (Render)
- [ ] Admin web deployed (Netlify)
- [ ] Business web deployed (Netlify)
- [ ] Environment variables configured

### Post-Deployment
- [ ] Health check passing
- [ ] Admin login working
- [ ] Payment flow tested
- [ ] Email notifications working
- [ ] Automation jobs running
- [ ] Monitoring configured
- [ ] Backup strategy in place

---

## 🎯 Production URLs

After deployment, you'll have:

- **Backend API**: `https://bcm-backend.onrender.com`
- **Admin Panel**: `https://bcm-admin.netlify.app`
- **Business Portal**: `https://bcm-business.netlify.app`
- **Database**: `https://your-project.supabase.co`

---

## 💡 Cost Estimate (Monthly)

- **Supabase Free**: $0 (up to 500MB database, 2GB bandwidth)
- **Render Free**: $0 (sleeps after 15 min inactivity)
- **Netlify Free**: $0 (100GB bandwidth)

**Total**: $0/month for MVP testing

### Paid Plans (Production)

- **Supabase Pro**: $25/month
- **Render Starter**: $7/month
- **Netlify Pro**: $19/month

**Total**: ~$51/month for production

---

## 🆘 Support

For deployment issues:
1. Check service status pages
2. Review deployment logs
3. Test locally first
4. Contact support if needed

---

**Happy Deploying! 🚀**
