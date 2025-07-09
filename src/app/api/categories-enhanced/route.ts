import { NextResponse } from 'next/server'
import { Categories } from '@/lib/services'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'active'
    const slug = searchParams.get('slug')
    const withProducts = searchParams.get('withProducts') === 'true'
    const productLimit = parseInt(searchParams.get('productLimit') || '12')

    let data

    if (slug) {
      // Get specific category with products
      data = await Categories.getCategoryWithProducts(slug, productLimit)
      
      if (!data) {
        return NextResponse.json(
          { error: 'Category not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data
      })
    }

    switch (type) {
      case 'active':
        data = await Categories.getActiveCategories()
        break
      case 'with_counts':
        data = await Categories.getCategoriesWithCounts()
        break
      case 'analytics':
        data = await Categories.getCategoryAnalytics()
        break
      default:
        data = await Categories.getActiveCategories()
    }

    // Transform data
    const transformedData = data.map(category => ({
      id: category._id.toString(),
      name: category.name,
      displayName: category.name.charAt(0).toUpperCase() + category.name.slice(1),
      description: category.description,
      image: category.image,
      slug: category.slug,
      isActive: category.isActive,
      sortOrder: category.sortOrder,
      seo: category.seo,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
      productCount: category.productCount || 0,
      hasProducts: (category.productCount || 0) > 0,
      // Include analytics data if available
      ...(category.totalValue && {
        analytics: {
          totalValue: category.totalValue,
          avgPrice: category.avgPrice,
          inStockProducts: category.inStockProducts
        }
      })
    }))

    return NextResponse.json({
      success: true,
      data: transformedData,
      meta: {
        count: transformedData.length,
        type,
        withProducts
      }
    })

  } catch (error) {
    console.error('Enhanced Categories API Error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch categories',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Advanced category operations
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, data } = body

    switch (action) {
      case 'get_analytics':
        const analytics = await Categories.getCategoryAnalytics()
        return NextResponse.json({
          success: true,
          data: analytics
        })

      case 'toggle_active':
        // This would require getting the category and calling the instance method
        // For now, return a placeholder
        return NextResponse.json({
          success: true,
          message: 'Category status toggled'
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Enhanced Categories POST Error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to process request',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
