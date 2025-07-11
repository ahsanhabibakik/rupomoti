#!/usr/bin/env node

/**
 * Script to fix Prisma imports across the codebase
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { execSync } from 'child_process';

// Handle ESM __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// Configuration
const srcDir = path.join(projectRoot, 'src');
const backupDir = path.join(projectRoot, '.backup-prisma-imports');

// Ensure backup directory exists
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// Common replacement patterns for different file types
const tsReplacements = [
  // Common Prisma imports
  {
    pattern: /import.*?{.*?}.*?from.*?['"]@prisma\/client['"];?/g,
    replacement: (match) => {
      // Extract the imported types
      const typeMatch = match.match(/import.*?{(.*?)}.*?from/);
      if (!typeMatch || !typeMatch[1]) return '';
      
      const typeNames = typeMatch[1].split(',').map(t => t.trim());
      let replacementCode = '';
      
      // Replace common Prisma types with our own definitions
      if (typeNames.includes('OrderStatus')) {
        replacementCode += `// Define OrderStatus enum to replace Prisma import\n`;
        replacementCode += `enum OrderStatus {\n`;
        replacementCode += `  PENDING = 'PENDING',\n`;
        replacementCode += `  PROCESSING = 'PROCESSING',\n`;
        replacementCode += `  SHIPPED = 'SHIPPED',\n`;
        replacementCode += `  DELIVERED = 'DELIVERED',\n`;
        replacementCode += `  CANCELLED = 'CANCELLED'\n`;
        replacementCode += `}\n`;
      }
      
      if (typeNames.includes('PaymentStatus')) {
        replacementCode += `// Define PaymentStatus enum to replace Prisma import\n`;
        replacementCode += `enum PaymentStatus {\n`;
        replacementCode += `  PENDING = 'PENDING',\n`;
        replacementCode += `  PAID = 'PAID',\n`;
        replacementCode += `  FAILED = 'FAILED',\n`;
        replacementCode += `  REFUNDED = 'REFUNDED'\n`;
        replacementCode += `}\n`;
      }
      
      if (typeNames.includes('Role')) {
        replacementCode += `// Define Role enum to replace Prisma import\n`;
        replacementCode += `enum Role {\n`;
        replacementCode += `  USER = 'USER',\n`;
        replacementCode += `  ADMIN = 'ADMIN',\n`;
        replacementCode += `  SUPER_ADMIN = 'SUPER_ADMIN'\n`;
        replacementCode += `}\n`;
      }
      
      if (typeNames.includes('Prisma')) {
        replacementCode += `// Define Decimal type to replace Prisma.Decimal\n`;
        replacementCode += `type Decimal = number;\n`;
      }
      
      if (typeNames.some(t => t.match(/^[A-Z]/))) {
        replacementCode += `// Import Mongoose models to replace Prisma models\n`;
        
        if (typeNames.includes('Product')) {
          replacementCode += `import Product from '@/models/Product';\n`;
        }
        
        if (typeNames.includes('Category')) {
          replacementCode += `import Category from '@/models/Category';\n`;
        }
        
        if (typeNames.includes('User')) {
          replacementCode += `import User from '@/models/User';\n`;
        }
        
        if (typeNames.includes('Order')) {
          replacementCode += `import Order from '@/models/Order';\n`;
        }
      }
      
      return replacementCode;
    }
  },
  // PrismaClient import
  {
    pattern: /import.*?PrismaClient.*?from.*?['"]@prisma\/client['"];?/g,
    replacement: '// Removed PrismaClient import - using Mongoose instead'
  },
  // prisma import from lib
  {
    pattern: /import.*?prisma.*?from.*?['"]@\/lib\/prisma['"];?/g,
    replacement: 'import dbConnect from \'@/lib/dbConnect\';'
  },
  // Type imports from models
  {
    pattern: /import.*?{.*?}.*?from.*?['"]@prisma\/client['"];?/g,
    replacement: '// Removed Prisma type imports - using Mongoose types instead'
  }
];

// List of file extensions to process
const extensions = ['.ts', '.tsx', '.js', '.jsx'];

// Find all files with target extensions
function findFiles(dir, extensions) {
  let results = [];
  
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const itemPath = path.join(dir, item);
    const stats = fs.statSync(itemPath);
    
    if (stats.isDirectory()) {
      results = results.concat(findFiles(itemPath, extensions));
    } else if (stats.isFile() && extensions.some(ext => itemPath.endsWith(ext))) {
      results.push(itemPath);
    }
  }
  
  return results;
}

// Process a single file
function processFile(filePath) {
  try {
    // Read file content
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Create backup of original file
    const backupPath = path.join(backupDir, path.relative(projectRoot, filePath));
    const backupDirName = path.dirname(backupPath);
    if (!fs.existsSync(backupDirName)) {
      fs.mkdirSync(backupDirName, { recursive: true });
    }
    fs.writeFileSync(backupPath, content);
    
    // Skip files that don't contain Prisma
    if (!content.includes('prisma') && !content.includes('@prisma')) {
      return false;
    }
    
    // Apply replacements
    const replacements = tsReplacements;
    for (const replacement of replacements) {
      content = content.replace(replacement.pattern, replacement.replacement);
    }
    
    // Write back modified content if changed
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed imports in ${filePath}`);
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error);
    return false;
  }
}

// Main function
async function main() {
  console.log('🚀 Starting Prisma import fixes');
  
  // Find all target files
  const files = findFiles(srcDir, extensions);
  console.log(`📁 Found ${files.length} files to check`);
  
  // Find files containing Prisma references
  const filesToProcess = files.filter(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      return content.includes('prisma') || content.includes('@prisma');
    } catch (error) {
      return false;
    }
  });
  
  console.log(`🔍 Found ${filesToProcess.length} files with Prisma references`);
  
  // Process each file
  let successCount = 0;
  for (const filePath of filesToProcess) {
    const success = processFile(filePath);
    if (success) successCount++;
  }
  
  console.log(`\n✅ Import fixes completed! Fixed ${successCount}/${filesToProcess.length} files`);
  console.log(`🔄 Original files backed up to ${backupDir}`);
}

// Run the script
main().catch(error => {
  console.error('❌ Import fixes failed:', error);
  process.exit(1);
});
