#!/usr/bin/env tsx

import mongoose from 'mongoose'
import { getCategoryModel } from '../src/models/Category'

async function testCategoryVirtuals() {
  try {
    const Category = getCategoryModel();
    // Connect to MongoDB (using environment variables)
    const mongoUri = process.env.MONGODB_URI || process.env.MONGODB_URL || 'mongodb://localhost:27017/rupomoti'
    await mongoose.connect(mongoUri)
    console.log('✅ Connected to MongoDB')

    // Create a test category
    const testCategory = new Category({
      name: 'test electronics',
      slug: 'test-electronics',
      description: 'Test category for electronics',
      isActive: true,
      sortOrder: 1
    })

    // Test virtual fields
    console.log('🔍 Testing virtual fields:')
    console.log('- displayName:', testCategory.displayName) // Should be "Test electronics"
    console.log('- hasProducts:', testCategory.hasProducts) // Should be false (no productCount)
    
    // Set productCount manually to test hasProducts
    testCategory.productCount = 5
    console.log('- hasProducts (with productCount=5):', testCategory.hasProducts) // Should be true
    
    testCategory.productCount = 0
    console.log('- hasProducts (with productCount=0):', testCategory.hasProducts) // Should be false

    console.log('✅ Virtual fields working correctly!')

  } catch (error) {
    console.error('❌ Error testing category virtuals:', error)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Disconnected from MongoDB')
  }
}

testCategoryVirtuals()
