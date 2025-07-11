#!/usr/bin/env bash

# This script orchestrates the complete migration from Prisma to Mongoose
# It runs all necessary migration scripts in the correct order

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Print a header
echo -e "${BLUE}==============================================${NC}"
echo -e "${BLUE}   PRISMA TO MONGOOSE MIGRATION AUTOMATION   ${NC}"
echo -e "${BLUE}==============================================${NC}"

# Check if the user is running this in the project root
if [ ! -f "package.json" ]; then
  echo -e "${RED}Error: This script must be run from the project root directory${NC}"
  exit 1
fi

# Function to run a command with proper output
run_command() {
  local cmd=$1
  local description=$2
  
  echo -e "\n${YELLOW}> ${description}...${NC}"
  
  if eval "$cmd"; then
    echo -e "${GREEN}✓ Success!${NC}"
    return 0
  else
    echo -e "${RED}✗ Failed!${NC}"
    return 1
  fi
}

# Create backup directory
echo -e "\n${YELLOW}Creating backup directory...${NC}"
mkdir -p .prisma-backup
cp -r prisma .prisma-backup/
echo -e "${GREEN}✓ Backup created in .prisma-backup/${NC}"

# Step 1: Migrate API routes from Prisma to Mongoose
run_command "node scripts/migrate-api-routes.js" "Migrating API routes from Prisma to Mongoose"

# Step 2: Fix Prisma imports across the codebase
run_command "node scripts/fix-prisma-imports.js" "Fixing Prisma imports throughout the codebase"

# Step 3: Validate Mongoose models
if [ -f "scripts/validate-mongoose-models.js" ]; then
  run_command "node scripts/validate-mongoose-models.js" "Validating Mongoose models"
fi

# Step 4: Finalize migration (clean up package.json, etc.)
run_command "node scripts/finalize-migration-new.js" "Finalizing migration"

# Step 5: Run migration summary
run_command "node scripts/migration-summary.js || echo 'Migration summary generation skipped'" "Generating migration summary"

# Step 6: Install dependencies
echo -e "\n${YELLOW}Installing dependencies without Prisma...${NC}"
npm install
echo -e "${GREEN}✓ Dependencies updated!${NC}"

# Final steps
echo -e "\n${BLUE}==============================================${NC}"
echo -e "${GREEN}✓ Migration completed successfully!${NC}"
echo -e "${BLUE}==============================================${NC}"
echo -e "\nNext steps:"
echo -e "1. Run ${YELLOW}npm run dev${NC} to test the application"
echo -e "2. Run ${YELLOW}npm run build${NC} to verify the build process"
echo -e "3. Check ${YELLOW}MONGOOSE_MIGRATION_SUMMARY.md${NC} for migration details"
echo -e "4. Delete the ${YELLOW}prisma${NC} directory if everything works correctly"
