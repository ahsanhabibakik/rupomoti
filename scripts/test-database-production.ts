/**
 * Test database connectivity in production environment
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testDatabaseConnection() {
  console.log('🔍 Testing Database Connection in Production Environment...\n')
  
  const databaseUrl = process.env.DATABASE_URL
  
  if (!databaseUrl) {
    console.log('❌ DATABASE_URL environment variable not set')
    return
  }
  
  console.log('🔗 Database URL:', databaseUrl.replace(/:[^:@]*@/, ':***@'))
  
  try {
    console.log('⏳ Attempting to connect to database via Prisma...')
    
    // Test basic connection
    await prisma.$connect()
    console.log('✅ Successfully connected to database!')
    
    // Test counting products
    const productCount = await prisma.product.count()
    console.log(`� Products in database: ${productCount}`)
    
    // Test counting categories
    const categoryCount = await prisma.category.count()
    console.log(`🏷️ Categories in database: ${categoryCount}`)
    
    // Test fetching one product
    const sampleProduct = await prisma.product.findFirst({
      select: {
        id: true,
        name: true,
        price: true,
        status: true
      }
    })
    
    if (sampleProduct) {
      console.log('✅ Sample product found:', sampleProduct)
    }
    
    await prisma.$disconnect()
    console.log('✅ Database connection test passed!')
    
  } catch (error: unknown) {
    console.log('❌ Database connection failed:')
    console.log('Error:', error?.message || error)
    
    if (error?.message?.includes('IP')) {
      console.log('\n💡 This looks like an IP whitelist issue!')
      console.log('📝 To fix this:')
      console.log('1. Go to MongoDB Atlas Dashboard')
      console.log('2. Navigate to Network Access')
      console.log('3. Add 0.0.0.0/0 to allow all IPs (for testing)')
      console.log('4. Or add Vercel\'s IP ranges')
    }
    
    if (error?.message?.includes('authentication') || error?.message?.includes('credentials')) {
      console.log('\n💡 This looks like an authentication issue!')
      console.log('📝 Check your database username and password')
    }
    
    if (error?.message?.includes('timeout') || error?.message?.includes('ENOTFOUND')) {
      console.log('\n💡 This looks like a network connectivity issue!')
      console.log('📝 Check if MongoDB Atlas allows connections from your current IP')
    }
  }
}

// Run the test
testDatabaseConnection().catch(console.error)
