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
    } finally {
      await prisma.$disconnect()
    }

    // Check Steadfast API connection
    try {
      const isConnected = await checkSteadfastConnection()
      healthStatus.services.steadfast.status = isConnected ? 'connected' : 'error'
    } catch (error) {
      console.error('Steadfast API check failed:', error)
      healthStatus.services.steadfast.status = 'error'
      healthStatus.services.steadfast.error = error.message
    }

    // Determine overall status
    const allServices = [
      healthStatus.services.database.status,
      healthStatus.services.steadfast.status
    ]

    if (allServices.every(status => status === 'connected')) {
      healthStatus.status = 'healthy'
    } else if (allServices.some(status => status === 'error')) {
      healthStatus.status = 'unhealthy'
    } else {
      healthStatus.status = 'degraded'
    }

    // Log the health check results
    console.log('Health Check Results:', JSON.stringify(healthStatus, null, 2))

    return NextResponse.json(healthStatus, {
      status: healthStatus.status === 'healthy' ? 200 : 503
    })
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error.message
      },
      { status: 500 }
    )
  }
} 