import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ['error'],
    errorFormat: 'pretty',
  })
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma
}

// Export both named and default
export { prisma }
export default prisma

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