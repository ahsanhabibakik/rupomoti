/**
 * Simple database connectivity test for production
 */

import mongoose from 'mongoose'
import Product from '../src/models/Product'

async function testDatabase() {
  console.log('🔍 Testing Database Connection...\n')
  
  const mongoUri = process.env.MONGODB_URI
  
  if (!mongoUri) {
    console.log('❌ MONGODB_URI environment variable not set')
    process.exit(1)
  }
  
  console.log('🔗 MongoDB URI:', mongoUri.replace(/:[^:@]*@/, ':***@'))
  
  try {
    console.log('⏳ Connecting to database...')
    await mongoose.connect(mongoUri)
    console.log('✅ Connected successfully!')
    
    console.log('⏳ Testing query...')
    const productCount = await Product.countDocuments()
    console.log(`📦 Products in database: ${productCount}`)
    
    await mongoose.disconnect()
    console.log('✅ Simple database test completed successfully!')
    
  } catch (error) {
    console.error('❌ Database test failed:', error)
    await mongoose.disconnect().catch(() => {})
    process.exit(1)
  }
}

// Run the test
testDatabase().catch((error) => {
  console.error('❌ Unexpected error:', error)
  process.exit(1)
})
