# PowerShell script to fix Prisma deployment issues for Vercel
Write-Host "🔧 Fixing Prisma deployment configuration..." -ForegroundColor Cyan

# Remove any existing Prisma client
Write-Host "🧹 Cleaning existing Prisma client..." -ForegroundColor Yellow
Remove-Item -Path "node_modules/.prisma" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "node_modules/@prisma/client" -Recurse -Force -ErrorAction SilentlyContinue

# Reinstall Prisma dependencies
Write-Host "📦 Reinstalling Prisma dependencies..." -ForegroundColor Yellow
pnpm install @prisma/client prisma --save-dev

# Generate Prisma client with proper binary targets
Write-Host "🔄 Generating Prisma client for Vercel deployment..." -ForegroundColor Yellow
pnpm prisma generate

# Verify the client was generated
if (Test-Path "node_modules/.prisma/client") {
    Write-Host "✅ Prisma client generated successfully" -ForegroundColor Green
    
    # Check if the binaries are present
    if (Test-Path "node_modules/.prisma/client/libquery_engine-rhel-openssl-3.0.x.so.node") {
        Write-Host "✅ Vercel binary target found" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Vercel binary target not found - checking other targets..." -ForegroundColor Yellow
        Get-ChildItem -Path "node_modules/.prisma/client/" -Name
    }
} else {
    Write-Host "❌ Prisma client generation failed" -ForegroundColor Red
    exit 1
}

Write-Host "🚀 Prisma deployment configuration completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Commit these changes to your repository"
Write-Host "2. Deploy to Vercel"
Write-Host "3. Check the /api/health endpoint to verify database connectivity"
