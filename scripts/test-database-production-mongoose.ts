/**
 * Test database connectivity in production environment
 */

import mongoose from 'mongoose'
import Product from '../src/models/Product'
import Category from '../src/models/Category'

async function testDatabaseConnection() {
  console.log('🔍 Testing Database Connection in Production Environment...\n')
  
  const mongoUri = process.env.MONGODB_URI
  
  if (!mongoUri) {
    console.log('❌ MONGODB_URI environment variable not set')
    return
  }
  
  console.log('🔗 MongoDB URI:', mongoUri.replace(/:[^:@]*@/, ':***@'))
  
  try {
    console.log('⏳ Attempting to connect to database via Mongoose...')
    
    // Test basic connection
    await mongoose.connect(mongoUri)
    console.log('✅ Successfully connected to database!')
    
    // Test counting products
    const productCount = await Product.countDocuments()
    console.log(`📦 Products in database: ${productCount}`)
    
    // Test counting categories
    const categoryCount = await Category.countDocuments()
    console.log(`🏷️ Categories in database: ${categoryCount}`)
    
    // Test fetching one product
    const sampleProduct = await Product.findOne({}, {
      name: 1,
      price: 1,
      status: 1
    })
    
    if (sampleProduct) {
      console.log('✅ Sample product found:', {
        id: sampleProduct._id,
        name: sampleProduct.name,
        price: sampleProduct.price,
        status: sampleProduct.status
      })
    }
    
    await mongoose.disconnect()
    console.log('✅ Database connection test passed!')
    
  } catch (error: unknown) {
    console.log('❌ Database connection failed:')
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.log('Error:', errorMessage)
    
    if (errorMessage.includes('IP') || errorMessage.includes('not allowed')) {
      console.log('\n💡 This looks like an IP whitelist issue!')
      console.log('📝 To fix this:')
      console.log('1. Go to MongoDB Atlas Dashboard')
      console.log('2. Navigate to Network Access')
      console.log('3. Add 0.0.0.0/0 to allow all IPs (for testing)')
      console.log('4. Or add your current IP to the whitelist')
    }
    
    if (errorMessage.includes('authentication') || errorMessage.includes('credentials')) {
      console.log('\n💡 This looks like an authentication issue!')
      console.log('📝 To fix this:')
      console.log('1. Check your MongoDB username and password')
      console.log('2. Verify MONGODB_URI format: mongodb+srv://username:password@cluster.mongodb.net/database')
      console.log('3. Make sure the database user has proper permissions')
    }
    
    if (errorMessage.includes('timeout') || errorMessage.includes('ENOTFOUND')) {
      console.log('\n💡 This looks like a network connectivity issue!')
      console.log('📝 To fix this:')
      console.log('1. Check your internet connection')
      console.log('2. Verify the MongoDB cluster URL is correct')
      console.log('3. Try connecting from a different network')
    }
    
    await mongoose.disconnect().catch(() => {})
  }
}

// Run the test
testDatabaseConnection().catch(console.error)
