import { PrismaClient } from '@prisma/client'
import { generateUniqueSlugFromDB, generateSlug, validateSlug } from '../src/lib/utils/slug'

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
    
    let updatedCount = 0;
    const processedSlugs = new Set<string>();

    // Update products with missing, invalid, or duplicate slugs
    for (const product of products) {
      let needsUpdate = false;
      let reason = '';
      
      // Check if product has no slug
      if (!product.slug || product.slug.trim() === '') {
        needsUpdate = true;
        reason = 'missing slug';
      }
      // Check if slug is invalid format
      else if (!validateSlug(product.slug)) {
        needsUpdate = true;
        reason = 'invalid slug format';
      }
      // Check for duplicate slugs
      else if (processedSlugs.has(product.slug)) {
        needsUpdate = true;
        reason = 'duplicate slug';
      }
      
      if (needsUpdate) {
        const newSlug = await generateUniqueSlugFromDB(product.name);
        
        await prisma.product.update({
          where: { id: product.id },
          data: { slug: newSlug }
        });
        
        console.log(`Updated product "${product.name}" (${reason}): "${product.slug}" -> "${newSlug}"`);
        updatedCount++;
        processedSlugs.add(newSlug);
      } else {
        processedSlugs.add(product.slug);
      }
    }
    
    console.log(`Product slug update completed! Updated ${updatedCount} out of ${products.length} products.`);
  } catch (error) {
    console.error('Error updating product slugs:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateProductSlugs() 