import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import Product from '@/models/Product'
import Category from '@/models/Category'
import Order from '@/models/Order'
import { env } from '@/lib/env'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function checkDatabaseConnection(retries = 3): Promise<boolean> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      if (!mongoose.connection.readyState) {
        await mongoose.connect(process.env.MONGODB_URI!)
      }
      return true
    } catch (error) {
      console.error(`Database connection attempt ${attempt}/${retries} failed:`, error)
      if (attempt === retries) {
        return false
      }
    }
  }
  return false
}

interface HealthStatus {
  status: string;
  timestamp: string;
  environment: string;
  services: {
    database: {
      status: string;
      collections: Record<string, { status: string; count?: number; error?: string }>;
      error: string | null;
    };
    environment: {
      status: string;
      variables: Record<string, boolean>;
      missing?: string[];
    };
  };
}

export async function GET() {
  const healthStatus: HealthStatus = {
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
          MONGODB_URI: !!process.env.MONGODB_URI,
          NEXTAUTH_SECRET: !!env.NEXTAUTH_SECRET,
          NEXTAUTH_URL: !!env.NEXTAUTH_URL,
        }
      }
    }
  }

  try {
    // Check database connection
    try {
      const dbConnectionResult = await checkDatabaseConnection(2)
      healthStatus.services.database.status = dbConnectionResult ? 'connected' : 'error'

      if (dbConnectionResult) {
        // Test critical collections with timeout
        const timeoutPromise = (ms: number) => new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Query timeout')), ms)
        )
        
        // Test only critical collections to avoid timeouts
        const collections = [
          { name: 'Product', query: () => Product.countDocuments() },
          { name: 'Category', query: () => Category.countDocuments() },
          { name: 'Order', query: () => Order.countDocuments() }
        ]
  
        for (const collection of collections) {
          try {
            // Set 2 second timeout for each query
            const result = await Promise.race([
              collection.query(),
              timeoutPromise(2000)
            ])
            
            healthStatus.services.database.collections[collection.name] = {
              status: 'accessible',
              count: result
            }
          } catch (error) {
            console.error(`Failed to access collection ${collection.name}:`, error)
            healthStatus.services.database.collections[collection.name] = {
              status: 'error',
              error: error instanceof Error ? error.message : 'Unknown error'
            }
          }
        }
      } else {
        healthStatus.services.database.error = 'Connection test failed'
      }
    } catch (error) {
      console.error('Database connection failed:', error)
      healthStatus.services.database.status = 'error'
      healthStatus.services.database.error = error instanceof Error ? error.message : 'Unknown error'
    }

    // Check environment variables
    const requiredVars = ['MONGODB_URI', 'NEXTAUTH_SECRET', 'NEXTAUTH_URL']
    const missingVars = requiredVars.filter(v => !process.env[v])
    
    healthStatus.services.environment.status = missingVars.length > 0 ? 'warning' : 'ok'
    healthStatus.services.environment.variables = {
      MONGODB_URI: !!process.env.MONGODB_URI,
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: !!process.env.NEXTAUTH_URL
    }
    
    if (missingVars.length > 0) {
      healthStatus.services.environment.missing = missingVars
    }

    // Final health determination
    healthStatus.status = healthStatus.services.database.status === 'error' ? 'unhealthy' : 'healthy'

    return NextResponse.json(healthStatus, {
      status: healthStatus.status === 'healthy' ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    })
  } catch (error) {
    healthStatus.status = 'error'
    return NextResponse.json(
      {
        ...healthStatus,
        error: error instanceof Error ? error.message : 'Unknown system error',
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    )
  }
}
