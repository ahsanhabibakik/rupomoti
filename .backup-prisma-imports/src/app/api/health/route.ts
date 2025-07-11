import { NextResponse } from 'next/server'
import { withMongoose, parseQueryParams, getPaginationParams } from '@/lib/mongoose-utils';

import { env } from '@/lib/env'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  const healthStatus = {
    status: 'checking',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    services: {
      database: {
        status: 'checking',
        collections: {},
        error: null
      },
      environment: {
        status: 'checking',
        variables: {
          DATABASE_URL: !!env.DATABASE_URL,
          NEXTAUTH_SECRET: !!env.NEXTAUTH_SECRET,
          NEXTAUTH_URL: !!env.NEXTAUTH_URL,
        }
      }
    }
  }

  try {
    // Check database connection and collections
    try {
      const dbConnectionResult = await checkDatabaseConnection(2)
      healthStatus.services.database.status = dbConnectionResult ? 'connected' : 'error'

      // Test critical collections with timeout
      const timeoutPromise = (ms: number) => new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout')), ms)
      )
      
      // Test only critical collections to avoid timeouts
      const collections = [
        { name: 'User', query: () => prisma.user.count() },
        { name: 'Product', query: () => prisma.product.count() },
        { name: 'Category', query: () => prisma.category.count() },
        { name: 'Order', query: () => prisma.order.count() }
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