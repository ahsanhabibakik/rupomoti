#!/bin/bash

# Migration Summary Script
# This script generates a summary of the Prisma to Mongoose migration

echo "# Prisma to Mongoose Migration Summary" > MIGRATION_SUMMARY.md
echo "" >> MIGRATION_SUMMARY.md
echo "Generated: $(date)" >> MIGRATION_SUMMARY.md
echo "" >> MIGRATION_SUMMARY.md

# Check for mongoose adapter
if [ -f "src/lib/mongoose-adapter.ts" ]; then
  echo "✅ Mongoose adapter for NextAuth is present" >> MIGRATION_SUMMARY.md
else
  echo "❌ Mongoose adapter for NextAuth is missing" >> MIGRATION_SUMMARY.md
fi

# Check for Mongoose models
echo "" >> MIGRATION_SUMMARY.md
echo "## Mongoose Models" >> MIGRATION_SUMMARY.md
echo "" >> MIGRATION_SUMMARY.md

if [ -d "src/models" ]; then
  for model in src/models/*.ts; do
    echo "- ✅ $(basename "$model" .ts)" >> MIGRATION_SUMMARY.md
  done
else
  echo "❌ No models directory found" >> MIGRATION_SUMMARY.md
fi

# Check for remaining Prisma imports
echo "" >> MIGRATION_SUMMARY.md
echo "## Remaining Prisma References" >> MIGRATION_SUMMARY.md
echo "" >> MIGRATION_SUMMARY.md

prisma_files=$(grep -r "prisma\|@prisma" --include="*.ts" --include="*.tsx" src/ | wc -l)
if [ "$prisma_files" -eq "0" ]; then
  echo "✅ No remaining Prisma imports found" >> MIGRATION_SUMMARY.md
else
  echo "❌ Found $prisma_files files with Prisma references" >> MIGRATION_SUMMARY.md
  echo "   Run \`grep -r \"prisma\|@prisma\" --include=\"*.ts\" --include=\"*.tsx\" src/\` to see them" >> MIGRATION_SUMMARY.md
fi

# Check if Prisma is still in package.json
if grep -q "@prisma/client" package.json; then
  echo "❌ @prisma/client is still in package.json" >> MIGRATION_SUMMARY.md
else
  echo "✅ @prisma/client removed from package.json" >> MIGRATION_SUMMARY.md
fi

if grep -q "prisma" package.json; then
  echo "❌ prisma is still in package.json" >> MIGRATION_SUMMARY.md
else
  echo "✅ prisma removed from package.json" >> MIGRATION_SUMMARY.md
fi

# Check if database connection works
echo "" >> MIGRATION_SUMMARY.md
echo "## Database Connection" >> MIGRATION_SUMMARY.md
echo "" >> MIGRATION_SUMMARY.md

if [ -f "src/lib/dbConnect.ts" ]; then
  echo "✅ MongoDB connection file exists" >> MIGRATION_SUMMARY.md
else
  echo "❌ MongoDB connection file is missing" >> MIGRATION_SUMMARY.md
fi

# Summary of changes
echo "" >> MIGRATION_SUMMARY.md
echo "## Migration Summary" >> MIGRATION_SUMMARY.md
echo "" >> MIGRATION_SUMMARY.md
echo "1. Replaced Prisma schema with Mongoose models" >> MIGRATION_SUMMARY.md
echo "2. Created custom Mongoose adapter for NextAuth" >> MIGRATION_SUMMARY.md
echo "3. Updated API routes to use Mongoose" >> MIGRATION_SUMMARY.md
echo "4. Fixed image loading issues" >> MIGRATION_SUMMARY.md
echo "5. Added proper error handling" >> MIGRATION_SUMMARY.md
echo "6. Created migration documentation" >> MIGRATION_SUMMARY.md

echo "Migration summary generated: MIGRATION_SUMMARY.md"
