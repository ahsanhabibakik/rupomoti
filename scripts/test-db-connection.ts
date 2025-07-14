import { prisma } from '@/lib/prisma'

async function testConnection() {
  try {
    console.log('🔗 Testing database connection...')
    
    // Test 1: Simple count
    const productCount = await prisma.product.count()
    console.log(`✅ Database connected! Found ${productCount} products`)
    
    // Test 2: Get categories
    const categories = await prisma.category.findMany()
    console.log(`✅ Found ${categories.length} categories`)
    
    // Test 3: Add a simple product
    const newProduct = await prisma.product.create({
      data: {
        name: 'Test Product',
        slug: 'test-product-' + Date.now(),
        description: 'A test product to verify database connectivity',
        price: 1000,
        basePrice: 800,
        stock: 10,
        status: 'ACTIVE',
        categoryId: categories[0]?.id,
        images: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80'],
        tags: ['test'],
        features: ['test-feature'],
        isPopular: true,
        isFeatured: false,
        discount: 0
      }
    })
    
    console.log(`✅ Created test product: ${newProduct.name} (ID: ${newProduct.id})`)
    
    // Test 4: Delete the test product
    await prisma.product.delete({
      where: { id: newProduct.id }
    })
    console.log('✅ Cleaned up test product')
    
    console.log('🎉 Database connection test successful!')
    
  } catch (error) {
    console.error('❌ Database connection test failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
