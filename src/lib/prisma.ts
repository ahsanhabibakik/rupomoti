import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Re-export the connection check function
export async function checkDatabaseConnection() {
  try {
    await prisma.$connect()
    console.log('✅ Database connection established')
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    return false
  }
}

// Only check connection in development
if (process.env.NODE_ENV === 'development') {
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