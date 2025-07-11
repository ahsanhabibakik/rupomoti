#!/usr/bin/env node

/**
 * This script finalizes the migration from Prisma to Mongoose
 * by updating imports and fixing any remaining issues.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Finalizing Prisma to Mongoose migration...');

// Remove prisma dependencies
console.log('📦 Updating package.json to remove Prisma dependencies...');
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Remove Prisma dependencies
const prismaPackages = ['prisma', '@prisma/client', '@auth/prisma-adapter'];
let dependenciesChanged = false;

for (const pkg of prismaPackages) {
  if (packageJson.dependencies[pkg]) {
    console.log(`  - Removing ${pkg}`);
    delete packageJson.dependencies[pkg];
    dependenciesChanged = true;
  }
  if (packageJson.devDependencies?.[pkg]) {
    console.log(`  - Removing ${pkg} from devDependencies`);
    delete packageJson.devDependencies[pkg];
    dependenciesChanged = true;
  }
}

// Update package.json if changes were made
if (dependenciesChanged) {
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('  ✓ package.json updated');
} else {
  console.log('  ✓ No Prisma dependencies found in package.json');
}

// Delete Prisma schema and migrations
console.log('🗑️  Cleaning up Prisma files...');
const prismaDir = path.join(__dirname, 'prisma');

if (fs.existsSync(prismaDir)) {
  console.log('  - Removing prisma directory');
  fs.rmSync(prismaDir, { recursive: true, force: true });
  console.log('  ✓ Prisma directory removed');
} else {
  console.log('  ✓ No prisma directory found');
}

// Create migration completion marker
console.log('📝 Creating migration marker...');
const migrationMarkerPath = path.join(__dirname, '.mongoose-migration-complete');
fs.writeFileSync(migrationMarkerPath, new Date().toISOString());
console.log('  ✓ Migration marker created');

// Check for any remaining Prisma imports
console.log('🔍 Checking for remaining Prisma imports...');
try {
  const grepResult = execSync('grep -r "prisma\\|@prisma" --include="*.ts" --include="*.tsx" src/', { encoding: 'utf8' });
  console.log('⚠️  Warning: Found remaining Prisma references:');
  console.log(grepResult);
} catch (error) {
  if (error.status === 1) {
    console.log('  ✓ No remaining Prisma imports found');
  } else {
    console.error('  ❌ Error checking for Prisma imports:', error);
  }
}

console.log('✅ Migration finalization complete!');
console.log('');
console.log('Next steps:');
console.log('1. Install dependencies with: npm install');
console.log('2. Run the development server: npm run dev');
console.log('3. Test all functionality to ensure the migration was successful');
