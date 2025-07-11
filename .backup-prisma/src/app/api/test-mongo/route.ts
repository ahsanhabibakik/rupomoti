import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    console.log('Testing database connection with MongoDB client...')
    
    const databaseUrl = process.env.DATABASE_URL
    if (!databaseUrl) {
      return NextResponse.json({
        status: 'error',
        message: 'DATABASE_URL not found',
        timestamp: new Date().toISOString()
      }, { status: 500 })
    }
    
    // Test direct MongoDB connection
    const client = new MongoClient(databaseUrl, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    })
    
    console.log('Attempting to connect to MongoDB...')
    await client.connect()
    console.log('Connected to MongoDB successfully')
    
    const db = client.db()
    console.log('Database name:', db.databaseName)
    
    // Test collection access
    const collections = await db.listCollections().toArray()
    console.log('Available collections:', collections.map((c) => c.name))
    
    const productCount = await db.collection('Product').countDocuments()
    console.log(`Products found: ${productCount}`)
    
    const categoryCount = await db.collection('Category').countDocuments()
    console.log(`Categories found: ${categoryCount}`)
    
    await client.close()
    console.log('MongoDB connection closed')
    
    return NextResponse.json({
      status: 'success',
      message: 'Database connection successful',
      data: {
        productCount,
        categoryCount,
        collections: collections.map((c) => c.name),
        databaseName: db.databaseName
      },
      timestamp: new Date().toISOString(),
      method: 'Direct MongoDB'
    })
    
  } catch (error) {
    console.error('Database connection failed:', error)
    
    // Get detailed error information
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorName = error instanceof Error ? error.name : 'Unknown'
    
    return NextResponse.json({
      status: 'error',
      message: 'Database connection failed',
      error: errorMessage,
      errorType: errorName,
      timestamp: new Date().toISOString(),
      databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set',
      mongoAtlasAccess: 'IP 0.0.0.0/0 is whitelisted'
    }, { status: 500 })
  }
}
