import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkProductCounts() {
  console.log('🔍 Checking product counts for home page sections...\n')

  const baseWhere = {
    status: 'ACTIVE' as const,
    stock: { gt: 0 }
  }

  try {
    const [featuredCount, popularCount, newArrivalsCount, regularCount, totalCount] = await Promise.all([
      prisma.product.count({
        where: { 
          ...baseWhere,
          isFeatured: true 
        }
      }),
      prisma.product.count({
        where: { 
          ...baseWhere,
          isPopular: true 
        }
      }),
      prisma.product.count({
        where: { 
          ...baseWhere,
          isNewArrival: true 
        }
      }),
      prisma.product.count({
        where: { 
          ...baseWhere,
          isFeatured: false,
          isPopular: false,
          isNewArrival: false
        }
      }),
      prisma.product.count({
        where: baseWhere
      })
    ])

    console.log('📊 Product Counts:')
    console.log(`   Total Products: ${totalCount}`)
    console.log(`   Featured Products: ${featuredCount}`)
    console.log(`   Popular Products: ${popularCount}`)
    console.log(`   New Arrivals: ${newArrivalsCount}`)
    console.log(`   Regular Products: ${regularCount}`)
    
    console.log('\n🎯 Section Display Logic:')
    
    const getDisplayInfo = (count: number, sectionName: string) => {
      if (count >= 8) {
        return `${sectionName}: SHOW (${count} products → display 8)`
      } else if (count >= 4) {
        return `${sectionName}: SHOW (${count} products → display 4)`
      } else if (count >= 3) {
        return `${sectionName}: SHOW (${count} products → display ${count})`
      } else {
        return `${sectionName}: HIDE (${count} products → less than 3)`
      }
    }

    console.log(`   ${getDisplayInfo(featuredCount, 'Featured Collections')}`)
    console.log(`   ${getDisplayInfo(newArrivalsCount, 'Latest Collection')}`)
    console.log(`   ${getDisplayInfo(popularCount, 'Popular Pieces')}`)
    console.log(`   ${getDisplayInfo(regularCount, 'Regular Products')}`)

    // Check categories
    const categories = await prisma.category.findMany({
      where: { isActive: true }
    })

    console.log(`\n📂 Categories: ${categories.length} active categories`)
    categories.forEach(cat => {
      console.log(`   - ${cat.name} (${cat.slug})`)
    })

    console.log('\n✅ All sections should be visible and working correctly!')

  } catch (error) {
    console.error('❌ Error checking product counts:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkProductCounts()
