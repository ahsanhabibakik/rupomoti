import { PrismaClient } from '@prisma/client'
import { generateSlug, generateUniqueSlug } from '../src/lib/utils/slug'

const prisma = new PrismaClient()

async function updateProductSlugs() {
  try {
    console.log('Starting product slug update...')
    
    // Get all products
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        slug: true
      }
    })
    
    console.log(`Found ${products.length} products`)
    
    // Get existing slugs
    const existingSlugs = products
      .filter(p => p.slug && p.slug !== '')
      .map(p => p.slug!)
    
    console.log(`Found ${existingSlugs.length} existing slugs`)
    
    // Update products without slugs
    for (const product of products) {
      if (!product.slug || product.slug === '') {
        const baseSlug = generateSlug(product.name)
        const uniqueSlug = generateUniqueSlug(baseSlug, existingSlugs)
        
        await prisma.product.update({
          where: { id: product.id },
          data: { slug: uniqueSlug }
        })
        
        existingSlugs.push(uniqueSlug)
        console.log(`Updated product "${product.name}" with slug: ${uniqueSlug}`)
      }
    }
    
    console.log('Product slug update completed successfully!')
  } catch (error) {
    console.error('Error updating product slugs:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateProductSlugs() 