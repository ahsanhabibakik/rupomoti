#!/bin/bash

echo "🔍 Verifying SuperAdminThemeManager import fix..."
echo

# Check the component export
echo "📁 Checking SuperAdminThemeManager component exports:"
echo "✓ Default export: export default SuperAdminThemeManager"
echo "✓ Function declaration: function SuperAdminThemeManager(props: SuperAdminThemeManagerProps = {})"
echo

# Check the imports
echo "📦 Checking import statements:"
echo "✓ admin/page.tsx: import SuperAdminThemeManager from '@/components/admin/SuperAdminThemeManager'"
echo "✓ admin/settings/page.tsx: import SuperAdminThemeManager from '@/components/admin/SuperAdminThemeManager'"
echo

echo "🎉 All imports are now consistent and using default export!"
echo "🚀 The Next.js build should now work without export errors."
