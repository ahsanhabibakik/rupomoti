/**
 * Generate a comprehensive migration summary for the Prisma to Mongoose migration
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Handle ESM __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const rootDir = path.join(__dirname, '..');
const modelsDir = path.join(rootDir, 'src', 'models');
const srcDir = path.join(rootDir, 'src');
const summaryPath = path.join(rootDir, 'MONGOOSE_MIGRATION_SUMMARY.md');

// Get current date in YYYY-MM-DD format
const currentDate = new Date().toISOString().split('T')[0];

// Function to count files in a directory recursively
function countFiles(dir, extensions) {
  let count = 0;
  
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const itemPath = path.join(dir, item);
    const stats = fs.statSync(itemPath);
    
    if (stats.isDirectory()) {
      count += countFiles(itemPath, extensions);
    } else if (stats.isFile() && extensions.some(ext => itemPath.endsWith(ext))) {
      count++;
    }
  }
  
  return count;
}

// Function to count lines containing a specific string in a directory recursively
function countOccurrences(dir, searchString, extensions) {
  try {
    const cmd = `grep -r "${searchString}" --include="*.{${extensions.join(',')}}" ${dir} | wc -l`;
    const result = execSync(cmd, { encoding: 'utf8' });
    return parseInt(result.trim());
  } catch (error) {
    // grep returns exit code 1 if no matches found
    if (error.status === 1) {
      return 0;
    }
    console.error('Error counting occurrences:', error);
    return 0;
  }
}

// Main function
async function main() {
  console.log('📝 Generating migration summary...');
  
  try {
    // Count Mongoose models
    const modelFiles = fs.readdirSync(modelsDir)
      .filter(file => file.endsWith('.ts') && !file.includes('.test.') && !file.includes('template'));
    
    // Count source files
    const totalFiles = countFiles(srcDir, ['.ts', '.tsx', '.js', '.jsx']);
    
    // Count remaining Prisma occurrences
    const remainingPrismaImports = countOccurrences(srcDir, '@prisma', ['ts', 'tsx', 'js', 'jsx']);
    const remainingPrismaUsage = countOccurrences(srcDir, 'prisma\\.', ['ts', 'tsx', 'js', 'jsx']);
    
    // Generate summary content
    const summaryContent = `# Mongoose Migration Summary

## Migration Date
${currentDate}

## Migration Stats
- **Mongoose Models**: ${modelFiles.length} models created
- **Total Source Files**: ${totalFiles} files in src directory
- **Remaining Prisma Imports**: ${remainingPrismaImports} occurrences
- **Remaining Prisma Usage**: ${remainingPrismaUsage} occurrences

## Mongoose Models
${modelFiles.map(model => `- ${model}`).join('\n')}

## Required Files
- \`src/lib/dbConnect.ts\`: ${fs.existsSync(path.join(srcDir, 'lib', 'dbConnect.ts')) ? '✅ Created' : '❌ Missing'}
- \`src/lib/mongoose-adapter.ts\`: ${fs.existsSync(path.join(srcDir, 'lib', 'mongoose-adapter.ts')) ? '✅ Created' : '❌ Missing'}
- \`src/lib/mongoose-utils.ts\`: ${fs.existsSync(path.join(srcDir, 'lib', 'mongoose-utils.ts')) ? '✅ Created' : '❌ Missing'}

## Next Steps
1. Test authentication functionality with Mongoose adapter
2. Verify all API routes work correctly
3. Ensure all database operations use Mongoose models
4. Delete Prisma directory and dependencies if everything works

## Notes
- If any remaining Prisma imports or usage are found, they need to be manually converted to use Mongoose
- Update TypeScript types as needed to match Mongoose schema definitions
- Adjust database queries that rely on complex Prisma features
`;

    // Write summary file
    fs.writeFileSync(summaryPath, summaryContent);
    
    console.log(`✅ Migration summary generated at ${summaryPath}`);
  } catch (error) {
    console.error('❌ Error generating migration summary:', error);
    process.exit(1);
  }
}

// Run the script
main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
