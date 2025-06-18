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
      shortDescription: 'Classic pearl necklace with lustrous finish',
      price: 2500,
      comparePrice: 3000,
      sku: 'PN-001',
      images: ['/images/pearl/jewelery1.jpeg'],
      categoryId: necklaceCategory.id,
      stock: 10,
      isActive: true,
      isFeatured: true,
      tags: ['pearl', 'necklace', 'formal', 'elegant'],
      seoTitle: 'Pearl Necklace - Elegant Jewelry | Rupomoti',
      seoDescription: 'Shop our beautiful pearl necklace collection. Perfect for formal occasions.'
    },
    {
      name: 'Golden Earrings',
      slug: 'golden-earrings',
      description: 'Beautiful golden earrings with intricate design',
      shortDescription: 'Handcrafted golden earrings',
      price: 1800,
      comparePrice: 2200,
      sku: 'GE-001',
      images: ['/images/pearl/jewelery2.jpeg'],
      categoryId: earringsCategory.id,
      stock: 15,
      isActive: true,
      isFeatured: true,
      tags: ['gold', 'earrings', 'handcrafted'],
      seoTitle: 'Golden Earrings - Handcrafted Jewelry | Rupomoti'
    },
    {
      name: 'Diamond Ring',
      slug: 'diamond-ring',
      description: 'Stunning diamond ring for special occasions',
      shortDescription: 'Brilliant diamond ring',
      price: 15000,
      comparePrice: 18000,
      sku: 'DR-001',
      images: ['/images/pearl/jewelery3.jpeg'],
      categoryId: ringsCategory.id,
      stock: 5,
      isActive: true,
      isFeatured: true,
      tags: ['diamond', 'ring', 'engagement', 'luxury'],
      seoTitle: 'Diamond Ring - Luxury Jewelry | Rupomoti'
    },
    {
      name: 'Silver Bracelet',
      slug: 'silver-bracelet',
      description: 'Elegant silver bracelet with modern design',
      shortDescription: 'Contemporary silver bracelet',
      price: 1200,
      comparePrice: 1500,
      sku: 'SB-001',
      images: ['/images/pearl/jewelery4.jpeg'],
      categoryId: accessoriesCategory.id,
      stock: 20,
      isActive: true,
      isFeatured: false,
      tags: ['silver', 'bracelet', 'modern'],
      seoTitle: 'Silver Bracelet - Modern Jewelry | Rupomoti'
    },
    {
      name: 'Ruby Pendant',
      slug: 'ruby-pendant',
      description: 'Exquisite ruby pendant with gold chain',
      shortDescription: 'Premium ruby pendant',
      price: 8500,
      comparePrice: 10000,
      sku: 'RP-001',
      images: ['/images/pearl/jewelery5.jpeg'],
      categoryId: necklaceCategory.id,
      stock: 8,
      isActive: true,
      isFeatured: true,
      tags: ['ruby', 'pendant', 'gold', 'premium'],
      seoTitle: 'Ruby Pendant - Premium Jewelry | Rupomoti'
    },
    {
      name: 'Pearl Earrings',
      slug: 'pearl-earrings',
      description: 'Classic pearl earrings for everyday elegance',
      shortDescription: 'Timeless pearl earrings',
      price: 1500,
      comparePrice: 1800,
      sku: 'PE-001',
      images: ['/images/pearl/jewelery6.jpeg'],
      categoryId: earringsCategory.id,
      stock: 25,
      isActive: true,
      isFeatured: false,
      tags: ['pearl', 'earrings', 'classic', 'everyday'],
      seoTitle: 'Pearl Earrings - Classic Jewelry | Rupomoti'
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