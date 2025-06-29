import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Checking parentId values...')
  
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      parentId: true,
      isActive: true
    }
  })
  
  categories.forEach(cat => {
    console.log(`${cat.name}: parentId = "${cat.parentId}", type: ${typeof cat.parentId}, isNull: ${cat.parentId === null}, isUndefined: ${cat.parentId === undefined}`)
  })
  
  // Try to find categories with undefined parentId
  const undefinedParents = await prisma.category.findMany({
    where: {
      parentId: { equals: null }
    }
  })
  console.log(`\nCategories with parentId === null: ${undefinedParents.length}`)
  
  // Try to find all top-level looking categories by checking different conditions
  const categories2 = await prisma.category.findMany()
  const topLevel = categories2.filter(cat => cat.parentId === null || cat.parentId === undefined || cat.parentId === '')
  console.log(`\nFiltered top-level categories: ${topLevel.length}`)
  topLevel.forEach(cat => console.log(`- ${cat.name}`))
  
  await prisma.$disconnect()
}

main().catch(console.error)
