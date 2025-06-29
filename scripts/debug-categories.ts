import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Debug: Checking categories...')
  
  const allCategories = await prisma.category.findMany()
  console.log(`Total categories: ${allCategories.length}`)
  
  const activeCategories = await prisma.category.findMany({
    where: { isActive: true }
  })
  console.log(`Active categories: ${activeCategories.length}`)
  
  // Test different queries
  const testQuery1 = await prisma.category.findMany({
    where: {
      parentId: null
    }
  })
  console.log(`Query with just parentId null: ${testQuery1.length}`)
  
  const testQuery2 = await prisma.category.findMany({
    where: {
      isActive: true
    }
  })
  console.log(`Query with just isActive true: ${testQuery2.length}`)
  
  const testQuery3 = await prisma.category.findMany({
    where: {
      AND: [
        { isActive: true },
        { parentId: null }
      ]
    }
  })
  console.log(`Query with AND condition: ${testQuery3.length}`)
  
  const topLevelCategories = await prisma.category.findMany({
    where: {
      isActive: true,
      parentId: null
    }
  })
  console.log(`Top-level active categories: ${topLevelCategories.length}`)
  
  console.log('\nTop-level categories:')
  topLevelCategories.forEach(cat => {
    console.log(`- ${cat.name} (${cat.slug})`)
  })
  
  console.log('\nAll categories with parent info:')
  allCategories.forEach(cat => {
    console.log(`- ${cat.name} (${cat.slug}) - Active: ${cat.isActive}, Parent: ${cat.parentId || 'null'}`)
  })
  
  await prisma.$disconnect()
}

main().catch(console.error)
