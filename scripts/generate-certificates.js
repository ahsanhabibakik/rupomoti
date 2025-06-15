const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

// Create certificates directory if it doesn't exist
const certsDir = path.join(__dirname, '..', 'certificates')
if (!fs.existsSync(certsDir)) {
  fs.mkdirSync(certsDir)
}

// Generate certificates using mkcert
try {
  console.log('Generating SSL certificates...')
  
  // Check if mkcert is installed
  try {
    execSync('mkcert -version')
  } catch (e) {
    console.log('mkcert is not installed. Please install it first:')
    console.log('Windows (using chocolatey): choco install mkcert')
    console.log('macOS: brew install mkcert')
    console.log('Linux: sudo apt install mkcert')
    process.exit(1)
  }

  // Install local CA
  execSync('mkcert -install', { stdio: 'inherit' })

  // Generate certificates for localhost
  execSync(`mkcert -key-file ${path.join(certsDir, 'localhost-key.pem')} -cert-file ${path.join(certsDir, 'localhost.pem')} localhost`, { stdio: 'inherit' })

  console.log('Certificates generated successfully!')
} catch (error) {
  console.error('Error generating certificates:', error)
  process.exit(1)
} 