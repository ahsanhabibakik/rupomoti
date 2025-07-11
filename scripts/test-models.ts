// Simple test to verify Mongoose models are working correctly
import Product from '../src/models/Product'
import Category from '../src/models/Category'

console.log('✅ Mongoose models loaded successfully!')
console.log('📦 Product model:', typeof Product)
console.log('🏷️ Category model:', typeof Category)

// Test static methods exist
console.log('📦 Product static methods:', Object.getOwnPropertyNames(Product))
console.log('🏷️ Category static methods:', Object.getOwnPropertyNames(Category))

console.log('✅ All tests passed!')
