import { PrismaClient } from '@prisma/client'

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
  
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })
}

const prismaClient =
  globalForPrisma.prisma ??
  createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prismaClient

export { prismaClient as prisma }

// Re-export the connection check function
export async function checkDatabaseConnection() {
  // Only run on server-side and not in Edge Runtime
  if (typeof window !== 'undefined' || process.env.NEXT_RUNTIME === 'edge') {
    console.warn('Database connection check skipped on client-side or Edge Runtime')
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

// Only check connection in development and on server-side (not Edge Runtime)
if (process.env.NODE_ENV === 'development' && typeof window === 'undefined' && process.env.NEXT_RUNTIME !== 'edge') {
  // Reduce connection check frequency to avoid spam
  let connectionChecked = false;
  if (!connectionChecked) {
    checkDatabaseConnection()
      .then((isConnected) => {
        if (isConnected) {
          connectionChecked = true;
          console.log('✅ Initial database connection verified');
        } else {
          console.error('❌ Initial database connection check failed');
        }
      })
      .catch((error) => {
        console.error('❌ Unexpected error during database connection check:', error);
      });
  }
} 