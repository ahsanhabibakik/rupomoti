// Fix for production issues

// 1. Google OAuth Configuration
// You need to update your Google Cloud Console OAuth settings:
// Go to: https://console.cloud.google.com/apis/credentials
// Select your OAuth 2.0 Client ID
// Add these authorized redirect URIs:
// - https://rupomoti.com/api/auth/callback/google
// - https://www.rupomoti.com/api/auth/callback/google (as backup)

// 2. Environment Variables
// Make sure your production deployment (Vercel/etc.) uses these environment variables:

const productionEnvVars = {
  // NextAuth - CRITICAL
  NEXTAUTH_URL: "https://rupomoti.com",
  NEXTAUTH_SECRET: "Q7z9f8mHBKwP6R2VjpThcFMsYAYa5nKM",
  
  // Google OAuth
  GOOGLE_CLIENT_ID: "340102371641-uj74n18rrpbql3g8r6vqg2v5ha94mm9u.apps.googleusercontent.com",
  GOOGLE_CLIENT_SECRET: "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",
  
  // Database
  DATABASE_URL: "mongodb+srv://rupomotibusiness:pGhePonAlcVB3sf0@cluster0.p0tpuuo.mongodb.net/rupomoti?retryWrites=true&w=majority",
  
  // Cloudinary
  CLOUDINARY_URL: "cloudinary://258755974622473:Yi_5MEKzk4uf0UkNj9g7ZwLJzjg@dotinshdj",
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: "dotinshdj",
  NEXT_PUBLIC_CLOUDINARY_API_KEY: "258755974622473",
  NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET: "rupomoti_uploads",
  
  // Node Environment
  NODE_ENV: "production"
}

// 3. Steps to fix Google OAuth:
// a) Go to Google Cloud Console
// b) Navigate to APIs & Services > Credentials
// c) Find your OAuth 2.0 Client ID
// d) Edit it and add these Authorized redirect URIs:
//    - https://rupomoti.com/api/auth/callback/google
//    - https://www.rupomoti.com/api/auth/callback/google
// e) Save the changes

console.log("🔧 Production Fix Instructions:")
console.log("1. Update Google OAuth redirect URIs in Google Cloud Console")
console.log("2. Ensure production environment variables are set correctly")
console.log("3. Environment variables needed:", productionEnvVars)

export default productionEnvVars
