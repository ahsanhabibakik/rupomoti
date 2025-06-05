import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

// Function to calculate schema hash
function getSchemaHash(): string {
  const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma')
  const schemaContent = fs.readFileSync(schemaPath, 'utf-8')
  return crypto.createHash('md5').update(schemaContent).digest('hex')
}

// Function to get/set last known schema hash
function getLastKnownHash(): string | null {
  try {
    const hashPath = path.join(process.cwd(), 'node_modules', '.prisma-schema-hash')
    if (fs.existsSync(hashPath)) {
      return fs.readFileSync(hashPath, 'utf-8')
    }
  } catch (error) {
    console.error('Error reading schema hash:', error)
  }
  return null
}

function saveCurrentHash(hash: string) {
  try {
    const hashPath = path.join(process.cwd(), 'node_modules', '.prisma-schema-hash')
    fs.writeFileSync(hashPath, hash)
  } catch (error) {
    console.error('Error saving schema hash:', error)
  }
}

// Main setup function
export async function setupPrisma() {
  console.log('🔄 Checking Prisma schema status...')
  
  const currentHash = getSchemaHash()
  const lastHash = getLastKnownHash()

  // Check if schema has changed
  if (currentHash !== lastHash) {
    console.log('📦 Schema changes detected, updating...')
    
    try {
      // Run Prisma generate
      console.log('⚙️ Generating Prisma Client...')
      execSync('npx prisma generate', { stdio: 'inherit' })

      // Run database push in development only
      if (process.env.NODE_ENV !== 'production') {
        console.log('🔄 Pushing schema changes to database...')
        execSync('npx prisma db push', { stdio: 'inherit' })
      } else {
        console.warn('⚠️ Schema changes detected in production. Please run migrations manually.')
      }

      // Save new hash
      saveCurrentHash(currentHash)
      console.log('✅ Schema successfully updated')
    } catch (error) {
      console.error('❌ Error updating schema:', error)
      throw error
    }
  } else {
    console.log('✅ Schema is up to date')
  }
} 