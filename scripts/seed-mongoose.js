#!/usr/bin/env node

const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

// MongoDB connection
const MONGODB_URI = process.env.DATABASE_URL

if (!MONGODB_URI) {
  console.error('DATABASE_URL environment variable is required')
  process.exit(1)
}

// Simple schemas for seeding (without external imports)
const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  image: String,
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
  metaTitle: String,
  metaDescription: String
}, { timestamps: true, collection: 'Category' })

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  price: { type: Number, required: true },
  salePrice: Number,
  sku: { type: String, unique: true },
  stock: { type: Number, default: 0 },
  images: [String],
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  isFeatured: { type: Boolean, default: false },
  isPopular: { type: Boolean, default: false },
  tags: [String],
  weight: Number,
  dimensions: String,
  materials: [String],
  careInstructions: String
}, { timestamps: true, collection: 'Product' })

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: String,
  role: { type: String, enum: ['USER', 'ADMIN', 'SUPER_ADMIN', 'MANAGER'], default: 'USER' },
  isAdmin: { type: Boolean, default: false },
  emailVerified: Date,
  isActive: { type: Boolean, default: true }
}, { timestamps: true, collection: 'User' })

// Sample data
const categories = [
  {
    name: 'Rings',
    slug: 'rings',
    description: 'Elegant and stunning ring collection for every occasion',
    sortOrder: 1,
    metaTitle: 'Ring Collection - Rupomoti Jewelry',
    metaDescription: 'Discover our beautiful collection of rings.'
  },
  {
    name: 'Necklaces',
    slug: 'necklaces',
    description: 'Beautiful necklaces to complement any outfit',
    sortOrder: 2,
    metaTitle: 'Necklace Collection - Rupomoti Jewelry',
    metaDescription: 'Explore our exquisite necklace collection.'
  },
  {
    name: 'Earrings',
    slug: 'earrings',
    description: 'Stunning earring designs for every style',
    sortOrder: 3,
    metaTitle: 'Earring Collection - Rupomoti Jewelry',
    metaDescription: 'Browse our diverse earring collection.'
  },
  {
    name: 'Bracelets',
    slug: 'bracelets',
    description: 'Elegant bracelet designs to adorn your wrists',
    sortOrder: 4,
    metaTitle: 'Bracelet Collection - Rupomoti Jewelry',
    metaDescription: 'Discover our bracelet collection.'
  },
  {
    name: 'Jewelry Sets',
    slug: 'jewelry-sets',
    description: 'Complete jewelry sets for a coordinated look',
    sortOrder: 5,
    metaTitle: 'Jewelry Sets - Rupomoti Jewelry',
    metaDescription: 'Shop our jewelry sets for a perfectly coordinated look.'
  }
]

const products = [
  {
    name: 'Golden Pearl Necklace',
    description: 'Elegant 18K gold necklace with lustrous pearls, perfect for special occasions',
    price: 25000,
    salePrice: 22000,
    sku: 'NECK-001',
    stock: 15,
    images: ['/images/products/necklace-1.jpg', '/images/placeholder.svg'],
    categorySlug: 'necklaces',
    isFeatured: true,
    isPopular: true,
    tags: ['pearl', 'gold', 'elegant', 'formal'],
    materials: ['18K Gold', 'Natural Pearls'],
    careInstructions: 'Store in a dry place, clean with soft cloth'
  },
  {
    name: 'Diamond Engagement Ring',
    description: 'Classic 1 carat diamond engagement ring with platinum band',
    price: 85000,
    salePrice: 79000,
    sku: 'RING-001',
    stock: 8,
    images: ['/images/products/ring-1.jpg', '/images/placeholder.svg'],
    categorySlug: 'rings',
    isFeatured: true,
    isPopular: true,
    tags: ['diamond', 'platinum', 'engagement', 'classic'],
    materials: ['Platinum', '1 Carat Diamond'],
    careInstructions: 'Professional cleaning recommended'
  },
  {
    name: 'Ruby Drop Earrings',
    description: 'Stunning ruby drop earrings with gold settings',
    price: 18000,
    salePrice: 16000,
    sku: 'EAR-001',
    stock: 20,
    images: ['/images/products/earrings-1.jpg', '/images/placeholder.svg'],
    categorySlug: 'earrings',
    isFeatured: false,
    isPopular: true,
    tags: ['ruby', 'gold', 'drop', 'elegant'],
    materials: ['14K Gold', 'Natural Ruby'],
    careInstructions: 'Avoid contact with water and chemicals'
  },
  {
    name: 'Silver Chain Bracelet',
    description: 'Delicate silver chain bracelet with charm accents',
    price: 12000,
    sku: 'BRAC-001',
    stock: 25,
    images: ['/images/products/bracelet-1.jpg', '/images/placeholder.svg'],
    categorySlug: 'bracelets',
    isFeatured: false,
    isPopular: false,
    tags: ['silver', 'chain', 'charm', 'delicate'],
    materials: ['Sterling Silver'],
    careInstructions: 'Polish regularly with silver cloth'
  },
  {
    name: 'Bridal Jewelry Set',
    description: 'Complete bridal set with necklace, earrings, and bracelet',
    price: 45000,
    salePrice: 40000,
    sku: 'SET-001',
    stock: 5,
    images: ['/images/products/set-1.jpg', '/images/placeholder.svg'],
    categorySlug: 'jewelry-sets',
    isFeatured: true,
    isPopular: true,
    tags: ['bridal', 'set', 'gold', 'traditional'],
    materials: ['22K Gold', 'Cubic Zirconia'],
    careInstructions: 'Store in provided box, handle with care'
  }
]

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB')
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error)
    process.exit(1)
  }
}

async function seedCategories() {
  const Category = mongoose.model('Category', CategorySchema)
  
  console.log('🌱 Seeding categories...')
  
  for (const categoryData of categories) {
    try {
      await Category.findOneAndUpdate(
        { slug: categoryData.slug },
        categoryData,
        { upsert: true, new: true }
      )
      console.log(`✅ Category: ${categoryData.name}`)
    } catch (error) {
      console.error(`❌ Failed to seed category ${categoryData.name}:`, error.message)
    }
  }
  
  console.log('✅ Categories seeded successfully')
}

async function seedProducts() {
  const Category = mongoose.model('Category', CategorySchema)
  const Product = mongoose.model('Product', ProductSchema)
  
  console.log('🌱 Seeding products...')
  
  for (const productData of products) {
    try {
      // Find category by slug
      const category = await Category.findOne({ slug: productData.categorySlug })
      if (!category) {
        console.error(`❌ Category ${productData.categorySlug} not found for product ${productData.name}`)
        continue
      }
      
      // Remove categorySlug and add category ID
      const { categorySlug, ...productWithoutSlug } = productData
      productWithoutSlug.category = category._id
      
      // Generate slug from name
      productWithoutSlug.slug = productData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      
      await Product.findOneAndUpdate(
        { sku: productData.sku },
        productWithoutSlug,
        { upsert: true, new: true }
      )
      console.log(`✅ Product: ${productData.name}`)
    } catch (error) {
      console.error(`❌ Failed to seed product ${productData.name}:`, error.message)
    }
  }
  
  console.log('✅ Products seeded successfully')
}

async function seedAdmin() {
  const User = mongoose.model('User', UserSchema)
  
  console.log('🌱 Seeding admin user...')
  
  try {
    const hashedPassword = await bcrypt.hash('admin123', 12)
    
    await User.findOneAndUpdate(
      { email: 'admin@rupomoti.com' },
      {
        name: 'Admin',
        email: 'admin@rupomoti.com',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        isAdmin: true,
        emailVerified: new Date(),
        isActive: true
      },
      { upsert: true, new: true }
    )
    
    console.log('✅ Admin user created successfully')
    console.log('📧 Email: admin@rupomoti.com')
    console.log('🔑 Password: admin123')
  } catch (error) {
    console.error('❌ Failed to seed admin user:', error.message)
  }
}

async function main() {
  try {
    await connectDB()
    
    console.log('🚀 Starting database seeding...')
    
    await seedCategories()
    await seedProducts()
    await seedAdmin()
    
    console.log('🎉 Database seeding completed successfully!')
    
    // Display statistics
    const Category = mongoose.model('Category', CategorySchema)
    const Product = mongoose.model('Product', ProductSchema)
    const User = mongoose.model('User', UserSchema)
    
    const [categoryCount, productCount, userCount] = await Promise.all([
      Category.countDocuments(),
      Product.countDocuments(),
      User.countDocuments()
    ])
    
    console.log('\n📊 Database Statistics:')
    console.log(`📂 Categories: ${categoryCount}`)
    console.log(`🛍️  Products: ${productCount}`)
    console.log(`👤 Users: ${userCount}`)
    
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
    console.log('✅ Database connection closed')
  }
}

// Run the seeding
main()
