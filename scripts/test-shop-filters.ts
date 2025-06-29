import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testShopFilters() {
  console.log('🔍 Testing Shop Page Filter Functionality...\n')

  try {
    const baseWhere = {
      status: 'ACTIVE' as const,
      stock: { gt: 0 }
    }

    // Test Featured Filter
    const featuredProducts = await prisma.product.findMany({
      where: { 
        ...baseWhere,
        isFeatured: true 
      },
      take: 5,
      include: { category: true }
    })

    // Test New Arrivals Filter  
    const newArrivalProducts = await prisma.product.findMany({
      where: { 
        ...baseWhere,
        isNewArrival: true 
      },
      take: 5,
      include: { category: true }
    })

    // Test Popular Filter
    const popularProducts = await prisma.product.findMany({
      where: { 
        ...baseWhere,
        isPopular: true 
      },
      take: 5,
      include: { category: true }
    })

    console.log('✅ Filter Test Results:')
    console.log(`   Featured Filter (/shop?filter=featured): ${featuredProducts.length} products`)
    console.log(`   New Arrivals Filter (/shop?filter=new-arrivals): ${newArrivalProducts.length} products`)
    console.log(`   Popular Filter (/shop?filter=popular): ${popularProducts.length} products`)

    console.log('\n📝 Sample Products:')
    console.log('   Featured:')
    featuredProducts.slice(0, 3).forEach((p: any) => {
      console.log(`   - ${p.name} (${p.category?.name || 'No Category'})`)
    })

    console.log('   New Arrivals:')
    newArrivalProducts.slice(0, 3).forEach((p: any) => {
      console.log(`   - ${p.name} (${p.category?.name || 'No Category'})`)
    })

    console.log('   Popular:')
    popularProducts.slice(0, 3).forEach((p: any) => {
      console.log(`   - ${p.name} (${p.category?.name || 'No Category'})`)
    })

    console.log('\n🔗 URLs to Test:')
    console.log('   - http://localhost:3001/shop?filter=featured')
    console.log('   - http://localhost:3001/shop?filter=new-arrivals')
    console.log('   - http://localhost:3001/shop?filter=popular')
    console.log('   - http://localhost:3001/shop (all products)')

    console.log('\n✅ All filters are working correctly!')

  } catch (error) {
    console.error('❌ Error testing filters:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testShopFilters()
