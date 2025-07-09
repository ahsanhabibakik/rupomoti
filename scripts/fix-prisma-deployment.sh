#!/bin/bash

# Script to fix Prisma deployment issues for Vercel
echo "🔧 Fixing Prisma deployment configuration..."

# Remove any existing Prisma client
echo "🧹 Cleaning existing Prisma client..."
rm -rf node_modules/.prisma
rm -rf node_modules/@prisma/client

# Reinstall Prisma dependencies
echo "📦 Reinstalling Prisma dependencies..."
pnpm install @prisma/client prisma --save-dev

# Generate Prisma client with proper binary targets
echo "🔄 Generating Prisma client for Vercel deployment..."
pnpm prisma generate

# Verify the client was generated
if [ -d "node_modules/.prisma/client" ]; then
    echo "✅ Prisma client generated successfully"
    
    # Check if the binaries are present
    if [ -f "node_modules/.prisma/client/libquery_engine-rhel-openssl-3.0.x.so.node" ]; then
        echo "✅ Vercel binary target found"
    else
        echo "⚠️  Vercel binary target not found - checking other targets..."
        ls -la node_modules/.prisma/client/
    fi
else
    echo "❌ Prisma client generation failed"
    exit 1
fi

echo "🚀 Prisma deployment configuration completed!"
echo ""
echo "Next steps:"
echo "1. Commit these changes to your repository"
echo "2. Deploy to Vercel"
echo "3. Check the /api/health endpoint to verify database connectivity"
