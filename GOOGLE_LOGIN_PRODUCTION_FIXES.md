# Google Login & Production Issues - Diagnostic & Fix Guide

## 📋 Current Status

### ✅ ORDER TRACKING - WORKING

- Order tracking is **already implemented** and accessible from the account page
- Each order in the account page has a "Track Order" button that links to `/order-tracking/[orderNumber]`
- Full order tracking system with real-time updates, courier integration, and timeline view

### ❌ GOOGLE LOGIN - NEEDS PRODUCTION FIX

The Google OAuth configuration is correct in the code but may have production environment issues.

### ❌ PRODUCT IMAGES - PARTIALLY FIXED

Product image handling is configured correctly, but some images may be missing.

---

## 🔧 FIXES IMPLEMENTED

### 1. Placeholder Images Created

Created missing placeholder images to prevent broken image errors:

- `/public/placeholder.png`
- `/public/placeholder.svg` 
- `/public/images/placeholder.jpg`

### 2. Next.js Image Configuration ✅

Already correctly configured in `next.config.js`:

```javascript
images: {
  remotePatterns: [
    { protocol: "https", hostname: "images.unsplash.com" },
    { protocol: "https", hostname: "plus.unsplash.com" },
    { protocol: "https", hostname: "res.cloudinary.com" },
    { protocol: "https", hostname: "mir-s3-cdn-cf.behance.net" },
    { protocol: "https", hostname: "rupomoti.com", pathname: "/images/**" },
    { protocol: "https", hostname: "rupomoti.vercel.app", pathname: "/images/**" },
    { protocol: "https", hostname: "developers.google.com" }
  ]
}
```

---

## 🚨 PRODUCTION CHECKLIST

### 1. Google OAuth Configuration

#### A. Verify Environment Variables

Check that these are set in your production environment (Vercel/hosting provider):

```bash
GOOGLE_CLIENT_ID="340102371641-uj74n18rrpbql3g8r6vqg2v5ha94mm9u.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="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"
NEXTAUTH_URL="https://rupomoti.com"
NEXTAUTH_SECRET="your-production-secret-here"
```

#### B. Google Cloud Console Settings

1. **Go to**: [Google Cloud Console](https://console.cloud.google.com/)
2. **Navigate to**: APIs & Services > Credentials
3. **Find your OAuth 2.0 Client ID**: `340102371641-uj74n18rrpbql3g8r6vqg2v5ha94mm9u`
4. **Verify Authorized domains**:
   - `rupomoti.com`
   - `www.rupomoti.com`
5. **Verify Authorized redirect URIs**:
   - `https://rupomoti.com/api/auth/callback/google`
   - `https://www.rupomoti.com/api/auth/callback/google`
6. **Verify Authorized JavaScript origins**:
   - `https://rupomoti.com`
   - `https://www.rupomoti.com`

#### C. Test Google Login

```bash
# Test the Google OAuth endpoint
curl "https://rupomoti.com/api/auth/providers"

# Should return providers including Google
```

### 2. Product Image Issues

#### A. Missing Images on Production

Check if these image directories exist and are properly deployed:

```bash
# Check if images exist
https://rupomoti.com/images/products/
https://rupomoti.com/placeholder.png
https://rupomoti.com/placeholder.svg
```

#### B. Verify Build Process

Ensure your build process copies all public files:

```bash
# If using Vercel, check vercel.json
{
  "functions": {
    "pages/api/upload.js": {
      "maxDuration": 30
    }
  },
  "public": true
}
```

#### C. Image Upload API

Test the image upload endpoint:

```bash
# Test upload endpoint
curl -X POST https://rupomoti.com/api/upload \
  -F "file=@test-image.jpg"
```

---

## 🔍 DEBUGGING STEPS

### 1. Google Login Debug

#### Check Auth Configuration

```javascript
// Add this temporary debug endpoint to test
// /pages/api/debug-auth.js
import { getProviders } from "next-auth/react"

export default async function handler(req, res) {
  const providers = await getProviders()
  res.json({
    providers,
    env: {
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Missing',
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Missing',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      NODE_ENV: process.env.NODE_ENV
    }
  })
}
```

#### Browser Debug

1. Open browser dev tools
2. Go to Network tab
3. Try Google login
4. Check for failed requests to `/api/auth/`
5. Look for CORS or 401/403 errors

### 2. Image Issues Debug

#### Check Image Loading

```javascript
// Add temporary image debug
// Check browser console for image load errors
document.querySelectorAll('img').forEach(img => {
  img.onerror = () => console.error('Failed to load:', img.src)
})
```

#### Verify Image URLs

```bash
# Check if images load directly
curl -I https://rupomoti.com/images/products/sample-image.jpg
curl -I https://cdn.prosystem.com.bd/images/AMISHEE/DSC09650c389a0c9-336b-4891-bba1-204a5dbd5468.jpg
```

---

## 🎯 PRIORITY FIXES

### HIGH PRIORITY

1. **Google OAuth**: Add correct environment variables to production
2. **Domain Authorization**: Update Google Cloud Console with correct domains
3. **Image Placeholders**: ✅ Already fixed - placeholders created

### MEDIUM PRIORITY  

1. **Image CDN**: Consider using a proper CDN for better image performance
2. **Error Handling**: Add better error handling for failed image loads
3. **SEO**: Add proper alt tags and image optimization

### LOW PRIORITY

1. **Image Compression**: Implement next/image optimization
2. **Loading States**: Add skeleton loaders for images
3. **Error Boundaries**: Add error boundaries for auth failures

---

## 📞 SUPPORT COMMANDS

### Check Production Logs

```bash
# Vercel logs
vercel logs rupomoti.com

# Or check your hosting provider's logs
```

### Test Environment Variables

```bash
# In production console/SSH
echo $GOOGLE_CLIENT_ID
echo $NEXTAUTH_URL
```

### Verify DNS and SSL

```bash
# Check DNS resolution
nslookup rupomoti.com

# Check SSL certificate
curl -I https://rupomoti.com
```

---

## 📈 SUCCESS INDICATORS

### Google Login Working

- [ ] Login button appears on signin page
- [ ] Clicking Google login redirects to Google
- [ ] After Google auth, user is redirected back and logged in
- [ ] User profile shows Google account info

### Images Loading Properly  

- [ ] Product cards show images (not placeholders)
- [ ] Product detail pages show all images
- [ ] Image gallery navigation works
- [ ] No broken image icons in browser

### Order Tracking Working ✅

- [x] "Track Order" buttons visible in account page
- [x] Order tracking page loads with order details
- [x] Real-time tracking information displays
- [x] Courier integration shows tracking updates

---

## 🚀 NEXT STEPS

1. **Deploy placeholder images** (✅ Complete)
2. **Check production environment variables**
3. **Update Google Cloud Console settings**  
4. **Test Google login on live site**
5. **Verify all images load correctly**
6. **Monitor error logs for any remaining issues**

The order tracking system is already fully functional and accessible from the customer account page!
