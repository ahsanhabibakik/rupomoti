const fs = require('fs');
const path = require('path');

// List of files that need fixing based on the errors
const filesToFix = [
  'src/app/api/admin/audit-logs/route.ts',
  'src/app/api/admin/coupons/bulk-delete/route.ts', 
  'src/app/api/admin/coupons/bulk-update/route.ts',
  'src/app/api/admin/coupons/route.ts',
  'src/app/api/admin/customers/bulk-delete/route.ts'
];

console.log(`Processing ${filesToFix.length} files...`);

filesToFix.forEach(filePath => {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`❌ File not found: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;

    // Fix 1: Remove duplicate try blocks after connectDB()
    const fixDuplicateTry = content.replace(
      /(\s+await connectDB\(\);)\s*try \{/g,
      '$1'
    );
    if (fixDuplicateTry !== content) {
      content = fixDuplicateTry;
      hasChanges = true;
      console.log(`Fixed duplicate try in: ${filePath}`);
    }

    // Fix 2: Remove extra catch blocks }} catch (error) {
    const fixExtraCatch = content.replace(
      /\}\s*\}\s*catch\s*\(\s*error\s*\)\s*\{[^}]*console\.error[^}]*\}/g,
      ''
    );
    if (fixExtraCatch !== content) {
      content = fixExtraCatch;
      hasChanges = true;
      console.log(`Fixed extra catch in: ${filePath}`);
    }

    // Fix 3: Replace 'request' with 'req' in function calls
    const fixRequestParam = content.replace(
      /await request\.json\(\)/g,
      'await req.json()'
    );
    if (fixRequestParam !== content) {
      content = fixRequestParam;
      hasChanges = true;
      console.log(`Fixed request param in: ${filePath}`);
    }

    // Fix 4: Replace 'request.url' with 'req.url'
    const fixRequestUrl = content.replace(
      /new URL\(request\.url\)/g,
      'new URL(req.url)'
    );
    if (fixRequestUrl !== content) {
      content = fixRequestUrl;
      hasChanges = true;
      console.log(`Fixed request.url in: ${filePath}`);
    }

    // Fix 5: Fix authOptions import
    const fixAuthImport = content.replace(
      /import \{ authOptions \} from '@\/app\/auth';/g,
      "import authOptions from '@/app/auth';"
    );
    if (fixAuthImport !== content) {
      content = fixAuthImport;
      hasChanges = true;
      console.log(`Fixed authOptions import in: ${filePath}`);
    }

    if (hasChanges) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
    } else {
      console.log(`No changes needed: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
});

console.log('✅ Syntax fix script completed!');
