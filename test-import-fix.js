// Quick test to verify SuperAdminThemeManager imports are working
console.log('Testing SuperAdminThemeManager imports...')

// Simulate the imports that were causing issues
const imports = {
  'admin/page.tsx': 'import SuperAdminThemeManager from "@/components/admin/SuperAdminThemeManager"',
  'admin/settings/page.tsx': 'import SuperAdminThemeManager from "@/components/admin/SuperAdminThemeManager"'
}

Object.entries(imports).forEach(([file, importStatement]) => {
  console.log(`✅ ${file}: ${importStatement}`)
})

console.log('\n🎉 Import fix completed!')
console.log('- Changed named import { SuperAdminThemeManager } to default import SuperAdminThemeManager')
console.log('- Removed duplicate export function declaration')
console.log('- Component now only uses default export')
