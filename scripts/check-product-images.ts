import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkProductImages() {
  try {
    console.log('🔍 Checking product images in database...')
    
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        images: true,
        slug: true,
      },
      take: 10 // Just check first 10 products
    })

    console.log(`📦 Found ${products.length} products`)
    console.log('📸 Image details:')
    
    products.forEach((product, index) => {
      console.log(`\n${index + 1}. ${product.name}`)
      console.log(`   Slug: ${product.slug}`)
      console.log(`   Images count: ${product.images.length}`)
      
      if (product.images.length > 0) {
        product.images.forEach((image, imgIndex) => {
          console.log(`   Image ${imgIndex + 1}: ${image}`)
          // Check if it's a Cloudinary URL
          if (image.includes('cloudinary.com') || image.includes('prosystem.com.bd')) {
            console.log(`   ✅ External image detected`)
          } else if (image.startsWith('/images/')) {
            console.log(`   📁 Local image path`)
          } else {
            console.log(`   ❓ Unknown image type`)
          }
        })
      } else {
        console.log(`   ❌ No images found`)
      }
    })

    // Check if any products have missing images
    const productsWithoutImages = await prisma.product.count({
      where: {
        OR: [
          { images: { equals: [] } },
          { images: null }
        ]
      }
    })

    console.log(`\n📊 Summary:`)
    console.log(`   Products without images: ${productsWithoutImages}`)
    
    // Check total products
    const totalProducts = await prisma.product.count()
    console.log(`   Total products: ${totalProducts}`)

  } catch (error) {
    console.error('❌ Error checking product images:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkProductImages()
