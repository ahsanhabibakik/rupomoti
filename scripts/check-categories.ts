import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Checking categories in database...')
  
  const categories = await prisma.category.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      sortOrder: 'asc'
    }
  })
  
  console.log(`Found ${categories.length} active categories:`)
  categories.forEach((cat, index) => {
    console.log(`${index + 1}. ${cat.name} (slug: ${cat.slug}) - Parent: ${cat.parentId ? 'Yes' : 'No'}`)
  })
  
  const parentCategories = categories.filter(cat => cat.parentId === null)
  console.log(`\nTop-level categories: ${parentCategories.length}`)
  parentCategories.forEach((cat, index) => {
    console.log(`${index + 1}. ${cat.name} (slug: ${cat.slug})`)
  })
  
  await prisma.$disconnect()
}

main().catch(console.error)
