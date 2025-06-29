import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting to seed the database...')

  // Create categories
  console.log('📦 Creating categories...')
  
  const jewelryCategory = await prisma.category.create({
    data: {
      name: 'Jewelry',
      slug: 'jewelry',
      description: 'Beautiful handcrafted jewelry pieces',
      isActive: true,
      sortOrder: 1,
      metaTitle: 'Jewelry Collection - Rupomoti',
      metaDescription: 'Discover our exquisite jewelry collection with premium quality pieces.'
    }
  })

  const necklaceCategory = await prisma.category.create({
    data: {
      name: 'Necklaces',
      slug: 'necklaces',
      description: 'Elegant necklaces for every occasion',
      parentId: jewelryCategory.id,
      isActive: true,
      sortOrder: 1,
    }
  })

  const earringsCategory = await prisma.category.create({
    data: {
      name: 'Earrings',
      slug: 'earrings',
      description: 'Stunning earrings to complement your style',
      parentId: jewelryCategory.id,
      isActive: true,
      sortOrder: 2,
    }
  })

  const ringsCategory = await prisma.category.create({
    data: {
      name: 'Rings',
      slug: 'rings',
      description: 'Beautiful rings for special moments',
      parentId: jewelryCategory.id,
      isActive: true,
      sortOrder: 3,
    }
  })

  const accessoriesCategory = await prisma.category.create({
    data: {
      name: 'Accessories',
      slug: 'accessories',
      description: 'Fashion accessories and more',
      isActive: true,
      sortOrder: 2,
    }
  })

  console.log('✅ Categories created successfully!')

  // Create sample products
  console.log('📱 Creating sample products...')

  const products = [
    {
      name: 'Pearl Necklace',
      slug: 'pearl-necklace',
      description: 'Elegant pearl necklace perfect for formal occasions',
      price: 2500,
      sku: 'PN-001',
      images: ['/images/pearl/jewelery1.jpeg'],
      categoryId: necklaceCategory.id,
      stock: 10,
      isFeatured: true,
      material: 'Freshwater Pearl, Silver',
      care: 'Wipe with soft cloth after use'
    },
    {
      name: 'Golden Earrings',
      slug: 'golden-earrings',
      description: 'Beautiful golden earrings with intricate design',
      price: 1800,
      sku: 'GE-001',
      images: ['/images/pearl/jewelery2.jpeg'],
      categoryId: earringsCategory.id,
      stock: 15,
      isFeatured: true,
      material: '18k Gold Plated',
      care: 'Store in dry place, avoid water contact'
    },
    {
      name: 'Diamond Ring',
      slug: 'diamond-ring',
      description: 'Stunning diamond ring for special occasions',
      price: 15000,
      sku: 'DR-001',
      images: ['/images/pearl/jewelery3.jpeg'],
      categoryId: ringsCategory.id,
      stock: 5,
      isFeatured: true,
      material: 'Natural Diamond, White Gold',
      care: 'Professional cleaning recommended'
    },
    {
      name: 'Silver Bracelet',
      slug: 'silver-bracelet',
      description: 'Elegant silver bracelet with modern design',
      price: 1200,
      sku: 'SB-001',
      images: ['/images/pearl/jewelery4.jpeg'],
      categoryId: accessoriesCategory.id,
      stock: 20,
      isFeatured: false,
      material: 'Sterling Silver',
      care: 'Polish with silver cloth regularly'
    },
    {
      name: 'Ruby Pendant',
      slug: 'ruby-pendant',
      description: 'Exquisite ruby pendant with gold chain',
      price: 8500,
      sku: 'RP-001',
      images: ['/images/pearl/jewelery5.jpeg'],
      categoryId: necklaceCategory.id,
      stock: 8,
      isFeatured: true,
      material: 'Natural Ruby, Gold Chain',
      care: 'Avoid harsh chemicals'
    },
    {
      name: 'Pearl Earrings',
      slug: 'pearl-earrings',
      description: 'Classic pearl earrings for everyday elegance',
      price: 1500,
      sku: 'PE-001',
      images: ['/images/pearl/jewelery6.jpeg'],
      categoryId: earringsCategory.id,
      stock: 25,
      isFeatured: false,
      material: 'Cultured Pearls, Silver Posts',
      care: 'Store in soft pouch when not worn'
    }
  ]

  for (const productData of products) {
    await prisma.product.create({
      data: productData
    })
  }

  console.log('✅ Sample products created successfully!')

  // Create admin user
  console.log('👤 Creating admin user...')
  
  try {
    const adminUser = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@rupomoti.com',
        isAdmin: true,
        role: 'ADMIN'
      }
    })
    console.log('✅ Admin user created:', adminUser.email)
  } catch (error) {
    console.log('⚠️  Admin user might already exist')
  }

  console.log('🎉 Database seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })