/**
 * Validate the migration from Prisma to Mongoose
 * This script checks that all necessary Mongoose components are in place and working
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { execSync } from 'child_process';

// Handle ESM __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const rootDir = path.join(__dirname, '..');
const srcDir = path.join(rootDir, 'src');
const modelsDir = path.join(srcDir, 'models');
const libDir = path.join(srcDir, 'lib');

// Color codes for output
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

// Log functions
function logSuccess(message) {
  console.log(`${GREEN}✓ ${message}${RESET}`);
}

function logError(message) {
  console.log(`${RED}✗ ${message}${RESET}`);
}

function logWarning(message) {
  console.log(`${YELLOW}⚠ ${message}${RESET}`);
}

function logInfo(message) {
  console.log(`${BLUE}ℹ ${message}${RESET}`);
}

// Required files for Mongoose setup
const requiredFiles = [
  { path: path.join(libDir, 'dbConnect.ts'), name: 'Database Connection' },
  { path: path.join(libDir, 'mongoose-adapter.ts'), name: 'NextAuth Mongoose Adapter' },
  { path: path.join(libDir, 'mongoose-utils.ts'), name: 'Mongoose Utilities' },
];

// Required models
const requiredModels = [
  'User.ts',
  'Account.ts',
  'Session.ts',
  'VerificationToken.ts',
  'Product.ts',
  'Category.ts',
  'Order.ts'
];

// Main validation function
async function validateMigration() {
  console.log(`${BLUE}========================================${RESET}`);
  console.log(`${BLUE}   PRISMA TO MONGOOSE MIGRATION VALIDATOR   ${RESET}`);
  console.log(`${BLUE}========================================${RESET}\n`);

  let errors = 0;
  let warnings = 0;
  
  // Check required files
  logInfo('Checking required files...');
  for (const file of requiredFiles) {
    if (fs.existsSync(file.path)) {
      logSuccess(`${file.name} (${path.relative(rootDir, file.path)}) exists`);
    } else {
      logError(`${file.name} (${path.relative(rootDir, file.path)}) is missing`);
      errors++;
    }
  }
  
  // Check model files
  logInfo('\nChecking Mongoose models...');
  if (!fs.existsSync(modelsDir)) {
    logError('Models directory is missing');
    errors++;
  } else {
    const modelFiles = fs.readdirSync(modelsDir);
    
    for (const model of requiredModels) {
      if (modelFiles.includes(model)) {
        logSuccess(`Model ${model} exists`);
      } else {
        logError(`Model ${model} is missing`);
        errors++;
      }
    }
  }
  
  // Check for remaining Prisma imports
  logInfo('\nChecking for remaining Prisma dependencies...');
  try {
    // Check package.json for Prisma dependencies
    const packageJsonPath = path.join(rootDir, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    const hasPrismaDeps = 
      (packageJson.dependencies && (
        packageJson.dependencies.prisma ||
        packageJson.dependencies['@prisma/client']
      )) ||
      (packageJson.devDependencies && (
        packageJson.devDependencies.prisma ||
        packageJson.devDependencies['@prisma/client']
      ));
    
    if (hasPrismaDeps) {
      logWarning('Prisma dependencies still exist in package.json');
      warnings++;
    } else {
      logSuccess('No Prisma dependencies in package.json');
    }
    
    // Check for remaining Prisma references in code
    try {
      const cmd = `grep -r "from.*prisma\\|@prisma" --include="*.ts" --include="*.tsx" ${srcDir} | wc -l`;
      const result = execSync(cmd, { encoding: 'utf8' });
      const count = parseInt(result.trim());
      
      if (count > 0) {
        logWarning(`${count} files still have Prisma imports`);
        warnings++;
        
        // Show sample of files with Prisma imports
        const sampleCmd = `grep -r -l "from.*prisma\\|@prisma" --include="*.ts" --include="*.tsx" ${srcDir} | head -5`;
        try {
          const sampleResult = execSync(sampleCmd, { encoding: 'utf8' });
          console.log(`${YELLOW}Sample files with Prisma imports:${RESET}`);
          sampleResult.split('\n').filter(Boolean).forEach(file => {
            console.log(`  - ${path.relative(rootDir, file)}`);
          });
        } catch {
          // Ignore sample error
        }
      } else {
        logSuccess('No Prisma imports found in source files');
      }
    } catch (error) {
      if (error.status === 1) {
        logSuccess('No Prisma imports found in source files');
      } else {
        logWarning('Error checking for Prisma imports');
        warnings++;
      }
    }
    
    // Check for Prisma directory
    const prismaDir = path.join(rootDir, 'prisma');
    if (fs.existsSync(prismaDir)) {
      logWarning('Prisma directory still exists');
      warnings++;
    } else {
      logSuccess('Prisma directory has been removed');
    }
    
  } catch (error) {
    logError('Error checking for Prisma dependencies');
    console.error(error);
    errors++;
  }
  
  // Summary
  console.log(`\n${BLUE}========================================${RESET}`);
  console.log(`${BLUE}   VALIDATION SUMMARY   ${RESET}`);
  console.log(`${BLUE}========================================${RESET}\n`);
  
  if (errors === 0 && warnings === 0) {
    console.log(`${GREEN}✓ Migration validation passed with no issues!${RESET}`);
  } else if (errors === 0) {
    console.log(`${YELLOW}⚠ Migration validation passed with ${warnings} warnings${RESET}`);
  } else {
    console.log(`${RED}✗ Migration validation failed with ${errors} errors and ${warnings} warnings${RESET}`);
  }
  
  // Next steps
  console.log(`\n${BLUE}Recommended next steps:${RESET}`);
  if (errors > 0) {
    console.log('1. Fix the errors reported above');
    console.log('2. Run this validation script again');
  } else if (warnings > 0) {
    console.log('1. Address the warnings reported above');
    console.log('2. Run the application to test functionality');
    console.log('3. If everything works, remove the Prisma directory');
  } else {
    console.log('1. Run the application to test functionality');
    console.log('2. Deploy to development environment for further testing');
    console.log('3. Update documentation to reflect the migration');
  }
  
  return errors === 0;
}

// Run the validation
validateMigration()
  .then(success => {
    if (!success) {
      process.exit(1);
    }
  })
  .catch(error => {
    console.error(`${RED}Validation failed with an error:${RESET}`, error);
    process.exit(1);
  });
