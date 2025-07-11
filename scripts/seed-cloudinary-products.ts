import mongoose from 'mongoose'
import { sampleProducts } from '../src/data/sample-products'

// MongoDB connection URL
const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb+srv://rupomotibusiness:pGhePonAlcVB3sf0@cluster0.p0tpuuo.mongodb.net/rupomoti?retryWrites=true&w=majority'

// Simple MongoDB connection function
async function connectToMongoDB() {
  if (!MONGODB_URI) {
    throw new Error('MongoDB URI is required')
  }
  await mongoose.connect(MONGODB_URI)
}

// Product Schema (matching the existing schema)
const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  price: { type: Number, required: true },
  salePrice: { type: Number },
  images: [{ type: String, required: true }],
  category: { type: String, required: true },
  isFeatured: { type: Boolean, default: false },
  isPopular: { type: Boolean, default: false },
  isNewArrival: { type: Boolean, default: false },
  stock: { type: Number, required: true, default: 0 },
  sku: { type: String, required: true, unique: true },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'DRAFT'], default: 'ACTIVE' }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Add virtual for id
ProductSchema.virtual('id').get(function() {
  return this._id.toHexString()
})

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema)

async function seedProducts() {
  console.log('🌱 Starting product seeding with Cloudinary images...')
  
  try {
    // Connect to MongoDB
    await connectToMongoDB()
    console.log('✅ Connected to MongoDB')

    // Clear existing products (optional - comment out if you want to keep existing data)
    await Product.deleteMany({})
    console.log('🗑️  Cleared existing products')

    // Insert sample products
    const insertedProducts = await Product.insertMany(sampleProducts.map(product => ({
      ...product,
      _id: new mongoose.Types.ObjectId(),
      createdAt: new Date(),
      updatedAt: new Date()
    })))

    console.log(`✅ Successfully inserted ${insertedProducts.length} products`)

    // Display inserted products
    insertedProducts.forEach(product => {
      console.log(`  📦 ${product.name} (${product.sku})`)
      console.log(`     💰 Price: $${product.price} ${product.salePrice ? `(Sale: $${product.salePrice})` : ''}`)
      console.log(`     🖼️  Images: ${product.images.length} Cloudinary images`)
      console.log(`     📊 Stock: ${product.stock}`)
      console.log('')
    })

  } catch (error) {
    console.error('❌ Error seeding products:', error)
    process.exit(1)
  }
}

async function main() {
  await seedProducts()
  console.log('🎉 Product seeding completed!')
  process.exit(0)
}

main().catch(console.error)
