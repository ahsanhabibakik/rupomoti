import { PrismaClient } from '@prisma/client'
import { validateSlug } from '../src/lib/utils/slug'

const prisma = new PrismaClient()

async function verifyProductSlugs() {
  try {
    console.log('Verifying product slugs...')
    
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        slug: true
      }
    })
    
    console.log(`Checking ${products.length} products...`)
    
    const issues = []
    const duplicateSlugs = new Map<string, string[]>()
    
    for (const product of products) {
      // Check for missing slugs
      if (!product.slug || product.slug.trim() === '') {
        issues.push(`Product "${product.name}" (ID: ${product.id}) has no slug`)
      }
      // Check for invalid slug format
      else if (!validateSlug(product.slug)) {
        issues.push(`Product "${product.name}" (ID: ${product.id}) has invalid slug: "${product.slug}"`)
      }
      // Track potential duplicates
      else {
        if (!duplicateSlugs.has(product.slug)) {
          duplicateSlugs.set(product.slug, [])
        }
        duplicateSlugs.get(product.slug)!.push(`${product.name} (${product.id})`)
      }
    }
    
    // Check for duplicates
    for (const [slug, products] of duplicateSlugs.entries()) {
      if (products.length > 1) {
        issues.push(`Duplicate slug "${slug}" used by: ${products.join(', ')}`)
      }
    }
    
    if (issues.length === 0) {
      console.log('✅ All product slugs are valid and unique!')
    } else {
      console.log(`❌ Found ${issues.length} slug issues:`)
      issues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue}`)
      })
    }
    
    // Show some sample product URLs
    const sampleProducts = products.slice(0, 5)
    console.log('\nSample product URLs:')
    sampleProducts.forEach(product => {
      console.log(`- ${product.name}: http://localhost:3000/product/${product.slug}`)
    })
    
  } catch (error) {
    console.error('Error verifying product slugs:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyProductSlugs()
