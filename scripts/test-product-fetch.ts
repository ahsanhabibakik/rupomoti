import { PrismaClient } from '@prisma/client'

async function testProductFetch() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🧪 Testing product fetching...')
    
    // 1. Test basic product query (like shop page)
    console.log('\n1. Testing shop page query...')
    const shopProducts = await prisma.product.findMany({
      where: { 
        status: 'ACTIVE',
        stock: { gt: 0 }
      },
      include: { category: true },
      take: 5,
      orderBy: { createdAt: 'desc' }
    })
    
    console.log(`✅ Shop query returned ${shopProducts.length} products`)
    if (shopProducts.length > 0) {
      console.log(`   Sample: "${shopProducts[0].name}" - ৳${shopProducts[0].price}`)
    }
    
    // 2. Test homepage featured products
    console.log('\n2. Testing featured products...')
    const featuredProducts = await prisma.product.findMany({
      where: { 
        status: 'ACTIVE',
        isFeatured: true,
        stock: { gt: 0 }
      },
      include: { category: true },
      take: 4
    })
    
    console.log(`✅ Featured query returned ${featuredProducts.length} products`)
    
    // 3. Test new arrivals
    console.log('\n3. Testing new arrivals...')
    const newArrivals = await prisma.product.findMany({
      where: { 
        status: 'ACTIVE',
        isNewArrival: true,
        stock: { gt: 0 }
      },
      include: { category: true },
      take: 4
    })
    
    console.log(`✅ New arrivals query returned ${newArrivals.length} products`)
    
    // 4. Test categories
    console.log('\n4. Testing categories...')
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      include: { 
        _count: { select: { products: true } }
      },
      take: 5
    })
    
    console.log(`✅ Categories query returned ${categories.length} categories`)
    categories.forEach((cat: any) => {
      console.log(`   ${cat.name}: ${cat._count.products} products`)
    })
    
    // 5. Check for problematic data
    console.log('\n5. Checking for issues...')
    
    const productsWithoutImages = await prisma.product.count({
      where: { 
        status: 'ACTIVE',
        images: { isEmpty: true }
      }
    })
    console.log(`⚠️  Products without images: ${productsWithoutImages}`)
    
    const productsWithBadPrices = await prisma.product.count({
      where: { 
        status: 'ACTIVE',
        price: { lte: 0 }
      }
    })
    console.log(`⚠️  Products with bad prices: ${productsWithBadPrices}`)
    
    const categoriesWithoutProducts = await prisma.category.count({
      where: { 
        isActive: true,
        products: { none: {} }
      }
    })
    console.log(`⚠️  Empty categories: ${categoriesWithoutProducts}`)
    
    console.log('\n✅ Product fetch test complete!')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testProductFetch().catch(console.error)
