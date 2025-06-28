#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get all TypeScript files that contain getServerSession
const files = execSync('grep -r -l "getServerSession" src/', { encoding: 'utf8' })
  .split('\n')
  .filter(file => file.endsWith('.ts') && file.trim())
  .map(file => file.trim());

console.log(`Found ${files.length} files to update:`);
files.forEach(file => console.log(`  ${file}`));

// Update each file
files.forEach(file => {
  if (!fs.existsSync(file)) {
    console.log(`Skipping ${file} - file not found`);
    return;
  }

  try {
    let content = fs.readFileSync(file, 'utf8');
    
    // Skip if it's already been updated (contains import { auth })
    if (content.includes("import { auth } from '@/app/auth'")) {
      console.log(`Skipping ${file} - already updated`);
      return;
    }
    
    // Replace imports
    content = content.replace(
      /import { getServerSession } from ['"]next-auth['"];?\n/g,
      ''
    );
    
    content = content.replace(
      /import { authOptions } from ['"]@\/app\/auth['"];?\n/g,
      ''
    );
    
    // Add the new import at the top (after existing next/server imports if present)
    if (content.includes("import { NextRequest, NextResponse }")) {
      content = content.replace(
        /(import { NextRequest[^}]*} from ['"]next\/server['"];\n)/,
        "$1import { auth } from '@/app/auth';\n"
      );
    } else if (content.includes("import { NextResponse }")) {
      content = content.replace(
        /(import { NextResponse[^}]*} from ['"]next\/server['"];\n)/,
        "$1import { auth } from '@/app/auth';\n"
      );
    } else {
      // Add at the beginning of imports
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
      /const session = await getServerSession\(authOptions\);/g,
      'const session = await auth();'
    );
    
    content = content.replace(
      /const session = await getServerSession\(authOptions\)/g,
      'const session = await auth()'
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
