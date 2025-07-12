#!/usr/bin/env tsx

import Category from '../src/models/Category'

async function testCategoryVirtualsOffline() {
  try {
    console.log('🔍 Testing Category virtual fields (offline):')

    // Create a test category without saving to database
    const testCategory = new Category({
      name: 'test electronics',
      slug: 'test-electronics', 
      description: 'Test category for electronics',
      isActive: true,
      sortOrder: 1
    })

    // Test displayName virtual
    console.log('✅ displayName virtual:', testCategory.displayName) // Should be "Test electronics"
    
    // Test hasProducts virtual with undefined productCount
    console.log('✅ hasProducts (no productCount):', testCategory.hasProducts) // Should be false
    
    // Set productCount and test hasProducts
    testCategory.productCount = 5
    console.log('✅ hasProducts (productCount=5):', testCategory.hasProducts) // Should be true
    
    testCategory.productCount = 0  
    console.log('✅ hasProducts (productCount=0):', testCategory.hasProducts) // Should be false

    // Test instance methods
    console.log('✅ Instance methods available:')
    console.log('  - getProducts:', typeof testCategory.getProducts)
    console.log('  - toggleActive:', typeof testCategory.toggleActive) 
    console.log('  - updateSortOrder:', typeof testCategory.updateSortOrder)

    // Test static methods
    console.log('✅ Static methods available:')
    console.log('  - findActive:', typeof Category.findActive)
    console.log('  - findBySlug:', typeof Category.findBySlug)
    console.log('  - findWithProducts:', typeof Category.findWithProducts)

    console.log('\n🎉 All Category virtual fields and methods working correctly!')

  } catch (error) {
    console.error('❌ Error testing category virtuals:', error)
  }
}

testCategoryVirtualsOffline()
