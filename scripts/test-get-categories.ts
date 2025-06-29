import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function getCategories(params: { active?: boolean; level?: number } = {}) {
  try {
    if (params.level === 0) {
      const allCategories = await prisma.category.findMany({
        where: params.active !== undefined ? { isActive: params.active } : {},
        orderBy: {
          sortOrder: 'asc',
        },
      })
      
      return allCategories.filter(cat => cat.parentId === null)
    }
    
    const categories = await prisma.category.findMany({
      where: params.active !== undefined ? { isActive: params.active } : {},
      orderBy: {
        sortOrder: 'asc',
      },
    })
    return categories
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

async function main() {
  console.log('Testing getCategories function...')
  
  const categories = await getCategories({ active: true, level: 0 })
  console.log(`Found ${categories.length} categories:`)
  categories.forEach((cat: any, index: number) => {
    console.log(`${index + 1}. ${cat.name} (${cat.slug}) - Image: ${cat.image}`)
  })
  
  await prisma.$disconnect()
}

main().catch(console.error)
