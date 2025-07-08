# 🚨 Production Deployment Issues - Troubleshooting Guide

## Issues Identified:
1. **NEXTAUTH_URL** pointing to localhost instead of production domain
2. **Environment variables** may not be set correctly in production
3. **Database connection** may be failing in production
4. **Google OAuth** redirect URIs not configured for production domain

## 🔧 **IMMEDIATE FIXES NEEDED:**

### 1. Fix Environment Variables in Production

**For Vercel Deployment:**
```bash
# Set these in Vercel Dashboard (vercel.com) > Your Project > Settings > Environment Variables
DATABASE_URL=mongodb+srv://rupomotibusiness:pGhePonAlcVB3sf0@cluster0.p0tpuuo.mongodb.net/rupomoti?retryWrites=true&w=majority
NEXTAUTH_URL=https://rupamuti.com
NEXTAUTH_SECRET=Q7z9f8mHBKwP6R2VjpThcFMsYAYa5nKM
GOOGLE_CLIENT_ID=340102371641-uj74n18rrpbql3g8r6vqg2v5ha94mm9u.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dotinshdj
NEXT_PUBLIC_CLOUDINARY_API_KEY=258755974622473
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=rupomoti_uploads
```

### 2. Fix Google OAuth Configuration

**Go to Google Cloud Console:**
1. Visit: https://console.cloud.google.com/apis/credentials
2. Find your OAuth 2.0 Client ID: `340102371641-uj74n18rrpbql3g8r6vqg2v5ha94mm9u.apps.googleusercontent.com`
3. Edit the client
4. Add these Authorized redirect URIs:
   - `https://rupamuti.com/api/auth/callback/google`
   - `http://localhost:3000/api/auth/callback/google` (for local development)
5. Add these Authorized JavaScript origins:
   - `https://rupamuti.com`
   - `http://localhost:3000` (for local development)

### 3. Test Production Database Connection

**Run this command to test your production deployment:**
```bash
# Visit this URL after deployment:
https://rupamuti.com/api/health?data=true
```

This will show you:
- Database connection status
- Product counts
- Environment variable status
- Sample product data

### 4. Debug Steps

**Step 1: Check Environment Variables**
```bash
# Add this to your production deployment logs
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL)
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL)
```

**Step 2: Test API Endpoints Directly**
```bash
# Test these URLs in production:
https://rupamuti.com/api/products?limit=5
https://rupamuti.com/api/categories
https://rupamuti.com/api/health
```

**Step 3: Check Network Tab**
1. Open browser DevTools (F12)
2. Go to Network tab
3. Visit https://rupamuti.com
4. Look for failed API calls (red entries)
5. Check if any 500 errors or CORS issues

### 5. Common Production Issues

**Issue A: Database Connection Timeout**
- MongoDB Atlas IP whitelist: Add `0.0.0.0/0` (allow all IPs)
- Or add your hosting provider's IP ranges

**Issue B: Environment Variables Not Loaded**
- Redeploy after setting environment variables
- Check hosting platform's environment variable UI

**Issue C: CORS/Auth Issues**
- Ensure NEXTAUTH_URL matches your production domain exactly
- No trailing slashes in URLs

### 6. Quick Production Fix Commands

**For Vercel (if using Vercel):**
```bash
# Redeploy with environment variables
vercel --prod
vercel env pull .env.production.local
```

**For other platforms:**
```bash
# Build with production environment
NODE_ENV=production pnpm build
```

## 🔍 **DEBUGGING COMMANDS:**

**1. Test Database Locally with Production Data:**
```bash
# Use production database URL locally
NEXT_PUBLIC_FORCE_ENV=production pnpm dev
```

**2. Run Production Diagnostics:**
```bash
pnpm exec tsx scripts/diagnose-production.ts
```

**3. Check Build Output:**
```bash
pnpm build
# Check for any build errors
```

## 📋 **VERIFICATION CHECKLIST:**

- [ ] Set `NEXTAUTH_URL=https://rupamuti.com` in production
- [ ] All environment variables set in hosting platform
- [ ] Google OAuth redirect URIs include production domain  
- [ ] MongoDB Atlas allows connections from hosting IPs
- [ ] `/api/health` endpoint returns success
- [ ] `/api/products` endpoint returns data
- [ ] No JavaScript errors in browser console
- [ ] Authentication works on production site

## 🚀 **DEPLOYMENT STEPS:**

1. **Set Environment Variables** in your hosting platform
2. **Update Google OAuth** redirect URIs
3. **Redeploy** your application
4. **Test** the `/api/health` endpoint
5. **Verify** products are loading on homepage

---

**Need Help?** 
1. Check the `/api/health?data=true` endpoint first
2. Look at browser DevTools Network tab for failed requests
3. Check hosting platform logs for errors
