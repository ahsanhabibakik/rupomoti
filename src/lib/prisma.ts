import { PrismaClient } from '@prisma/client'
import { env } from './env'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
}

// Ensure Prisma only runs on server-side and not in Edge Runtime
const createPrismaClient = () => {
  if (typeof window !== 'undefined') {
    throw new Error('PrismaClient cannot be used on the client-side')
  }
  
  // Check if we're in Edge Runtime
  if (process.env.NEXT_RUNTIME === 'edge') {
    throw new Error('PrismaClient cannot be used in Edge Runtime')
  }
  
  if (!env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required')
  }
  
  return new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['error'] : ['error'],
    datasources: {
      db: {
        url: env.DATABASE_URL
      }
    },
    // Add connection pooling configuration
    // __internal: {
    //   engine: {
    //     pool_timeout: 20,
    //     connection_limit: 5,
    //   }
    // }
  })
}

const prismaClient =
  globalForPrisma.prisma ??
  createPrismaClient()

if (env.NODE_ENV !== 'production') globalForPrisma.prisma = prismaClient

export { prismaClient as prisma }

// Re-export the connection check function with retry logic
export async function checkDatabaseConnection(retries = 3): Promise<boolean> {
  // Only run on server-side and not in Edge Runtime
  if (typeof window !== 'undefined' || process.env.NEXT_RUNTIME === 'edge') {
    console.warn('Database connection check skipped on client-side or Edge Runtime')
    return false
  }
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await prismaClient.$connect()
      console.log('✅ Database connection established')
      return true
    } catch (error) {
      console.error(`❌ Database connection attempt ${attempt}/${retries} failed:`, error)
      
      if (attempt === retries) {
        console.error('❌ All database connection attempts failed')
        return false
      }
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
    }
  }
  
  return false
}

// Utility function to execute database operations with retry
export async function withRetry<T>(
  operation: () => Promise<T>,
  retries = 2,
  delay = 1000
): Promise<T> {
  let lastError: any
  
  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      console.error(`Database operation attempt ${attempt}/${retries + 1} failed:`, error)
      
      if (attempt <= retries) {
        await new Promise(resolve => setTimeout(resolve, delay * attempt))
      }
    }
  }
  
  throw lastError
} 