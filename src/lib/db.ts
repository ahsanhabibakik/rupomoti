// MongoDB connection and validation utilities

import { parse as parseUrl } from 'url'
import dbConnect from './dbConnect'

// Validate MongoDB connection string
function validateMongoDBUrl(url: string): { isValid: boolean; error?: string } {
  try {
    if (!url) {
      return { isValid: false, error: 'DATABASE_URL is not defined' }
    }

    const parsedUrl = parseUrl(url)
    
    // Check if protocol is mongodb or mongodb+srv
    if (!['mongodb:', 'mongodb+srv:'].includes(parsedUrl.protocol || '')) {
      return { isValid: false, error: 'Invalid protocol. Must be mongodb: or mongodb+srv:' }
    }

    // Check if database name is present
    const pathname = parsedUrl.pathname || ''
    if (!pathname || pathname === '/') {
      return { isValid: false, error: 'Database name is missing in the connection string' }
    }

    // Check if credentials are present
    if (!parsedUrl.auth) {
      return { isValid: false, error: 'Database credentials are missing' }
    }

    return { isValid: true }
  } catch (error) {
    return { isValid: false, error: 'Invalid MongoDB connection string format' }
  }
}

// Initialize database connection
export async function initDatabase() {
  console.log('🔄 Initializing database connection...')

  try {
    // First, check and update schema if needed
    await setupPrisma()

    // Validate DATABASE_URL
    const validation = validateMongoDBUrl(process.env.DATABASE_URL || '')
    if (!validation.isValid) {
      console.error('❌ Invalid DATABASE_URL:', validation.error)
      throw new Error(`Database configuration error: ${validation.error}`)
    }

    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      },
      log: ['error', 'warn'],
      errorFormat: 'pretty'
    })

    // Test connection
    await prisma.$connect()
    console.log('✅ Database connection established')

    // Test collections
    const collections = [
      { name: 'User', query: async () => await prisma.user.findFirst() },
      { name: 'Product', query: async () => await prisma.product.findFirst() },
      { name: 'Category', query: async () => await prisma.category.findFirst() },
      { name: 'Order', query: async () => await prisma.order.findFirst() },
      { name: 'OrderItem', query: async () => await prisma.orderItem.findFirst() },
      { name: 'Customer', query: async () => await prisma.customer.findFirst() },
      { name: 'Media', query: async () => await prisma.media.findFirst() },
      { name: 'Coupon', query: async () => await prisma.coupon.findFirst() },
      { name: 'Settings', query: async () => await prisma.setting.findFirst() }
    ]

    let hasErrors = false
    for (const collection of collections) {
      try {
        await collection.query()
        console.log(`✅ Collection ${collection.name} is accessible`)
      } catch (error) {
        console.error(`❌ Error with collection ${collection.name}:`, error)
        hasErrors = true
      }
    }

    if (hasErrors) {
      console.warn('⚠️ Some collections failed to initialize')
    }

    console.log('✅ Database initialization complete')
    return prisma
  } catch (error) {
    console.error('❌ Failed to initialize database:', error)
    throw error
  }
}

// Export singleton instance
let prisma: PrismaClient | undefined

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient()
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient()
  }
  prisma = global.prisma
}

export default prisma 