#!/usr/bin/env node

/**
 * This script finalizes the migration from Prisma to Mongoose
 * by updating imports and fixing any remaining issues.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Finalizing Prisma to Mongoose migration...');

// Package.json path
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Remove Prisma dependencies
console.log('📦 Updating package.json to remove Prisma dependencies...');
const prismaPackages = ['prisma', '@prisma/client', '@auth/prisma-adapter'];
let dependenciesChanged = false;

for (const pkg of prismaPackages) {
  if (packageJson.dependencies && packageJson.dependencies[pkg]) {
    console.log(`  - Removing ${pkg}`);
    delete packageJson.dependencies[pkg];
    dependenciesChanged = true;
  }
  if (packageJson.devDependencies && packageJson.devDependencies[pkg]) {
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
const prismaDir = path.join(__dirname, '..', 'prisma');

if (fs.existsSync(prismaDir)) {
  try {
    fs.rmSync(prismaDir, { recursive: true, force: true });
    console.log('  ✓ Prisma directory removed');
  } catch (err) {
    console.error('  ❌ Error removing prisma directory:', err);
  }
} else {
  console.log('  ✓ No prisma directory found');
}

// Create migration completion marker
console.log('📝 Creating migration marker...');
const migrationMarkerPath = path.join(__dirname, '..', '.mongoose-migration-complete');
fs.writeFileSync(migrationMarkerPath, new Date().toISOString());
console.log('  ✓ Migration marker created');

// Check for any remaining Prisma imports
console.log('🔍 Checking for remaining Prisma imports...');
try {
  const result = execSync('grep -r "prisma\\|@prisma" --include="*.ts" --include="*.tsx" src/ | wc -l', { encoding: 'utf8' });
  const count = parseInt(result.trim());
  
  if (count > 0) {
    console.log(`⚠️  Warning: Found ${count} remaining Prisma references`);
    console.log('   Run `npm run fix-prisma-imports` to fix them');
  } else {
    console.log('  ✓ No remaining Prisma imports found');
  }
} catch (error) {
  if (error.status === 1) {
    console.log('  ✓ No remaining Prisma imports found');
  } else {
    console.error('  ❌ Error checking for Prisma imports:', error);
  }
}

// Update next.config.js if necessary
const nextConfigPath = path.join(__dirname, '..', 'next.config.js');
if (fs.existsSync(nextConfigPath)) {
  console.log('🔧 Checking next.config.js for Prisma references...');
  let nextConfig = fs.readFileSync(nextConfigPath, 'utf8');
  
  if (nextConfig.includes('prisma') || nextConfig.includes('@prisma')) {
    nextConfig = nextConfig.replace(/\/\/.*prisma.*$/gm, '');
    nextConfig = nextConfig.replace(/\/\*[\s\S]*?prisma[\s\S]*?\*\//g, '');
    
    fs.writeFileSync(nextConfigPath, nextConfig);
    console.log('  ✓ next.config.js updated');
  } else {
    console.log('  ✓ No Prisma references in next.config.js');
  }
}

console.log('✅ Migration finalization complete!');
console.log('');
console.log('Next steps:');
console.log('1. Run `npm install` to update dependencies');
console.log('2. Run `npm run dev` to test the application');
console.log('3. Run `npm run build` to make sure everything builds properly');
