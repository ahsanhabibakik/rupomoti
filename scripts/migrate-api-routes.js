#!/usr/bin/env node

/**
 * Automated script to migrate Prisma API routes to Mongoose
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Handle ESM __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// Configuration
const apiRoutesDir = path.join(projectRoot, 'src', 'app', 'api');
const modelsDir = path.join(projectRoot, 'src', 'models');
const backupDir = path.join(projectRoot, '.backup-prisma');

// Ensure backup directory exists
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// Get all models
const getMongooseModels = () => {
  const modelFiles = fs.readdirSync(modelsDir)
    .filter(file => file.endsWith('.ts') && !file.includes('.test.') && !file.includes('template'));
  
  return modelFiles.map(file => ({
    name: path.basename(file, '.ts'),
    path: path.join(modelsDir, file)
  }));
};

// Common replacement patterns
const replacements = [
  // Import replacements
  {
    pattern: /import.*?prisma.*?from.*?['"]@\/lib\/prisma['"];?/g,
    replacement: 'import { withMongoose, parseQueryParams, getPaginationParams } from \'@/lib/mongoose-utils\';\n'
  },
  // PrismaClient type imports
  {
    pattern: /import.*?{.*?PrismaClient.*?}.*?from.*?['"]@prisma\/client['"];?/g,
    replacement: ''
  },
  // Prisma schema imports
  {
    pattern: /import.*?{(.*?)}.*?from.*?['"]@prisma\/client['"];?/g,
    replacement: (match, imports) => {
      // Extract the imported types
      const typeNames = imports.split(',').map(t => t.trim());
      // Generate type definitions for common Prisma enums
      let replacementCode = '';
      
      if (typeNames.includes('OrderStatus')) {
        replacementCode += `// Define OrderStatus type to replace Prisma import\n`;
        replacementCode += `const OrderStatus = {\n`;
        replacementCode += `  PENDING: 'PENDING',\n`;
        replacementCode += `  PROCESSING: 'PROCESSING',\n`;
        replacementCode += `  SHIPPED: 'SHIPPED',\n`;
        replacementCode += `  DELIVERED: 'DELIVERED',\n`;
        replacementCode += `  CANCELLED: 'CANCELLED'\n`;
        replacementCode += `};\n`;
      }
      
      if (typeNames.includes('PaymentStatus')) {
        replacementCode += `// Define PaymentStatus type to replace Prisma import\n`;
        replacementCode += `const PaymentStatus = {\n`;
        replacementCode += `  PENDING: 'PENDING',\n`;
        replacementCode += `  PAID: 'PAID',\n`;
        replacementCode += `  FAILED: 'FAILED',\n`;
        replacementCode += `  REFUNDED: 'REFUNDED'\n`;
        replacementCode += `};\n`;
      }
      
      return replacementCode;
    }
  },
  // Prisma client usage - Products
  {
    pattern: /const products = await prisma\.product\.findMany\((.*?)\);/g,
    replacement: (match, args) => {
      return `// Import Product model at the top of the file
import Product from '@/models/Product';

// Get products with mongoose
const { page, limit, skip } = getPaginationParams(req.url);
const filter = {};
const products = await Product.find(filter)
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit)
  .populate('categoryId')
  .lean();`;
    }
  },
  // Prisma client usage - Categories
  {
    pattern: /const categories = await prisma\.category\.findMany\((.*?)\);/g,
    replacement: (match, args) => {
      return `// Import Category model at the top of the file
import Category from '@/models/Category';

// Get categories with mongoose
const { page, limit, skip } = getPaginationParams(req.url);
const filter = {};
const categories = await Category.find(filter)
  .sort({ name: 1 })
  .skip(skip)
  .limit(limit)
  .lean();`;
    }
  },
  // Prisma client usage - Orders
  {
    pattern: /const orders = await prisma\.order\.findMany\((.*?)\);/g,
    replacement: (match, args) => {
      return `// Import Order model at the top of the file
import Order from '@/models/Order';

// Get orders with mongoose
const { page, limit, skip } = getPaginationParams(req.url);
const filter = {};
const orders = await Order.find(filter)
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit)
  .lean();`;
    }
  },
  // Prisma client usage - Users
  {
    pattern: /const users = await prisma\.user\.findMany\((.*?)\);/g,
    replacement: (match, args) => {
      return `// Import User model at the top of the file
import User from '@/models/User';

// Get users with mongoose
const { page, limit, skip } = getPaginationParams(req.url);
const filter = {};
const users = await User.find(filter)
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit)
  .lean();`;
    }
  },
  // Handler wrapper
  {
    pattern: /export async function (GET|POST|PUT|PATCH|DELETE)\(req.*?\).*?{/g,
    replacement: (match, method) => {
      return `export const ${method} = withMongoose(async (req) => {`;
    }
  },
  // Final return
  {
    pattern: /return new (NextResponse|Response)\((.*?)\);/g,
    replacement: (match, respClass, args) => {
      return `return NextResponse.json(${args});`;
    }
  },
  // Count replacement
  {
    pattern: /const count = await prisma\.(.*?)\.count\((.*?)\);/g,
    replacement: (match, model, args) => {
      const modelName = model.charAt(0).toUpperCase() + model.slice(1);
      return `// Make sure to import ${modelName} at the top
const count = await ${modelName}.countDocuments(${args || '{}'});`;
    }
  },
  // Create replacement
  {
    pattern: /const (.*?) = await prisma\.(.*?)\.create\({(\s*?)data: (.*?)}\);/g,
    replacement: (match, varName, model, whitespace, data) => {
      const modelName = model.charAt(0).toUpperCase() + model.slice(1);
      return `// Make sure to import ${modelName} at the top
const ${varName} = await ${modelName}.create(${data});`;
    }
  },
  // Update replacement
  {
    pattern: /const (.*?) = await prisma\.(.*?)\.update\({(\s*?)where: (.*?),(\s*?)data: (.*?)}\);/g,
    replacement: (match, varName, model, ws1, where, ws2, data) => {
      const modelName = model.charAt(0).toUpperCase() + model.slice(1);
      return `// Make sure to import ${modelName} at the top
const ${varName} = await ${modelName}.findOneAndUpdate(${where}, ${data}, { new: true });`;
    }
  },
  // Delete replacement
  {
    pattern: /const (.*?) = await prisma\.(.*?)\.delete\({(\s*?)where: (.*?)}\);/g,
    replacement: (match, varName, model, ws, where) => {
      const modelName = model.charAt(0).toUpperCase() + model.slice(1);
      return `// Make sure to import ${modelName} at the top
const ${varName} = await ${modelName}.findOneAndDelete(${where});`;
    }
  },
  // findUnique replacement
  {
    pattern: /const (.*?) = await prisma\.(.*?)\.findUnique\({(\s*?)where: (.*?)}\);/g,
    replacement: (match, varName, model, ws, where) => {
      const modelName = model.charAt(0).toUpperCase() + model.slice(1);
      return `// Make sure to import ${modelName} at the top
const ${varName} = await ${modelName}.findOne(${where});`;
    }
  },
  // findFirst replacement
  {
    pattern: /const (.*?) = await prisma\.(.*?)\.findFirst\({(\s*?)where: (.*?)}\);/g,
    replacement: (match, varName, model, ws, where) => {
      const modelName = model.charAt(0).toUpperCase() + model.slice(1);
      return `// Make sure to import ${modelName} at the top
const ${varName} = await ${modelName}.findOne(${where});`;
    }
  },
  // any type replacement
  {
    pattern: /: any(\s|=|;|,|\))/g,
    replacement: ': Record<string, unknown>$1'
  }
];

// Process a single file
function processFile(filePath) {
  console.log(`Processing ${filePath}...`);
  
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
    
    // Apply replacements
    for (const replacement of replacements) {
      content = content.replace(replacement.pattern, replacement.replacement);
    }
    
    // Write back modified content if changed
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Successfully migrated ${filePath}`);
      return true;
    } else {
      console.log(`⏭️ No changes needed for ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error);
    return false;
  }
}

// Find all API route files
function findApiRouteFiles(dir) {
  let results = [];
  
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const itemPath = path.join(dir, item);
    const stats = fs.statSync(itemPath);
    
    if (stats.isDirectory()) {
      results = results.concat(findApiRouteFiles(itemPath));
    } else if (stats.isFile() && (item === 'route.ts' || item === 'route.js')) {
      results.push(itemPath);
    }
  }
  
  return results;
}

// Main function
async function main() {
  console.log('🚀 Starting automated Prisma to Mongoose migration');
  
  // Get all models
  const models = getMongooseModels();
  console.log(`📦 Found ${models.length} Mongoose models`);
  
  // Find all API route files
  const apiRouteFiles = findApiRouteFiles(apiRoutesDir);
  console.log(`📁 Found ${apiRouteFiles.length} API route files`);
  
  // Process each file
  let successCount = 0;
  for (const filePath of apiRouteFiles) {
    const success = processFile(filePath);
    if (success) successCount++;
  }
  
  console.log(`\n✅ Migration completed! Successfully migrated ${successCount}/${apiRouteFiles.length} files`);
  console.log(`🔄 Original files backed up to ${backupDir}`);
  console.log('\n⚠️ Note: You may need to manually fix some complex queries or specialized Prisma features');
  console.log('🔍 Run "npm run build" to check for TypeScript errors in the migrated files');
}

// Run the script
main().catch(error => {
  console.error('❌ Migration failed:', error);
  process.exit(1);
});
