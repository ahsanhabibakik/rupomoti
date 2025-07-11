import mongoose from 'mongoose'
import { Product, IProduct } from '../src/models/Product'
import { Category, ICategory } from '../src/models/Category'

async function testProductFetch() {
  try {
    console.log('🧪 Testing product fetching...')
    
    // Connect to database
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is required')
    }
    await mongoose.connect(process.env.MONGODB_URI)
    
    // 1. Test basic product query (like shop page)
    console.log('\n1. Testing shop page query...')
    const shopProducts = await Product.find({
      status: 'ACTIVE',
      stock: { $gt: 0 }
    })
      .populate('categoryId', 'name')
      .limit(5)
      .sort({ createdAt: -1 })
    
    console.log(`✅ Shop query returned ${shopProducts.length} products`)
    if (shopProducts.length > 0) {
      console.log(`   Sample: "${shopProducts[0].name}" - ৳${shopProducts[0].price}`)
    }
    
    // 2. Test homepage featured products
    console.log('\n2. Testing featured products...')
    const featuredProducts = await Product.find({
      status: 'ACTIVE',
      isFeatured: true,
      stock: { $gt: 0 }
    })
      .populate('categoryId', 'name')
      .limit(4)
    
    console.log(`✅ Featured query returned ${featuredProducts.length} products`)
    
    // 3. Test new arrivals
    console.log('\n3. Testing new arrivals...')
    const newArrivals = await Product.find({
      status: 'ACTIVE',
      isNewArrival: true,
      stock: { $gt: 0 }
    })
      .populate('categoryId', 'name')
      .limit(4)
    
    console.log(`✅ New arrivals query returned ${newArrivals.length} products`)
    
    // 4. Test categories
    console.log('\n4. Testing categories...')
    const categories = await Category.find({
      isActive: true
    }).sort({ sortOrder: 1 }).limit(5)
    
    console.log(`✅ Categories query returned ${categories.length} categories`)
    for (const cat of categories) {
      const productCount = await Product.countDocuments({
        categoryId: cat._id,
        status: 'ACTIVE'
      })
      console.log(`   ${cat.name}: ${productCount} products`)
    }
    
    // 5. Check for problematic data
    console.log('\n5. Checking for issues...')
    
    const productsWithoutImages = await Product.countDocuments({
      status: 'ACTIVE',
      $or: [
        { images: { $exists: false } },
        { images: { $size: 0 } }
      ]
    })
    console.log(`⚠️  Products without images: ${productsWithoutImages}`)
    
    const productsWithBadPrices = await Product.countDocuments({
      status: 'ACTIVE',
      $or: [
        { price: { $lte: 0 } },
        { price: { $exists: false } }
      ]
    })
    console.log(`⚠️  Products with bad prices: ${productsWithBadPrices}`)
    
    const allCategories = await Category.find({ isActive: true })
    let categoriesWithoutProducts = 0
    
    for (const category of allCategories) {
      const productCount = await Product.countDocuments({
        categoryId: category._id,
        status: 'ACTIVE'
      })
      if (productCount === 0) {
        categoriesWithoutProducts++
      }
    }
    console.log(`⚠️  Empty categories: ${categoriesWithoutProducts}`)
    
    console.log('\n✅ Product fetch test complete!')
    
  } catch (error) {
    console.error('❌ Product fetch test failed:', error)
  } finally {
    await mongoose.disconnect()
  }
}

// Run the test
testProductFetch().catch(console.error)
