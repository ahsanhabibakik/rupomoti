import dbConnect from '../src/lib/mongoose'
import { getProductModel } from '../src/models/Product'
import { getCategoryModel } from '../src/models/Category'

const Product = getProductModel();
const Category = getCategoryModel();

async function testMongoose() {
  try {
    console.log('🔗 Connecting to MongoDB via Mongoose...')
    await dbConnect()
    console.log('✅ Connected successfully!')

    // Test Product model
    console.log('\n📦 Testing Product model...')
    const productCount = await Product.countDocuments({ status: 'ACTIVE' })
    console.log(`Found ${productCount} active products`)

    if (productCount > 0) {
      const firstProduct = await Product.findOne({ status: 'ACTIVE' }).lean()
      console.log('Sample product:', {
        id: firstProduct?._id,
        name: firstProduct?.name,
        price: firstProduct?.price
      })
    }

    // Test Category model
    console.log('\n📂 Testing Category model...')
    const categoryCount = await Category.countDocuments({ isActive: true })
    console.log(`Found ${categoryCount} active categories`)

    if (categoryCount > 0) {
      const firstCategory = await Category.findOne({ isActive: true }).lean()
      console.log('Sample category:', {
        id: firstCategory?._id,
        name: firstCategory?.name,
        slug: firstCategory?.slug
      })
    }

    console.log('\n🎉 Mongoose migration successful!')
    
  } catch (error) {
    console.error('❌ Mongoose test failed:', error)
  } finally {
    process.exit(0)
  }
}

testMongoose()
