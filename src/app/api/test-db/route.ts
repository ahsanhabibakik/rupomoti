import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  let prisma: PrismaClient | null = null
  
  try {
    console.log('Testing database connection with Prisma...')
    
    const databaseUrl = process.env.DATABASE_URL
    if (!databaseUrl) {
      return NextResponse.json({
        status: 'error',
        message: 'DATABASE_URL not found',
        timestamp: new Date().toISOString()
      }, { status: 500 })
    }
    
    // Test Prisma connection
    prisma = new PrismaClient()
    await prisma.$connect()
    console.log('Connected to database via Prisma')
    
    const productCount = await prisma.product.count()
    console.log(`Products found: ${productCount}`)
    
    const categoryCount = await prisma.category.count()
    console.log(`Categories found: ${categoryCount}`)
    
    await prisma.$disconnect()
    
    return NextResponse.json({
      status: 'success',
      message: 'Database connection successful',
      productCount,
      categoryCount,
      timestamp: new Date().toISOString(),
      method: 'Prisma ORM',
      mongoAtlasAccess: 'IP 0.0.0.0/0 is whitelisted'
    })
    
  } catch (error) {
    console.error('Database connection failed:', error)
    
    if (prisma) {
      try {
        await prisma.$disconnect()
      } catch (disconnectError) {
        console.error('Error disconnecting:', disconnectError)
      }
    }
    
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
