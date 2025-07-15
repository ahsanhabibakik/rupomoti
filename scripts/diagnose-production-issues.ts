import { PrismaClient } from '@prisma/client'

async function diagnoseProductionIssues() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🔍 Starting production diagnosis...')
    
    // 1. Test database connection
    console.log('\n1. Testing database connection...')
    try {
      await prisma.$connect()
      console.log('✅ Database connection successful')
    } catch (error) {
      console.error('❌ Database connection failed:', error)
      return
    }
    
    // 2. Check total products
    console.log('\n2. Checking products...')
    const totalProducts = await prisma.product.count()
    console.log(`📊 Total products in database: ${totalProducts}`)
    
    if (totalProducts === 0) {
      console.error('❌ No products found in database!')
      return
    }
    
    // 3. Check active products
    const activeProducts = await prisma.product.count({
      where: { status: 'ACTIVE' }
    })
    console.log(`📊 Active products: ${activeProducts}`)
    
    // 4. Check products with images
    const productsWithImages = await prisma.product.count({
      where: { 
        status: 'ACTIVE',
        images: { isEmpty: false }
      }
    })
    console.log(`📊 Active products with images: ${productsWithImages}`)
    
    // 5. Check categories
    const totalCategories = await prisma.category.count()
    const activeCategories = await prisma.category.count({
      where: { isActive: true }
    })
    console.log(`📊 Total categories: ${totalCategories}, Active: ${activeCategories}`)
    
    // 6. Check featured products
    const featuredProducts = await prisma.product.count({
      where: { 
        status: 'ACTIVE',
        isFeatured: true
      }
    })
    console.log(`📊 Featured products: ${featuredProducts}`)
    
    // 7. Check new arrivals
    const newArrivals = await prisma.product.count({
      where: { 
        status: 'ACTIVE',
        isNewArrival: true
      }
    })
    console.log(`📊 New arrivals: ${newArrivals}`)
    
    // 8. Sample product data
    console.log('\n3. Sample products...')
    const sampleProducts = await prisma.product.findMany({
      where: { status: 'ACTIVE' },
      include: { category: true },
      take: 3
    })
    
    sampleProducts.forEach((product: any, index: number) => {
      console.log(`\n📦 Sample Product ${index + 1}:`)
      console.log(`   Name: ${product.name}`)
      console.log(`   Slug: ${product.slug}`)
      console.log(`   Price: ৳${product.price}`)
      console.log(`   Category: ${product.category?.name || 'No category'}`)
      console.log(`   Images: ${product.images.length} image(s)`)
      console.log(`   First Image: ${product.images[0] || 'No image'}`)
      console.log(`   Featured: ${product.isFeatured}`)
      console.log(`   New Arrival: ${product.isNewArrival}`)
      console.log(`   Stock: ${product.stock}`)
    })
    
    // 9. Check environment variables
    console.log('\n4. Environment check...')
    console.log(`   NODE_ENV: ${process.env.NODE_ENV}`)
    console.log(`   NEXTAUTH_URL: ${process.env.NEXTAUTH_URL}`)
    console.log(`   Database URL set: ${!!process.env.DATABASE_URL}`)
    console.log(`   Cloudinary config: ${!!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}`)
    
    console.log('\n✅ Diagnosis complete!')
    
  } catch (error) {
    console.error('❌ Diagnosis failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the diagnosis
diagnoseProductionIssues().catch(console.error)
