import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Real product images from the provided URLs
const realImages = [
  'https://cdn.prosystem.com.bd/images/AMISHEE/DSC09650c389a0c9-336b-4891-bba1-204a5dbd5468.jpg',
  'https://cdn.prosystem.com.bd/images/AMISHEE/DSC03441e204e552-583b-4911-b8c2-737eb1fb226c.jpg',
  'https://cdn.prosystem.com.bd/images/AMISHEE/328139417_2486433668188955_6481913195503245309_nd492f979-6080-4abf-97f6-591f1d67bfa1.jpg',
  'https://cdn.prosystem.com.bd/images/AMISHEE/206953360_825027921460071_5244354105098269380_ndcc9bf22-ee26-4c19-bd0e-32c2334c6cea.jpg',
  'https://cdn.prosystem.com.bd/images/AMISHEE/195688853_817006565595540_639150075641872757_n9f31e06d-b85b-4648-b318-ceb7648d6168.jpg',
  'https://cdn.prosystem.com.bd/images/AMISHEE/DSC03319_effect48db33b7-decb-49a2-89b5-241b2c50d2ba.jpg',
  'https://cdn.prosystem.com.bd/images/AMISHEE/DSC03353b7cc6ee7-60b1-4feb-9a25-f5e5452a5583.jpg',
  'https://cdn.prosystem.com.bd/images/AMISHEE/DSC0336903e5ee54-4a1c-4f47-a927-0bb73335eccf.jpg',
  'https://cdn.prosystem.com.bd/images/AMISHEE/DSC033999d58d10e-68b3-461b-ae35-aa2d8ad2c7c5.jpg',
  'https://cdn.prosystem.com.bd/images/AMISHEE/DSC096318f3432df-8c1c-4783-80dc-3c7cfa64d986.jpg',
]

// Function to get random images for a product
function getRandomImages(): string[] {
  const shuffled = [...realImages].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, 2) // Get 2 random images
}

async function updateProductImages() {
  try {
    console.log('🖼️ Starting to update product images with real URLs...')

    // Get all products
    const products = await prisma.product.findMany({
      select: { id: true, name: true }
    })

    console.log(`📦 Found ${products.length} products to update`)

    for (const product of products) {
      const newImages = getRandomImages()
      
      await prisma.product.update({
        where: { id: product.id },
        data: { images: newImages }
      })

      console.log(`✅ Updated ${product.name} with images:`)
      console.log(`   - ${newImages[0]}`)
      console.log(`   - ${newImages[1]}`)
    }

    console.log('🎉 All product images updated successfully!')
    console.log(`📊 Total products updated: ${products.length}`)
    
  } catch (error) {
    console.error('❌ Error updating product images:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

updateProductImages()
