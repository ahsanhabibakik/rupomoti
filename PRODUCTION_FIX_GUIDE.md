# 🚨 PRODUCTION DEPLOYMENT ISSUES - COMPLETE SOLUTION

## **SUMMARY OF PROBLEMS:**

✅ **Local Development:** Working perfectly (266 products, 15 categories, authentication works)  
❌ **Production (rupomoti.com):** Not working (products not showing, authentication fails)

---

## 🔧 **STEP-BY-STEP SOLUTION:**

### **STEP 1: Verify Your Production Domain**

First, let's confirm your actual production URL:
- Is it `https://rupamuti.com` or `https://www.rupamuti.com`?
- Is it deployed on Vercel, Netlify, or another platform?

### **STEP 2: Fix Environment Variables**

**The main issue is likely `NEXTAUTH_URL` pointing to localhost instead of your production domain.**

**For Vercel (recommended):**
1. Go to https://vercel.com/dashboard
2. Find your project
3. Go to Settings → Environment Variables
4. Add these variables for "Production":

```bash
DATABASE_URL=mongodb+srv://rupomotibusiness:pGhePonAlcVB3sf0@cluster0.p0tpuuo.mongodb.net/rupomoti?retryWrites=true&w=majority
NEXTAUTH_URL=https://rupamuti.com
NEXTAUTH_SECRET=Q7z9f8mHBKwP6R2VjpThcFMsYAYa5nKM
GOOGLE_CLIENT_ID=340102371641-uj74n18rrpbql3g8r6vqg2v5ha94mm9u.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dotinshdj
NEXT_PUBLIC_CLOUDINARY_API_KEY=258755974622473
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=rupomoti_uploads
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=delwerhossain006@gmail.com
SMTP_PASS=lbgg keeb mlhg mtbt
SMTP_FROM_NAME=Rupomoti
SMTP_FROM_EMAIL=delwerhossain006@gmail.com
SMTP_SECURE=false
```

### **STEP 3: Fix Google OAuth**

1. Go to https://console.cloud.google.com/apis/credentials
2. Find your OAuth 2.0 Client ID: `340102371641-uj74n18rrpbql3g8r6vqg2v5ha94mm9u.apps.googleusercontent.com`
3. Click "Edit"
4. Under "Authorized redirect URIs", add:
   - `https://rupamuti.com/api/auth/callback/google`
   - `https://www.rupamuti.com/api/auth/callback/google` (if using www)
5. Under "Authorized JavaScript origins", add:
   - `https://rupamuti.com`
   - `https://www.rupamuti.com` (if using www)
6. Save changes

### **STEP 4: MongoDB Atlas Network Access**

1. Go to https://cloud.mongodb.com
2. Navigate to Network Access
3. Add IP Address: `0.0.0.0/0` (Allow access from anywhere)
   - This allows your hosting platform to connect to MongoDB

### **STEP 5: Deploy/Redeploy Your Application**

**If using Vercel:**
```bash
# Install Vercel CLI if not installed
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

**If using other platforms:**
- Redeploy your application after setting environment variables
- Ensure the build completes successfully

### **STEP 6: Test Your Deployment**

After deployment, test these URLs:

1. **Health Check:** `https://rupamuti.com/api/health?data=true`
   - Should show database status and product counts

2. **Products API:** `https://rupamuti.com/api/products?limit=5`
   - Should return product data

3. **Homepage:** `https://rupamuti.com`
   - Should show products

4. **Authentication:** `https://rupamuti.com/signin`
   - Should allow Google login

---

## 🔍 **DEBUGGING COMMANDS:**

### **Check Your Current Deployment:**

```bash
# If using Vercel, check deployment status
vercel ls

# Check environment variables
vercel env ls

# View deployment logs
vercel logs [deployment-url]
```

### **Test Production Locally:**

```bash
# Use production environment variables locally
cp .env.production .env.local.backup
NODE_ENV=production NEXTAUTH_URL=https://rupamuti.com pnpm dev
```

---

## 📋 **VERIFICATION CHECKLIST:**

### **Environment Variables (Production):**
- [ ] `NEXTAUTH_URL` set to `https://rupamuti.com` (NOT localhost)
- [ ] `DATABASE_URL` pointing to correct MongoDB cluster
- [ ] All Cloudinary variables set
- [ ] Google OAuth credentials set

### **External Services:**
- [ ] Google OAuth redirect URIs include production domain
- [ ] MongoDB Atlas allows connections from hosting IPs
- [ ] Domain DNS pointing to hosting platform

### **Testing:**
- [ ] `/api/health` returns success
- [ ] `/api/products` returns product data
- [ ] Homepage shows products
- [ ] Authentication works

---

## 🚨 **COMMON ISSUES & FIXES:**

### **Issue 1: NEXTAUTH_URL Mismatch**
**Symptoms:** Authentication fails, redirects to localhost
**Fix:** Set `NEXTAUTH_URL=https://rupamuti.com` in production environment

### **Issue 2: Database Connection Failed**
**Symptoms:** API endpoints return 500 errors
**Fix:** Add `0.0.0.0/0` to MongoDB Atlas Network Access

### **Issue 3: Environment Variables Not Loaded**
**Symptoms:** APIs work locally but fail in production
**Fix:** Ensure all env vars are set in hosting platform, then redeploy

### **Issue 4: Build Failures**
**Symptoms:** Deployment fails during build
**Fix:** Run `pnpm build` locally to identify and fix build errors

---

## 🎯 **IMMEDIATE ACTION PLAN:**

1. **RIGHT NOW:** Check if `https://rupamuti.com` loads at all
   - If it doesn't load: DNS/deployment issue
   - If it loads but shows errors: Environment variable issue

2. **SET ENVIRONMENT VARIABLES:** 
   - In your hosting platform (Vercel/Netlify/etc.)
   - Most important: `NEXTAUTH_URL=https://rupamuti.com`

3. **REDEPLOY:** 
   - After setting environment variables
   - Wait for deployment to complete

4. **TEST:** 
   - Visit `https://rupamuti.com/api/health?data=true`
   - Should show product counts and database status

5. **UPDATE GOOGLE OAUTH:** 
   - Add production domain to redirect URIs

---

**Need immediate help?** Share:
1. What hosting platform you're using (Vercel/Netlify/other)
2. The exact URL of your production site
3. Any error messages from deployment logs
