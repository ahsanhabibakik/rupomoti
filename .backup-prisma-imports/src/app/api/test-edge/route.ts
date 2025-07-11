import { NextResponse } from 'next/server'


// Edge Runtime configuration
export const runtime = 'edge'

// Create a new Prisma client instance for edge runtime
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})

export async function GET() {
  try {
    console.log('Testing Edge Runtime DB Connection...')
    
    // Test basic connection
    await prisma.$connect()
    console.log('Edge: Connected to database successfully')
    
    // Test simple query
    const productCount = await prisma.product.count()
    console.log('Edge: Product count:', productCount)
    
    // Test category query
    const categoryCount = await prisma.category.count()
    console.log('Edge: Category count:', categoryCount)
    
    await prisma.$disconnect()
    
    return NextResponse.json({
      status: 'success',
      message: 'Edge runtime database connection successful',
      data: {
        productCount,
        categoryCount,
        runtime: 'edge',
        timestamp: new Date().toISOString()
      }
    })
    
  } catch (error: unknown) {
    console.error('Edge DB Error:', error)
    
    await prisma.$disconnect()
    
    return NextResponse.json({
      status: 'error',
      message: 'Edge runtime database connection failed',
      error: error instanceof Error ? error.message : String(error),
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      timestamp: new Date().toISOString(),
      runtime: 'edge'
    }, { status: 500 })
  }
}
