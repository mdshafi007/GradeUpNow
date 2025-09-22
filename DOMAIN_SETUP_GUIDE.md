# 🌐 Custom Domain Setup Guide for gradeupnow.app

## ✅ Completed Automatically
- ✅ Updated backend CORS to allow `gradeupnow.app`
- ✅ Updated environment configurations  
- ✅ Pushed changes to trigger auto-deployment
- ✅ Backend will now accept requests from your new domain

## 🔧 Manual Steps You Need to Complete

### 1. 📋 Update Render Environment Variables
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Find your `GradeUpNow` backend service
3. Go to **Environment** tab
4. Add/Update these variables:
   ```
   FRONTEND_URL=https://gradeupnow.app
   CORS_ORIGIN=https://gradeupnow.app
   ```
5. Click **Save Changes** (this will redeploy automatically)

### 2. 🔗 Setup Custom Domain on Netlify
1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Find your `GradeUpNow` site
3. Go to **Site Settings** → **Domain Management**
4. Click **Add Custom Domain**
5. Enter: `gradeupnow.app`
6. Follow Netlify's instructions to:
   - Verify domain ownership
   - Configure DNS records with your domain provider
   - Setup SSL certificate (automatic)

### 3. 🌍 DNS Configuration
**At your domain registrar (where you bought gradeupnow.app):**

Add these DNS records:
```
Type: CNAME
Name: www
Value: [your-netlify-subdomain].netlify.app

Type: A (if apex domain)
Name: @
Value: [Netlify's IP addresses - they'll provide these]
```

**OR use Netlify DNS (Recommended):**
1. In Netlify, go to **Domains** → **DNS Panel**
2. Copy the nameservers provided
3. Update your domain's nameservers at your registrar

### 4. 🔒 SSL Certificate
- Netlify will automatically provision SSL certificate
- May take 10-60 minutes to activate
- Check in Netlify: **Domain Settings** → **HTTPS**

## 🧪 Testing After Setup
1. Wait for Render deployment to complete (~5 minutes)
2. Wait for Netlify domain propagation (~10-60 minutes)
3. Test these URLs:
   - ✅ `https://gradeupnow.app` (your frontend)
   - ✅ `https://gradeupnow.app/practice` (quiz page)
   - ✅ Backend API calls should work without CORS errors

## 🚨 Troubleshooting
- **CORS errors**: Check Render environment variables are set correctly
- **SSL errors**: Wait for certificate provisioning to complete
- **DNS errors**: DNS propagation can take up to 48 hours globally
- **502/503 errors**: Check if Render service is running properly

## 📞 Need Help?
- Check Render deployment logs for backend issues
- Check Netlify deploy logs for frontend issues
- Verify DNS propagation: `nslookup gradeupnow.app`