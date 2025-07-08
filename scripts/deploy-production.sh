#!/bin/bash

# 🚀 Production Deployment Fix Script
# This script will help you deploy to production with correct environment variables

echo "🚀 Starting Production Deployment Fix..."
echo ""

# Check if we're using Vercel
if command -v vercel &> /dev/null; then
    echo "📦 Vercel CLI detected. Setting up Vercel deployment..."
    
    # Set environment variables in Vercel
    echo "🔧 Setting Vercel environment variables..."
    
    vercel env add DATABASE_URL "mongodb+srv://rupomotibusiness:pGhePonAlcVB3sf0@cluster0.p0tpuuo.mongodb.net/rupomoti?retryWrites=true&w=majority" production
    vercel env add NEXTAUTH_URL "https://rupamuti.com" production
    vercel env add NEXTAUTH_SECRET "Q7z9f8mHBKwP6R2VjpThcFMsYAYa5nKM" production
    vercel env add GOOGLE_CLIENT_ID "340102371641-uj74n18rrpbql3g8r6vqg2v5ha94mm9u.apps.googleusercontent.com" production
    vercel env add GOOGLE_CLIENT_SECRET "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" production
    vercel env add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME "dotinshdj" production
    vercel env add NEXT_PUBLIC_CLOUDINARY_API_KEY "258755974622473" production
    vercel env add NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET "rupomoti_uploads" production
    
    echo "✅ Environment variables set in Vercel"
    
    # Deploy to production
    echo "🚀 Deploying to production..."
    vercel --prod
    
    echo "✅ Deployment complete!"
    echo ""
    echo "🔍 Test your deployment:"
    echo "1. Visit: https://rupamuti.com/api/health?data=true"
    echo "2. Check homepage: https://rupamuti.com"
    echo "3. Test login: https://rupamuti.com/signin"
    
else
    echo "⚠️ Vercel CLI not found. Please install it:"
    echo "npm i -g vercel"
    echo ""
    echo "Or manually set these environment variables in your hosting platform:"
    echo ""
    echo "DATABASE_URL=mongodb+srv://rupomotibusiness:pGhePonAlcVB3sf0@cluster0.p0tpuuo.mongodb.net/rupomoti?retryWrites=true&w=majority"
    echo "NEXTAUTH_URL=https://rupamuti.com"
    echo "NEXTAUTH_SECRET=Q7z9f8mHBKwP6R2VjpThcFMsYAYa5nKM"
    echo "GOOGLE_CLIENT_ID=340102371641-uj74n18rrpbql3g8r6vqg2v5ha94mm9u.apps.googleusercontent.com"
    echo "GOOGLE_CLIENT_SECRET=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"
    echo "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dotinshdj"
    echo "NEXT_PUBLIC_CLOUDINARY_API_KEY=258755974622473"
    echo "NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=rupomoti_uploads"
fi

echo ""
echo "📋 Don't forget to update Google OAuth:"
echo "1. Go to: https://console.cloud.google.com/apis/credentials"
echo "2. Edit OAuth 2.0 Client ID: 340102371641-uj74n18rrpbql3g8r6vqg2v5ha94mm9u.apps.googleusercontent.com"
echo "3. Add authorized redirect URI: https://rupamuti.com/api/auth/callback/google"
echo "4. Add authorized JavaScript origin: https://rupamuti.com"
echo ""
echo "🎉 Production deployment should now work!"
