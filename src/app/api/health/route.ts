import { NextResponse } from 'next/server'
import prisma, { checkDatabaseConnection } from '@/lib/prisma'
import { checkSteadfastConnection } from '@/lib/steadfast'

export async function GET() {
  const healthStatus = {
    status: 'checking',
    timestamp: new Date().toISOString(),
    services: {
      database: {
        status: 'checking',
        collections: {},
        error: null
      },
      steadfast: {
        status: 'checking',
        error: null
      }
    }
  }

  try {
    // Check database connection and collections
    try {
      await prisma.$connect()
      healthStatus.services.database.status = 'connected'

      // Test collections
      const collections = [
        { name: 'User', query: () => prisma.user.count() },
        { name: 'Product', query: () => prisma.product.count() },
        { name: 'Category', query: () => prisma.category.count() },
        { name: 'Order', query: () => prisma.order.count() },
        { name: 'Customer', query: () => prisma.customer.count() },
        { name: 'Media', query: () => prisma.media.count() },
        { name: 'Coupon', query: () => prisma.coupon.count() },
        { name: 'Settings', query: () => prisma.settings.count() }
      ]

      for (const collection of collections) {
        try {
          const count = await collection.query()
          healthStatus.services.database.collections[collection.name] = {
            status: 'accessible',
            count
          }
        } catch (error) {
          console.error(`Failed to access collection ${collection.name}:`, error)
          healthStatus.services.database.collections[collection.name] = {
            status: 'error',
            error: error.message
          }
        }
      }
    } catch (error) {
      console.error('Database connection failed:', error)
      healthStatus.services.database.status = 'error'
      healthStatus.services.database.error = error.message
    }
    // No disconnect here
  } catch (error) {
    healthStatus.status = 'error'
    healthStatus.services.database.status = 'error'
    healthStatus.services.database.error = error.message
  }

  // Check Steadfast connection
  try {
    const steadfastStatus = await checkSteadfastConnection()
    healthStatus.services.steadfast = steadfastStatus
  } catch (error) {
    healthStatus.services.steadfast.status = 'error'
    healthStatus.services.steadfast.error = error.message
  }

  return NextResponse.json(healthStatus)
} 