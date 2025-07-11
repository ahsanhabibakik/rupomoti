#!/bin/bash

# Find and categorize Prisma imports for migration
echo "# Critical Prisma Import Paths"
echo ""
echo "This report identifies the critical Prisma imports that need to be fixed for the migration."
echo ""

# API routes with Prisma imports
echo "## API Routes (Critical)"
echo ""
echo "These are API routes that need to be converted to use Mongoose:"
echo ""
grep -r --include="*.ts" "prisma\|@prisma" src/app/api | grep -v "template" | sort | uniq -c | sort -nr | head -20
echo ""

# Auth related files
echo "## Auth Related Files (Critical)"
echo ""
echo "These authentication files need to be updated to use Mongoose:"
echo ""
grep -r --include="*.ts" --include="*.tsx" "prisma\|@prisma" src/app/auth src/lib/auth src/components/auth | sort | uniq -c | sort -nr
echo ""

# Top files with most Prisma imports
echo "## Files with Most Prisma Imports"
echo ""
echo "These files have the most Prisma imports and should be prioritized:"
echo ""
grep -r --include="*.ts" --include="*.tsx" "prisma\|@prisma" src/ | cut -d: -f1 | sort | uniq -c | sort -nr | head -20
echo ""

# Type imports
echo "## Type Imports from Prisma"
echo ""
echo "These files are importing types from @prisma/client:"
echo ""
grep -r --include="*.ts" --include="*.tsx" "import.*from.*@prisma/client" src/ | sort | uniq -c | sort -nr | head -20
echo ""

# Direct Prisma client usage
echo "## Direct Prisma Client Usage"
echo ""
echo "These files directly use the Prisma client and need to be converted to Mongoose:"
echo ""
grep -r --include="*.ts" --include="*.tsx" "prisma\." src/ | sort | uniq -c | sort -nr | head -20
echo ""

# Remaining file count
echo "## Total Files with Prisma Imports"
echo ""
echo "Total number of files containing Prisma imports:"
echo ""
grep -r --include="*.ts" --include="*.tsx" "prisma\|@prisma" src/ | cut -d: -f1 | sort -u | wc -l
echo ""
