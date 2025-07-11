import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// First, create a category for the products
const categories = [
  {
    name: 'Necklaces',
    slug: 'necklaces',
    description: 'Beautiful necklaces for every occasion',
    isActive: true,
  },
  {
    name: 'Rings',
    slug: 'rings',
    description: 'Stunning rings collection',
    isActive: true,
  },
  {
    name: 'Earrings',
    slug: 'earrings',
    description: 'Elegant earrings collection',
    isActive: true,
  },
  {
    name: 'Bracelets',
    slug: 'bracelets',
    description: 'Charming bracelets collection',
    isActive: true,
  },
]

const products = [
  {
    name: 'Gold Necklace',
    description: 'Elegant 18K gold necklace with intricate design',
    price: 25000,
    images: ['/images/products/necklace-1.jpg'],
    categorySlug: 'necklaces',
    inStock: true,
    featured: true,
  },
  {
    name: 'Diamond Ring',
    description: '1 carat diamond ring with platinum band',
    price: 35000,
    images: ['/images/products/ring-1.jpg'],
    categorySlug: 'rings',
    inStock: true,
    featured: true,
  },
  {
    name: 'Pearl Earrings',
    description: 'Classic pearl earrings with gold settings',
    price: 15000,
    images: ['/images/products/earrings-1.jpg'],
    categorySlug: 'earrings',
    inStock: true,
    featured: false,
  },
  {
    name: 'Gold Bracelet',
    description: '22K gold bracelet with traditional design',
    price: 20000,
    images: ['/images/products/bracelet-1.jpg'],
    categorySlug: 'bracelets',
    inStock: true,
    featured: true,
  },
  {
    name: 'Diamond Pendant',
    description: 'Beautiful diamond pendant with gold chain',
    price: 28000,
    images: ['/images/products/pendant-1.jpg'],
    categorySlug: 'necklaces',
    inStock: true,
    featured: false,
  },
  {
    name: 'Ruby Ring',
    description: 'Stunning ruby ring with diamond accents',
    price: 32000,
    images: ['/images/products/ring-2.jpg'],
    categorySlug: 'rings',
    inStock: true,
    featured: false,
  },
  {
    name: 'Gold Anklet',
    description: '18K gold anklet with bells',
    price: 12000,
    images: ['/images/products/anklet-1.jpg'],
    categorySlug: 'anklets',
    inStock: true,
    featured: false,
  },
  {
    name: 'Diamond Nose Pin',
    description: 'Delicate diamond nose pin',
    price: 8000,
    images: ['/images/products/nose-pin-1.jpg'],
    categorySlug: 'nose-pins',
    inStock: true,
    featured: false,
  },
]

async function main() {
  try {
    // Create categories first
    for (const category of categories) {
      await prisma.category.upsert({
        where: { slug: category.slug },
        update: category,
        create: category,
      })
    }

    console.log('✅ Categories seeded successfully')

    // Then create products with category relationships
    for (const product of products) {
      const { categorySlug, ...productData } = product
      
      // Find the category
      const category = await prisma.category.findUnique({
        where: { slug: categorySlug },
      })

      if (!category) {
        console.error(`Category ${categorySlug} not found`)
        continue
      }

      // Create the product with the category relationship
      await prisma.product.create({
        data: {
          ...productData,
          slug: productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          sku: `${category.name.substring(0, 3).toUpperCase()}-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
          category: {
            connect: { id: category.id }
          }
        },
      })
    }

    console.log('✅ Products seeded successfully')
  } catch (error) {
    console.error('Error seeding database:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main() 