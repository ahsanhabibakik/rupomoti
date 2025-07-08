/**
 * Simple database connectivity test for production
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testDatabase() {
  console.log('🔍 Testing Database Connection...\n')
  
  const databaseUrl = process.env.DATABASE_URL
  
  if (!databaseUrl) {
    console.log('❌ DATABASE_URL environment variable not set')
    process.exit(1)
  }
  
  console.log('🔗 Database URL:', databaseUrl.replace(/:[^:@]*@/, ':***@'))
  
  try {
    console.log('⏳ Connecting to database...')
    await prisma.$connect()
    console.log('✅ Connected successfully!')
    
    console.log('⏳ Testing query...')
    const productCount = await prisma.product.count()
    console.log(`📦 Products in database: ${productCount}`)
    
    await prisma.$disconnect()
    console.log('✅ Test completed successfully!')
    
  } catch (error) {
    console.log('❌ Database connection failed!')
    console.log('Error:', error)
    
    const errorStr = String(error)
    
    if (errorStr.includes('IP') || errorStr.includes('not authorized')) {
      console.log('\n💡 This is likely an IP whitelist issue!')
      console.log('🔧 Go to MongoDB Atlas → Network Access → Add IP 0.0.0.0/0')
    }
    
    if (errorStr.includes('authentication') || errorStr.includes('credential')) {
      console.log('\n💡 This is likely an authentication issue!')
      console.log('🔧 Check your DATABASE_URL credentials')
    }
    
    process.exit(1)
  }
}

testDatabase().then(() => {
  console.log('Done.')
}).catch(console.error)
