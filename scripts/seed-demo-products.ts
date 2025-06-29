import { PrismaClient, ProductStatus } from '@prisma/client'

const prisma = new PrismaClient()

const categories = [
  {
    name: 'Necklaces',
    slug: 'necklaces',
    description: 'Beautiful necklaces for every occasion',
    image: '/images/categories/necklaces.jpg',
    isActive: true,
  },
  {
    name: 'Rings',
    slug: 'rings',
    description: 'Stunning rings collection',
    image: '/images/categories/rings.jpg',
    isActive: true,
  },
  {
    name: 'Earrings',
    slug: 'earrings',
    description: 'Elegant earrings collection',
    image: '/images/categories/earrings.jpg',
    isActive: true,
  },
  {
    name: 'Bracelets',
    slug: 'bracelets',
    description: 'Charming bracelets collection',
    image: '/images/categories/bracelets.jpg',
    isActive: true,
  },
  {
    name: 'Sets',
    slug: 'sets',
    description: 'Complete jewelry sets',
    image: '/images/categories/sets.jpg',
    isActive: true,
  },
]

const demoProducts = [
  // Featured Collections
  {
    name: 'Royal Pearl Crown Necklace',
    description: 'Exquisite royal crown design with premium pearls and gold accents. A statement piece for special occasions.',
    price: 89000,
    salePrice: 75000,
    images: [
      '/images/products/royal-crown-necklace-1.jpg',
      '/images/products/royal-crown-necklace-2.jpg'
    ],
    categorySlug: 'necklaces',
    stock: 15,
    isFeatured: true,
    isNewArrival: false,
    isPopular: true,
    status: ProductStatus.ACTIVE,
  },
  {
    name: 'Diamond Eternity Ring',
    description: 'Stunning diamond eternity ring with continuous sparkle around the band. Perfect for engagements and anniversaries.',
    price: 125000,
    salePrice: 110000,
    images: [
      '/images/products/diamond-eternity-ring-1.jpg',
      '/images/products/diamond-eternity-ring-2.jpg'
    ],
    categorySlug: 'rings',
    stock: 8,
    isFeatured: true,
    isNewArrival: false,
    isPopular: true,
    status: ProductStatus.ACTIVE,
  },
  {
    name: 'Baroque Pearl Statement Earrings',
    description: 'Unique baroque pearls with natural irregular shapes, creating an artistic and elegant look.',
    price: 45000,
    images: [
      '/images/products/baroque-pearl-earrings-1.jpg',
      '/images/products/baroque-pearl-earrings-2.jpg'
    ],
    categorySlug: 'earrings',
    stock: 20,
    isFeatured: true,
    isNewArrival: true,
    isPopular: false,
    status: ProductStatus.ACTIVE,
  },

  // Latest Collections (New Arrivals)
  {
    name: 'Modern Minimalist Gold Bracelet',
    description: 'Contemporary minimalist design in 18K gold. Perfect for everyday wear or layering.',
    price: 35000,
    salePrice: 28000,
    images: [
      '/images/products/minimalist-gold-bracelet-1.jpg',
      '/images/products/minimalist-gold-bracelet-2.jpg'
    ],
    categorySlug: 'bracelets',
    stock: 25,
    isFeatured: false,
    isNewArrival: true,
    isPopular: false,
    status: ProductStatus.ACTIVE,
  },
  {
    name: 'Art Deco Sapphire Necklace',
    description: 'Vintage-inspired art deco design featuring deep blue sapphires and intricate metalwork.',
    price: 95000,
    images: [
      '/images/products/art-deco-sapphire-necklace-1.jpg',
      '/images/products/art-deco-sapphire-necklace-2.jpg'
    ],
    categorySlug: 'necklaces',
    stock: 12,
    isFeatured: false,
    isNewArrival: true,
    isPopular: true,
    status: ProductStatus.ACTIVE,
  },
  {
    name: 'Rose Gold Floral Ring',
    description: 'Delicate rose gold ring with floral motifs and tiny diamond accents. Romantic and feminine.',
    price: 28000,
    images: [
      '/images/products/rose-gold-floral-ring-1.jpg',
      '/images/products/rose-gold-floral-ring-2.jpg'
    ],
    categorySlug: 'rings',
    stock: 18,
    isFeatured: false,
    isNewArrival: true,
    isPopular: false,
    status: ProductStatus.ACTIVE,
  },

  // Popular Pieces
  {
    name: 'Classic Pearl Strand Necklace',
    description: 'Timeless classic pearl necklace with lustrous white pearls and gold clasp. A wardrobe essential.',
    price: 55000,
    salePrice: 49000,
    images: [
      '/images/products/classic-pearl-strand-1.jpg',
      '/images/products/classic-pearl-strand-2.jpg'
    ],
    categorySlug: 'necklaces',
    stock: 30,
    isFeatured: false,
    isNewArrival: false,
    isPopular: true,
    status: ProductStatus.ACTIVE,
  },
  {
    name: 'Vintage Gold Hoops',
    description: 'Elegant vintage-style gold hoop earrings with textured finish. Versatile for any occasion.',
    price: 22000,
    images: [
      '/images/products/vintage-gold-hoops-1.jpg',
      '/images/products/vintage-gold-hoops-2.jpg'
    ],
    categorySlug: 'earrings',
    stock: 35,
    isFeatured: false,
    isNewArrival: false,
    isPopular: true,
    status: ProductStatus.ACTIVE,
  },
  {
    name: 'Diamond Tennis Bracelet',
    description: 'Classic diamond tennis bracelet with brilliant cut diamonds in platinum setting.',
    price: 185000,
    salePrice: 165000,
    images: [
      '/images/products/diamond-tennis-bracelet-1.jpg',
      '/images/products/diamond-tennis-bracelet-2.jpg'
    ],
    categorySlug: 'bracelets',
    stock: 10,
    isFeatured: false,
    isNewArrival: false,
    isPopular: true,
    status: ProductStatus.ACTIVE,
  },

  // Additional Regular Products
  {
    name: 'Emerald Cocktail Ring',
    description: 'Bold emerald cocktail ring with halo diamond setting. Perfect for special events.',
    price: 75000,
    images: [
      '/images/products/emerald-cocktail-ring-1.jpg'
    ],
    categorySlug: 'rings',
    stock: 5,
    isFeatured: false,
    isNewArrival: false,
    isPopular: false,
    status: ProductStatus.ACTIVE,
  },
  {
    name: 'Pearl Drop Earrings',
    description: 'Elegant pearl drop earrings with gold stems. Sophisticated and graceful.',
    price: 32000,
    images: [
      '/images/products/pearl-drop-earrings-1.jpg',
      '/images/products/pearl-drop-earrings-2.jpg'
    ],
    categorySlug: 'earrings',
    stock: 22,
    isFeatured: false,
    isNewArrival: false,
    isPopular: false,
    status: ProductStatus.ACTIVE,
  },
  {
    name: 'Gold Chain Bracelet',
    description: 'Classic gold chain bracelet with secure clasp. A versatile addition to any jewelry collection.',
    price: 18000,
    salePrice: 15000,
    images: [
      '/images/products/gold-chain-bracelet-1.jpg'
    ],
    categorySlug: 'bracelets',
    stock: 40,
    isFeatured: false,
    isNewArrival: false,
    isPopular: false,
    status: ProductStatus.ACTIVE,
  },
  {
    name: 'Bridal Pearl Set',
    description: 'Complete bridal set with pearl necklace, earrings, and bracelet. Perfect for wedding day.',
    price: 125000,
    salePrice: 110000,
    images: [
      '/images/products/bridal-pearl-set-1.jpg',
      '/images/products/bridal-pearl-set-2.jpg'
    ],
    categorySlug: 'sets',
    stock: 8,
    isFeatured: true,
    isNewArrival: true,
    isPopular: true,
    status: ProductStatus.ACTIVE,
  },
  {
    name: 'Antique Ruby Brooch',
    description: 'Vintage antique ruby brooch with intricate design. A unique collector\'s piece.',
    price: 65000,
    images: [
      '/images/products/antique-ruby-brooch-1.jpg'
    ],
    categorySlug: 'bracelets', // Using bracelets as a general accessories category
    stock: 3,
    isFeatured: false,
    isNewArrival: false,
    isPopular: false,
    status: ProductStatus.ACTIVE,
  },
  {
    name: 'Geometric Diamond Pendant',
    description: 'Modern geometric diamond pendant with contemporary design. Statement piece for fashion-forward individuals.',
    price: 45000,
    images: [
      '/images/products/geometric-diamond-pendant-1.jpg',
      '/images/products/geometric-diamond-pendant-2.jpg'
    ],
    categorySlug: 'necklaces',
    stock: 15,
    isFeatured: false,
    isNewArrival: true,
    isPopular: false,
    status: ProductStatus.ACTIVE,
  },
]

async function main() {
  try {
    console.log('🌱 Starting demo product seeding...')

    // Create categories first
    for (const category of categories) {
      await prisma.category.upsert({
        where: { slug: category.slug },
        update: category,
        create: category,
      })
      console.log(`✅ Category created: ${category.name}`)
    }

    console.log('✅ Categories seeded successfully')

    // Then create products with category relationships
    for (const product of demoProducts) {
      const { categorySlug, ...productData } = product
      
      // Find the category
      const category = await prisma.category.findUnique({
        where: { slug: categorySlug },
      })

      if (!category) {
        console.error(`❌ Category ${categorySlug} not found`)
        continue
      }

      // Create the product with the category relationship
      const slug = productData.name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      // Generate SKU
      const sku = `${category.name.substring(0, 3).toUpperCase()}-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`

      await prisma.product.upsert({
        where: { slug },
        update: {
          ...productData,
          categoryId: category.id,
        },
        create: {
          ...productData,
          slug,
          sku,
          categoryId: category.id,
        },
      })
      
      console.log(`✅ Product created: ${productData.name}`)
    }

    console.log('🎉 Demo products seeded successfully!')
    console.log(`📊 Total products created: ${demoProducts.length}`)
    console.log(`📊 Featured products: ${demoProducts.filter(p => p.isFeatured).length}`)
    console.log(`📊 New arrivals: ${demoProducts.filter(p => p.isNewArrival).length}`)
    console.log(`📊 Popular products: ${demoProducts.filter(p => p.isPopular).length}`)
    
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
