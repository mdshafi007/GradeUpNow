# 🚀 Vercel Deployment Guide for GradeUpNow

## 📋 Prerequisites
- Vercel account (free tier works fine)
- GitHub repository connected to Vercel
- Supabase project running (already configured)

---

## 🎯 Quick Deployment Steps

### 1️⃣ Push to GitHub
Make sure your code is pushed to your GitHub repository.

### 2️⃣ Import to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import your GitHub repository: `mdshafi007/GradeUpNow`
4. Select the **`GradeUpNow`** folder as the root directory

### 3️⃣ Configure Build Settings
Vercel should auto-detect these settings (already configured in `vercel.json`):
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`
- **Root Directory**: `GradeUpNow`

### 4️⃣ Add Environment Variables
In Vercel Dashboard → Project Settings → Environment Variables, add these:

```bash
# Judge0 API Configuration
VITE_JUDGE0_API_KEY=2c3d611c5cmsh6cf91b87ec1d26fp1ab0b7jsn64a79d6e6df1
VITE_JUDGE0_BASE_URL=https://judge0-ce.p.rapidapi.com

# Supabase Configuration
VITE_SUPABASE_URL=https://tcobiacixzusarqtphwy.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjb2JpYWNpeHp1c2FycXRwaHd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxNjEyOTgsImV4cCI6MjA3NTczNzI5OH0.XCoMuPhYu8zWCSTGIEdVkJqrFjpMym6GwCYMLqSlo3g
```

> **Note**: Remove `VITE_API_BASE_URL` - it's only needed for local backend development

### 5️⃣ Deploy!
Click **"Deploy"** and wait for Vercel to build and deploy your site.

---

## 🌐 What Gets Deployed

✅ **Public Website** - All public-facing pages
- Home page
- Courses
- Practice tests
- Notes
- Authentication pages

✅ **Supabase Integration** - Database & Auth
- All database queries work via Supabase
- User authentication
- Data storage

❌ **Backend Folder** - NOT deployed (excluded via `.vercelignore`)
- Your LMS backend stays separate
- Admin and college portal features continue working as before

---

## 🔧 Post-Deployment

### Update CORS in Supabase (if needed)
1. Go to Supabase Dashboard
2. Navigate to Settings → API
3. Add your Vercel domain to allowed origins:
   - `https://your-project.vercel.app`
   - `https://*.vercel.app` (for preview deployments)

### Custom Domain (Optional)
1. In Vercel Dashboard → Project Settings → Domains
2. Add your custom domain
3. Follow Vercel's DNS configuration instructions

---

## 📊 Deployment Features

✨ **Automatic Deployments**
- Every push to `main` branch triggers a production deployment
- Preview deployments for pull requests

⚡ **Edge Network**
- Global CDN for fast loading worldwide
- Automatic SSL/HTTPS

🔄 **Rollback Support**
- Easy rollback to any previous deployment
- Zero-downtime deployments

---

## 🐛 Troubleshooting

### Build Fails
- Check environment variables are set correctly
- Ensure all dependencies in `package.json` are correct
- Check build logs in Vercel dashboard

### Routes Not Working (404 errors)
- Already handled by `vercel.json` rewrites
- All routes redirect to `index.html` for React Router

### API Calls Failing
- Verify Supabase URL and anon key are correct
- Check CORS settings in Supabase
- Ensure environment variables have `VITE_` prefix

---

## 📱 Testing Deployment

After deployment, test these pages:
1. ✅ Home page - `https://your-project.vercel.app/`
2. ✅ Login - `https://your-project.vercel.app/login`
3. ✅ Signup - `https://your-project.vercel.app/signup`
4. ✅ Courses - `https://your-project.vercel.app/courses`
5. ✅ Practice - `https://your-project.vercel.app/practice`
6. ✅ Notes - `https://your-project.vercel.app/notes`

---

## 🎉 Done!

Your GradeUpNow public site is now live on Vercel! 

**What's Working:**
- ✅ Fast global delivery
- ✅ Automatic HTTPS
- ✅ Supabase integration
- ✅ All public features
- ✅ SPA routing

**What's Separate:**
- 🔒 LMS backend (stays on your current setup)
- 🔒 Admin portal (not affected)
- 🔒 College portal (not affected)

---

## 🔗 Useful Links
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Vercel Documentation](https://vercel.com/docs)
- [Vite on Vercel](https://vercel.com/docs/frameworks/vite)
