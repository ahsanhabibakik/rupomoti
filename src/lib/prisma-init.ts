import { PrismaClient } from '@prisma/client'
import { createHash } from 'crypto'
import fs from 'fs'
import path from 'path'

declare global {
  var prisma: PrismaClient | undefined
}

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ['error', 'warn'],
  })
}

const prisma = global.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}

// Function to get schema hash
function getSchemaHash(): string {
  const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma')
  const schemaContent = fs.readFileSync(schemaPath, 'utf-8')
  return createHash('md5').update(schemaContent).digest('hex')
}

// Function to save schema hash
function saveSchemaHash(hash: string) {
  const hashPath = path.join(process.cwd(), '.schema-hash')
  fs.writeFileSync(hashPath, hash)
}

// Function to get saved schema hash
function getSavedSchemaHash(): string | null {
  const hashPath = path.join(process.cwd(), '.schema-hash')
  try {
    return fs.readFileSync(hashPath, 'utf-8')
  } catch {
    return null
  }
}

// Initialize database connection and handle schema updates
export async function initializeDatabase() {
  try {
    const currentHash = getSchemaHash()
    const savedHash = getSavedSchemaHash()

    // Check if schema has changed
    if (currentHash !== savedHash) {
      console.log('🔄 Schema changes detected, updating...')
      
      if (process.env.NODE_ENV === 'production') {
        console.warn('⚠️ Schema changes detected in production. Please run migrations manually.')
      } else {
        try {
          // In development, automatically push schema changes
          const { execSync } = require('child_process')
          execSync('npx prisma generate', { stdio: 'inherit' })
          execSync('npx prisma db push', { stdio: 'inherit' })
          
          // Save new schema hash only if commands succeed
          saveSchemaHash(currentHash)
          console.log('✅ Schema successfully updated')
        } catch (error) {
          console.error('❌ Failed to update schema:', error)
          // Don't throw here, try to continue with existing schema
        }
      }
    }

    // Test database connection
    await prisma.$connect()
    console.log('✅ Database connection established')

    return prisma
  } catch (error) {
    console.error('❌ Failed to initialize database:', error)
    throw error
  }
}

export default prisma 