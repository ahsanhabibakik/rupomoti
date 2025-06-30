console.log('🔍 Debugging Next.js server issues...')

// Check Node.js version
console.log('Node.js version:', process.version)

// Check if required directories exist
const fs = require('fs')
const path = require('path')

const checkDir = (dirPath) => {
  try {
    const exists = fs.existsSync(dirPath)
    console.log(`📁 ${dirPath}: ${exists ? '✅ exists' : '❌ missing'}`)
    return exists
  } catch (error) {
    console.log(`📁 ${dirPath}: ❌ error - ${error.message}`)
    return false
  }
}

// Check important directories
checkDir('.next')
checkDir('node_modules')
checkDir('src')
checkDir('src/app')
checkDir('src/app/api')

// Check package.json
try {
  const pkg = require('../package.json')
  console.log('📦 Package name:', pkg.name)
  console.log('📦 Next.js version:', pkg.dependencies?.next || 'not found')
} catch (error) {
  console.log('📦 package.json: ❌ error -', error.message)
}

// Check next.config.js
try {
  const config = require('../next.config.js')
  console.log('⚙️ Next.js config loaded successfully')
} catch (error) {
  console.log('⚙️ next.config.js: ❌ error -', error.message)
}

console.log('🔍 Debug complete!')
