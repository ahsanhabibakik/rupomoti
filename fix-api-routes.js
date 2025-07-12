const fs = require('fs');
const path = require('path');

// Function to fix withMongoose usage in route files
function fixRouteFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Replace withMongoose imports
    if (content.includes('withMongoose')) {
      content = content.replace(/import.*withMongoose.*from.*['"]@\/lib\/mongoose-utils['"];?\n?/g, '');
      content = content.replace(/import.*parseQueryParams.*from.*['"]@\/lib\/mongoose-utils['"];?\n?/g, '');
      content = content.replace(/import.*getPaginationParams.*from.*['"]@\/lib\/mongoose-utils['"];?\n?/g, '');
      modified = true;
    }

    // Replace auth imports
    if (content.includes("from '@/app/auth'") && !content.includes('authOptions')) {
      content = content.replace(/import.*auth.*from ['"]@\/app\/auth['"];?/g, "import { getServerSession } from 'next-auth/next';\nimport { authOptions } from '@/app/auth';");
      modified = true;
    }

    // Add connectDB import if not present
    if (!content.includes('connectDB') && !content.includes('dbConnect')) {
      if (content.includes("from 'next/server'")) {
        content = content.replace(
          /(import.*from 'next\/server';)/,
          "$1\nimport { connectDB } from '@/lib/db';"
        );
        modified = true;
      }
    }

    // Replace withMongoose function wrappers
    const withMongoosePattern = /export const (GET|POST|PUT|DELETE|PATCH) = withMongoose\(async \((req|request)\) => \{/g;
    if (withMongoosePattern.test(content)) {
      content = content.replace(withMongoosePattern, (match, method, param) => {
        return `export async function ${method}(${param}: Request) {\n  try {\n    await connectDB();`;
      });
      modified = true;
    }

    // Replace auth() calls with getServerSession(authOptions)
    if (content.includes('await auth()')) {
      content = content.replace(/await auth\(\)/g, 'await getServerSession(authOptions)');
      modified = true;
    }

    // Fix prisma references if any
    if (content.includes('prisma.')) {
      console.log(`Warning: Found Prisma references in ${filePath} - manual review needed`);
    }

    // Fix missing closing braces for withMongoose conversions
    const functionPattern = /export async function (GET|POST|PUT|DELETE|PATCH)\([^)]*\) \{\s*try \{\s*await connectDB\(\);/g;
    let matches = [...content.matchAll(functionPattern)];
    
    for (let match of matches) {
      let startPos = match.index;
      let braceCount = 0;
      let pos = startPos;
      let foundTryStart = false;
      
      while (pos < content.length) {
        if (content[pos] === '{') {
          braceCount++;
          if (!foundTryStart && content.substring(pos - 10, pos).includes('try')) {
            foundTryStart = true;
          }
        } else if (content[pos] === '}') {
          braceCount--;
          if (foundTryStart && braceCount === 1) {
            // This should be the end of the try block
            // Check if there's a missing catch block
            let afterPos = pos + 1;
            while (afterPos < content.length && /\s/.test(content[afterPos])) {
              afterPos++;
            }
            if (!content.substring(afterPos, afterPos + 5).includes('catch')) {
              // Add missing catch block
              content = content.substring(0, pos + 1) + 
                `\n  } catch (error) {\n    console.error('Error:', error);\n    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });\n  }\n}` +
                content.substring(afterPos);
              modified = true;
              break;
            }
          } else if (braceCount === 0) {
            break;
          }
        }
        pos++;
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
    return false;
  }
}

// Function to recursively find route files
function findRouteFiles(dir) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        traverse(fullPath);
      } else if (item === 'route.ts' || item === 'route.js') {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

// Main execution
const apiDir = path.join(__dirname, 'src', 'app', 'api');
const routeFiles = findRouteFiles(apiDir);

console.log(`Found ${routeFiles.length} route files to check...`);

let fixedCount = 0;
for (const file of routeFiles) {
  if (fixRouteFile(file)) {
    fixedCount++;
  }
}

console.log(`Fixed ${fixedCount} out of ${routeFiles.length} route files.`);
