import { PrismaClient } from '@prisma/client'
import { getDefaultCategoryImage } from '../src/utils/category-utils'

const prisma = new PrismaClient()

const categories = [
  {
    name: 'Rings',
    slug: 'rings',
    description: 'Elegant and stunning ring collection for every occasion',
    isActive: true,
    sortOrder: 1,
    metaTitle: 'Ring Collection - Rupomoti Jewelry',
    metaDescription: 'Discover our beautiful collection of rings. From engagement rings to fashion rings, find the perfect piece.'
  },
  {
    name: 'Necklaces',
    slug: 'necklaces',
    description: 'Beautiful necklaces to complement any outfit',
    isActive: true,
    sortOrder: 2,
    metaTitle: 'Necklace Collection - Rupomoti Jewelry',
    metaDescription: 'Explore our exquisite necklace collection. From delicate chains to statement pieces.'
  },
  {
    name: 'Earrings',
    slug: 'earrings',
    description: 'Stunning earring designs for every style',
    isActive: true,
    sortOrder: 3,
    metaTitle: 'Earring Collection - Rupomoti Jewelry',
    metaDescription: 'Browse our diverse earring collection. From subtle studs to dramatic drops.'
  },
  {
    name: 'Bracelets',
    slug: 'bracelets',
    description: 'Elegant bracelet designs to adorn your wrists',
    isActive: true,
    sortOrder: 4,
    metaTitle: 'Bracelet Collection - Rupomoti Jewelry',
    metaDescription: 'Discover our bracelet collection. From tennis bracelets to charm bracelets.'
  },
  {
    name: 'Jewelry Sets',
    slug: 'jewelry-sets',
    description: 'Complete jewelry sets for a coordinated look',
    isActive: true,
    sortOrder: 5,
    metaTitle: 'Jewelry Sets - Rupomoti Jewelry',
    metaDescription: 'Shop our jewelry sets for a perfectly coordinated look. Complete sets for every occasion.'
  },
  {
    name: 'Wedding Collection',
    slug: 'wedding-collection',
    description: 'Special pieces for your most important day',
    isActive: true,
    sortOrder: 6,
    metaTitle: 'Wedding Jewelry - Rupomoti Jewelry',
    metaDescription: 'Celebrate your special day with our wedding jewelry collection.'
  },
  {
    name: 'Traditional',
    slug: 'traditional',
    description: 'Traditional Bengali and Indian jewelry designs',
    isActive: true,
    sortOrder: 7,
    metaTitle: 'Traditional Jewelry - Rupomoti Jewelry',
    metaDescription: 'Embrace tradition with our collection of traditional jewelry designs.'
  },
  {
    name: 'Modern',
    slug: 'modern',
    description: 'Contemporary and trendy jewelry designs',
    isActive: true,
    sortOrder: 8,
    metaTitle: 'Modern Jewelry - Rupomoti Jewelry',
    metaDescription: 'Stay on-trend with our modern jewelry collection.'
  }
]

async function seedCategories() {
  try {
    console.log('🌱 Seeding categories...')

    for (const categoryData of categories) {
      // Check if category already exists
      const existingCategory = await prisma.category.findUnique({
        where: { slug: categoryData.slug }
      })

      if (existingCategory) {
        console.log(`⏭️  Category "${categoryData.name}" already exists, skipping...`)
        continue
      }

      // Create category with default image
      const category = await prisma.category.create({
        data: {
          ...categoryData,
          image: getDefaultCategoryImage(categoryData.name)
        }
      })

      console.log(`✅ Created category: ${category.name}`)
    }

    console.log('🎉 Categories seeding completed!')
  } catch (error) {
    console.error('❌ Error seeding categories:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the seed function
if (require.main === module) {
  seedCategories()
    .then(() => {
      console.log('✨ Categories seed script completed successfully!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Categories seed script failed:', error)
      process.exit(1)
    })
}

export { seedCategories }
