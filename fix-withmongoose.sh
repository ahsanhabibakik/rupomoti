#!/bin/bash

# Script to fix withMongoose imports in API routes
# This will replace the withMongoose pattern with proper Next.js API route patterns

echo "🔧 Fixing withMongoose imports in API routes..."

# Files to process
files=(
  "src/app/api/upload/route.ts"
  "src/app/api/webhook/steadfast/route.ts"
  "src/app/api/upload/debug/route.ts"
  "src/app/api/test-simple/route.ts"
  "src/app/api/test-query-fix/route.ts"
  "src/app/api/system/health/route.ts"
  "src/app/api/shipping/route.ts"
  "src/app/api/settings/route.ts"
  "src/app/api/shop/products/route.ts"
  "src/app/api/reviews/route.ts"
  "src/app/api/returns/route.ts"
  "src/app/api/public/media/[section]/route.ts"
  "src/app/api/public/media/logo/route.ts"
  "src/app/api/public/media/hero-slider/route.ts"
  "src/app/api/products-enhanced/route.ts"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing: $file"
    
    # Replace import statements
    sed -i 's/import { withMongoose, parseQueryParams, getPaginationParams } from.*$/import { connectDB } from '\''@\/lib\/db'\'';/' "$file"
    sed -i 's/import { auth } from '\''@\/app\/auth'\'';/import { getServerSession } from '\''next-auth\/next'\'';\nimport { authOptions } from '\''@\/app\/auth'\'';/' "$file"
    
    # Replace export patterns
    sed -i 's/export const GET = withMongoose(async (req) => {/export async function GET(req: NextRequest) {\n  try {\n    await connectDB();/' "$file"
    sed -i 's/export const POST = withMongoose(async (req) => {/export async function POST(req: NextRequest) {\n  try {\n    await connectDB();/' "$file"
    sed -i 's/export const PUT = withMongoose(async (req) => {/export async function PUT(req: NextRequest) {\n  try {\n    await connectDB();/' "$file"
    sed -i 's/export const DELETE = withMongoose(async (req) => {/export async function DELETE(req: NextRequest) {\n  try {\n    await connectDB();/' "$file"
    
    # Replace auth calls
    sed -i 's/const session = await auth();/const session = await getServerSession(authOptions);/' "$file"
    
    echo "✅ Fixed: $file"
  else
    echo "⚠️  File not found: $file"
  fi
done

echo "🎉 Completed fixing withMongoose imports!"
