import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    // Fetch active categories for landing page
    const categories = await prisma.category.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        name: true,
        slug: true,
        image: true,
        description: true,
        _count: {
          select: {
            products: {
              where: {
                status: 'ACTIVE'
              }
            }
          }
        }
      },
      orderBy: {
        sortOrder: 'asc'
      },
      take: 8 // Limit for landing page display
    })

    // Transform categories for landing page use
    const transformedCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      image: category.image || '/images/categories/default.jpg',
      productCount: category._count.products,
      url: `/shop/${category.slug}`,
      banglaName: getBanglaName(category.name), // Helper function for Bangla names
      badge: category._count.products > 10 ? 'জনপ্রিয়' : undefined,
      discount: Math.floor(Math.random() * 30) + 10 // Random discount for demo
    }))

    return NextResponse.json({
      success: true,
      categories: transformedCategories
    })
  } catch (error) {
    console.error('Failed to fetch landing page categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

// Helper function to get Bangla category names
function getBanglaName(englishName: string): string {
  const translations: Record<string, string> = {
    'Necklaces': 'হার',
    'Earrings': 'কানের দুল',
    'Bracelets': 'ব্রেসলেট',
    'Rings': 'আংটি',
    'Pendants': 'লকেট',
    'Sets': 'সেট',
    'Pearl Jewelry': 'মুক্তার গয়না',
    'Gold Jewelry': 'সোনার গয়না',
    'Silver Jewelry': 'রূপার গয়না',
    'Wedding Collection': 'বিয়ের কালেকশন'
  }
  
  return translations[englishName] || englishName
}
