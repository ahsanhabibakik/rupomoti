import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Trying different null queries...')
  
  // Try different ways to query for null parentId
  const query1 = await prisma.category.findMany({
    where: {
      isActive: true,
      OR: [
        { parentId: null },
        { parentId: { equals: null } }
      ]
    }
  })
  console.log(`Query 1 (OR with null): ${query1.length}`)
  
  const query2 = await prisma.category.findMany({
    where: {
      isActive: true,
      parentId: { isSet: false }
    }
  })
  console.log(`Query 2 (isSet false): ${query2.length}`)
  
  // Try with raw query
  const query3 = await prisma.$queryRaw`
    SELECT * FROM categories 
    WHERE "isActive" = true AND "parentId" IS NULL
  `
  console.log(`Raw query result:`, query3)
  
  await prisma.$disconnect()
}

main().catch(console.error)
