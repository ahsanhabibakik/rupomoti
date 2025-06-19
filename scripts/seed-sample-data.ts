import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('🌱 Seeding sample data...')

    // Create categories
    const categories = await Promise.all([
      prisma.category.upsert({
        where: { slug: 'necklaces' },
        update: {},
        create: {
          name: 'Necklaces',
          slug: 'necklaces',
          description: 'Beautiful pearl necklaces for every occasion',
          isActive: true,
          sortOrder: 1,
        },
      }),
      prisma.category.upsert({
        where: { slug: 'earrings' },
        update: {},
        create: {
          name: 'Earrings',
          slug: 'earrings',
          description: 'Elegant pearl earrings',
          isActive: true,
          sortOrder: 2,
        },
      }),
      prisma.category.upsert({
        where: { slug: 'bracelets' },
        update: {},
        create: {
          name: 'Bracelets',
          slug: 'bracelets',
          description: 'Stunning pearl bracelets',
          isActive: true,
          sortOrder: 3,
        },
      }),
    ])

    console.log('✅ Categories created')

    // Create sample products
    const products = [
      {
        name: 'Classic White Pearl Necklace',
        slug: 'classic-white-pearl-necklace',
        description: 'A timeless classic white pearl necklace perfect for any formal occasion. Made with genuine freshwater pearls.',
        shortDescription: 'Timeless white pearl necklace',
        price: 15000,
        comparePrice: 18000,
        sku: 'PWN001',
        images: JSON.stringify(['/images/pearl/jewelery1.jpeg']),
        categoryId: categories[0].id,
        stock: 25,
        isActive: true,
        isFeatured: true,
        tags: JSON.stringify(['pearl', 'white', 'classic', 'formal']),
      },
      {
        name: 'Elegant Pearl Drop Earrings',
        slug: 'elegant-pearl-drop-earrings',
        description: 'Beautiful pearl drop earrings that add elegance to any outfit. Crafted with care using premium pearls.',
        shortDescription: 'Elegant pearl drop earrings',
        price: 8500,
        comparePrice: 10000,
        sku: 'PDE001',
        images: JSON.stringify(['/images/pearl/jewelery2.jpeg']),
        categoryId: categories[1].id,
        stock: 40,
        isActive: true,
        isFeatured: true,
        tags: JSON.stringify(['pearl', 'earrings', 'elegant', 'drop']),
      },
      {
        name: 'Pearl Tennis Bracelet',
        slug: 'pearl-tennis-bracelet',
        description: 'A sophisticated pearl tennis bracelet featuring uniform pearls in a classic setting.',
        shortDescription: 'Sophisticated pearl tennis bracelet',
        price: 12000,
        comparePrice: 14500,
        sku: 'PTB001',
        images: JSON.stringify(['/images/pearl/jewelery3.jpeg']),
        categoryId: categories[2].id,
        stock: 15,
        isActive: true,
        isFeatured: false,
        tags: JSON.stringify(['pearl', 'bracelet', 'tennis', 'classic']),
      },
      {
        name: 'Black Pearl Statement Necklace',
        slug: 'black-pearl-statement-necklace',
        description: 'Make a bold statement with this stunning black pearl necklace. Perfect for evening wear.',
        shortDescription: 'Bold black pearl statement piece',
        price: 22000,
        comparePrice: 25000,
        sku: 'BPN001',
        images: JSON.stringify(['/images/pearl/jewelery4.jpeg']),
        categoryId: categories[0].id,
        stock: 8,
        isActive: true,
        isFeatured: true,
        tags: JSON.stringify(['pearl', 'black', 'statement', 'evening']),
      },
      {
        name: 'Pearl Stud Earrings',
        slug: 'pearl-stud-earrings',
        description: 'Simple yet elegant pearl stud earrings. Perfect for daily wear or special occasions.',
        shortDescription: 'Simple pearl stud earrings',
        price: 6500,
        comparePrice: 8000,
        sku: 'PSE001',
        images: JSON.stringify(['/images/pearl/jewelery5.jpeg']),
        categoryId: categories[1].id,
        stock: 50,
        isActive: true,
        isFeatured: false,
        tags: JSON.stringify(['pearl', 'stud', 'simple', 'daily']),
      },
      {
        name: 'Multi-Strand Pearl Bracelet',
        slug: 'multi-strand-pearl-bracelet',
        description: 'A luxurious multi-strand pearl bracelet that wraps beautifully around the wrist.',
        shortDescription: 'Luxurious multi-strand bracelet',
        price: 18000,
        comparePrice: 21000,
        sku: 'MSB001',
        images: JSON.stringify(['/images/pearl/jewelery6.jpeg']),
        categoryId: categories[2].id,
        stock: 12,
        isActive: true,
        isFeatured: true,
        tags: JSON.stringify(['pearl', 'multi-strand', 'luxury', 'bracelet']),
      },
    ]

    for (const productData of products) {
      await prisma.product.upsert({
        where: { slug: productData.slug },
        update: productData,
        create: productData,
      })
    }

    console.log('✅ Sample products created')
    console.log(`📦 Created ${categories.length} categories and ${products.length} products`)
    
  } catch (error) {
    console.error('❌ Error seeding sample data:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })