#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

// Get all TypeScript files that contain getAuthSession
const files = execSync('grep -r -l "getAuthSession" src/', { encoding: 'utf8' })
  .split('\n')
  .filter(file => file.endsWith('.ts') && file.trim())
  .map(file => file.trim());

console.log(`Found ${files.length} files with getAuthSession to update:`);
files.forEach(file => console.log(`  ${file}`));

// Update each file
files.forEach(file => {
  if (!fs.existsSync(file)) {
    console.log(`Skipping ${file} - file not found`);
    return;
  }

  try {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace import statements
    content = content.replace(
      /import { getAuthSession } from ['"]@\/lib\/auth['"];?\n/g,
      ''
    );
    
    // Add the auth import if not already present
    if (!content.includes("import { auth } from '@/app/auth'")) {
      // Add after existing imports
      const importRegex = /(^import [^;]+;\n)/m;
      if (importRegex.test(content)) {
        content = content.replace(importRegex, "$1import { auth } from '@/app/auth';\n");
      } else {
        // If no imports, add at the top
        content = "import { auth } from '@/app/auth';\n" + content;
      }
    }
    
    // Replace function calls
    content = content.replace(
      /const session = await getAuthSession\(\)/g,
      'const session = await auth()'
    );
    
    content = content.replace(
      /await getAuthSession\(\)/g,
      'await auth()'
    );
    
    // Clean up extra blank lines
    content = content.replace(/\n\n\n+/g, '\n\n');
    
    fs.writeFileSync(file, content);
    console.log(`✅ Updated ${file}`);
    
  } catch (error) {
    console.error(`❌ Error updating ${file}:`, error.message);
  }
});

console.log('\nUpdate complete!');
