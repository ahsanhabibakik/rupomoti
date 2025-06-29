import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Updating category images...')
  
  const categories = await prisma.category.findMany({
    where: {
      isActive: true
    }
  })
  
  // Filter for top-level categories manually
  const topLevelCategories = categories.filter(cat => cat.parentId === null)
  
  console.log(`Found ${topLevelCategories.length} top-level categories`)
  
  // Update categories with sample images
  const imageMap: { [key: string]: string } = {
    'jewelry': '/images/hero/pearl-collection-1.jpg',
    'accessories': '/images/hero/pearl-collection-2.jpg',
    'necklaces': '/images/hero/pearl-collection-1.jpg',
    'earrings': '/images/hero/pearl-collection-2.jpg',
    'rings': '/images/hero/pearl-collection-1.jpg',
    'bracelets': '/images/hero/pearl-collection-2.jpg',
  }
  
  for (const category of topLevelCategories) {
    const imageToUse = imageMap[category.slug] || '/images/hero/pearl-collection-1.jpg'
    
    await prisma.category.update({
      where: { id: category.id },
      data: { 
        image: imageToUse,
        // Also improve descriptions for known categories
        description: category.slug === 'jewelry' ? 'Exquisite handcrafted jewelry pieces' :
                    category.slug === 'accessories' ? 'Stylish accessories to complement your look' :
                    category.slug === 'necklaces' ? 'Elegant necklaces for every occasion' :
                    category.slug === 'earrings' ? 'Beautiful earrings to enhance your style' :
                    category.slug === 'rings' ? 'Stunning rings for special moments' :
                    category.description || 'Beautiful jewelry pieces'
      }
    })
    
    console.log(`Updated ${category.name} with image: ${imageToUse}`)
  }
  
  console.log('✅ Categories updated successfully!')
  await prisma.$disconnect()
}

main().catch(console.error)
