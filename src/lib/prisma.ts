import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
}

// Ensure Prisma only runs on server-side
const createPrismaClient = () => {
  if (typeof window !== 'undefined') {
    throw new Error('PrismaClient cannot be used on the client-side')
  }
  
  return new PrismaClient({
    log: ['query'],
  })
}

const prismaClient =
  globalForPrisma.prisma ??
  createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prismaClient

export { prismaClient as prisma }

// Re-export the connection check function
export async function checkDatabaseConnection() {
  // Only run on server-side
  if (typeof window !== 'undefined') {
    console.warn('Database connection check skipped on client-side')
    return false
  }
  
  try {
    await prismaClient.$connect()
    console.log('✅ Database connection established')
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    return false
  }
}

// Only check connection in development and on server-side
if (process.env.NODE_ENV === 'development' && typeof window === 'undefined') {
  checkDatabaseConnection()
    .then((isConnected) => {
      if (!isConnected) {
        console.error('❌ Initial database connection check failed')
      }
    })
    .catch((error) => {
      console.error('❌ Unexpected error during database connection check:', error)
    })
} 