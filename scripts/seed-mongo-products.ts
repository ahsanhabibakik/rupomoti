import { MongoClient } from 'mongodb'

async function seedProducts() {
  // Use the production MongoDB connection string directly
  const connectionString = "mongodb+srv://rupomotibusiness:pGhePonAlcVB3sf0@cluster0.p0tpuuo.mongodb.net/rupomoti?retryWrites=true&w=majority"
  
  const client = new MongoClient(connectionString, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })

  try {
    await client.connect()
    const db = client.db()
    
    // First seed categories
    const categoriesCollection = db.collection('Category')
    const categories = [
      {
        name: 'Necklaces',
        slug: 'necklaces',
        description: 'Beautiful pearl and gold necklaces',
        image: '/images/categories/necklaces.jpg',
        isActive: true,
        sortOrder: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Earrings',
        slug: 'earrings',
        description: 'Elegant pearl and gold earrings',
        image: '/images/categories/earrings.jpg',
        isActive: true,
        sortOrder: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Bracelets',
        slug: 'bracelets',
        description: 'Stunning pearl and gold bracelets',
        image: '/images/categories/bracelets.jpg',
        isActive: true,
        sortOrder: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Rings',
        slug: 'rings',
        description: 'Exquisite pearl and gold rings',
        image: '/images/categories/rings.jpg',
        isActive: true,
        sortOrder: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Sets',
        slug: 'sets',
        description: 'Complete jewelry sets',
        image: '/images/categories/sets.jpg',
        isActive: true,
        sortOrder: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ]

    // Clear existing categories and products
    await categoriesCollection.deleteMany({})
    await db.collection('Product').deleteMany({})

    // Insert categories
    const categoryResult = await categoriesCollection.insertMany(categories)
    const categoryIds = Object.values(categoryResult.insertedIds).map(id => id.toString())
    
    console.log('✅ Categories seeded successfully')

    // Now seed products
    const productsCollection = db.collection('Product')
    const products = [
      // Necklaces
      {
        name: 'Pearl Elegance Necklace',
        slug: 'pearl-elegance-necklace',
        description: 'Beautiful pearl necklace with 18K gold chain. Perfect for special occasions.',
        price: 15000,
        salePrice: 12000,
        stock: 10,
        sku: 'NECK-001',
        images: ['/images/placeholder.jpg'],
        categoryId: categoryIds[0],
        isFeatured: true,
        isPopular: true,
        isNewArrival: true,
        status: 'ACTIVE',
        weight: 25.5,
        material: '18K Gold, Natural Pearls',
        care: 'Store in a soft cloth, avoid contact with water',
        metaTitle: 'Pearl Elegance Necklace - Rupomoti',
        metaDescription: 'Beautiful pearl necklace with 18K gold chain',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Gold Chain Necklace',
        slug: 'gold-chain-necklace',
        description: 'Classic 22K gold chain necklace. Timeless elegance.',
        price: 35000,
        stock: 5,
        sku: 'NECK-002',
        images: ['/images/placeholder.jpg'],
        categoryId: categoryIds[0],
        isFeatured: true,
        isPopular: false,
        isNewArrival: false,
        status: 'ACTIVE',
        weight: 15.2,
        material: '22K Gold',
        care: 'Polish regularly with soft cloth',
        metaTitle: 'Gold Chain Necklace - Rupomoti',
        metaDescription: 'Classic 22K gold chain necklace',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Earrings
      {
        name: 'Pearl Drop Earrings',
        slug: 'pearl-drop-earrings',
        description: 'Elegant pearl drop earrings with gold accents.',
        price: 8000,
        salePrice: 6500,
        stock: 15,
        sku: 'EAR-001',
        images: ['/images/placeholder.jpg'],
        categoryId: categoryIds[1],
        isFeatured: false,
        isPopular: true,
        isNewArrival: true,
        status: 'ACTIVE',
        weight: 5.8,
        material: '18K Gold, Natural Pearls',
        care: 'Keep away from moisture',
        metaTitle: 'Pearl Drop Earrings - Rupomoti',
        metaDescription: 'Elegant pearl drop earrings with gold accents',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Gold Stud Earrings',
        slug: 'gold-stud-earrings',
        description: 'Simple and elegant gold stud earrings.',
        price: 12000,
        stock: 20,
        sku: 'EAR-002',
        images: ['/images/placeholder.jpg'],
        categoryId: categoryIds[1],
        isFeatured: false,
        isPopular: false,
        isNewArrival: false,
        status: 'ACTIVE',
        weight: 3.2,
        material: '22K Gold',
        care: 'Store in jewelry box',
        metaTitle: 'Gold Stud Earrings - Rupomoti',
        metaDescription: 'Simple and elegant gold stud earrings',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Bracelets
      {
        name: 'Pearl Bracelet Deluxe',
        slug: 'pearl-bracelet-deluxe',
        description: 'Luxurious pearl bracelet with gold clasp.',
        price: 18000,
        salePrice: 15000,
        stock: 8,
        sku: 'BRAC-001',
        images: ['/images/placeholder.jpg'],
        categoryId: categoryIds[2],
        isFeatured: true,
        isPopular: true,
        isNewArrival: false,
        status: 'ACTIVE',
        weight: 12.5,
        material: '18K Gold, Cultured Pearls',
        care: 'Avoid contact with perfumes',
        metaTitle: 'Pearl Bracelet Deluxe - Rupomoti',
        metaDescription: 'Luxurious pearl bracelet with gold clasp',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Gold Bangle Set',
        slug: 'gold-bangle-set',
        description: 'Set of 3 beautiful gold bangles.',
        price: 45000,
        stock: 6,
        sku: 'BRAC-002',
        images: ['/images/placeholder.jpg'],
        categoryId: categoryIds[2],
        isFeatured: false,
        isPopular: true,
        isNewArrival: true,
        status: 'ACTIVE',
        weight: 28.7,
        material: '22K Gold',
        care: 'Clean with mild soap solution',
        metaTitle: 'Gold Bangle Set - Rupomoti',
        metaDescription: 'Set of 3 beautiful gold bangles',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Rings
      {
        name: 'Pearl Ring Classic',
        slug: 'pearl-ring-classic',
        description: 'Classic pearl ring with gold band.',
        price: 9500,
        stock: 12,
        sku: 'RING-001',
        images: ['/images/placeholder.jpg'],
        categoryId: categoryIds[3],
        isFeatured: false,
        isPopular: false,
        isNewArrival: true,
        status: 'ACTIVE',
        weight: 4.2,
        material: '18K Gold, Natural Pearl',
        care: 'Remove before washing hands',
        metaTitle: 'Pearl Ring Classic - Rupomoti',
        metaDescription: 'Classic pearl ring with gold band',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Gold Band Ring',
        slug: 'gold-band-ring',
        description: 'Simple and elegant gold band ring.',
        price: 16000,
        stock: 18,
        sku: 'RING-002',
        images: ['/images/placeholder.jpg'],
        categoryId: categoryIds[3],
        isFeatured: false,
        isPopular: true,
        isNewArrival: false,
        status: 'ACTIVE',
        weight: 6.8,
        material: '22K Gold',
        care: 'Store in separate compartment',
        metaTitle: 'Gold Band Ring - Rupomoti',
        metaDescription: 'Simple and elegant gold band ring',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Sets
      {
        name: 'Bridal Pearl Set',
        slug: 'bridal-pearl-set',
        description: 'Complete bridal set with necklace, earrings, and bracelet.',
        price: 65000,
        salePrice: 55000,
        stock: 3,
        sku: 'SET-001',
        images: ['/images/placeholder.jpg'],
        categoryId: categoryIds[4],
        isFeatured: true,
        isPopular: true,
        isNewArrival: true,
        status: 'ACTIVE',
        weight: 45.2,
        material: '18K Gold, Natural Pearls',
        care: 'Store in velvet-lined box',
        metaTitle: 'Bridal Pearl Set - Rupomoti',
        metaDescription: 'Complete bridal set with necklace, earrings, and bracelet',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Gold Jewelry Set',
        slug: 'gold-jewelry-set',
        description: 'Elegant gold jewelry set for special occasions.',
        price: 85000,
        stock: 2,
        sku: 'SET-002',
        images: ['/images/placeholder.jpg'],
        categoryId: categoryIds[4],
        isFeatured: true,
        isPopular: false,
        isNewArrival: false,
        status: 'ACTIVE',
        weight: 62.5,
        material: '22K Gold',
        care: 'Professional cleaning recommended',
        metaTitle: 'Gold Jewelry Set - Rupomoti',
        metaDescription: 'Elegant gold jewelry set for special occasions',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ]

    await productsCollection.insertMany(products)
    console.log('✅ Products seeded successfully')

    await client.close()
    console.log('✅ Database seeding completed!')

  } catch (error) {
    console.error('Error seeding database:', error)
    throw error
  }
}

// Run the seeding
seedProducts().catch(console.error)
