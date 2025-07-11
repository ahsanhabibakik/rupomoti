import { NextResponse } from 'next/server'
import { Products, Categories } from '@/lib/services'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export const GET = withMongoose(async (req) => {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'featured'
    const limit = parseInt(searchParams.get('limit') || '12')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')

    let data

    if (search) {
      // Search products
      data = await Products.searchProducts(search, limit)
    } else if (minPrice && maxPrice) {
      // Price range filter
      data = await Products.getProductsInPriceRange(
        parseFloat(minPrice), 
        parseFloat(maxPrice)
      )
    } else if (category) {
      // Products by category
      data = await Products.getProductsByCategory(category, limit)
    } else {
      // Product collections
      switch (type) {
        case 'featured':
          data = await Products.getFeaturedProducts(limit)
          break
        case 'popular':
          data = await Products.getPopularProducts(limit)
          break
        case 'sale':
          data = await Products.getProductsOnSale(limit)
          break
        default:
          data = await Products.getFeaturedProducts(limit)
      }
    }

    // Transform data to include computed fields
    const transformedData = data.map(product => ({
      id: product._id.toString(),
      name: product.name,
      description: product.description,
      price: product.price,
      discountPrice: product.discountPrice,
      finalPrice: product.discountPrice || product.price,
      discountPercentage: product.discountPrice 
        ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
        : 0,
      isOnSale: Boolean(product.discountPrice && product.discountPrice < product.price),
      isInStock: product.stock > 0,
      isLowStock: product.stock > 0 && product.stock <= 5,
      sku: product.sku,
      images: product.images,
      status: product.status,
      isFeatured: product.isFeatured,
      isPopular: product.isPopular,
      categoryId: product.categoryId,
      stock: product.stock,
      weight: product.weight,
      dimensions: product.dimensions,
      materials: product.materials,
      colors: product.colors,
      sizes: product.sizes,
      tags: product.tags,
      seo: product.seo,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    }))

    return NextResponse.json({
      success: true,
      data: transformedData,
      meta: {
        count: transformedData.length,
        type,
        filters: {
          category,
          search,
          priceRange: minPrice && maxPrice ? { min: minPrice, max: maxPrice } : null
        }
      }
    })

  } catch (error) {
    console.error('Enhanced Products API Error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch products',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Advanced product operations
export const POST = withMongoose(async (req) => {
  try {
    const body = await request.json()
    const { action, data } = body

    switch (action) {
      case 'bulk_discount':
        const discountResults = await Products.applyBulkDiscount(
          data.categoryId, 
          data.percentage
        )
        return NextResponse.json({
          success: true,
          message: `Applied ${data.percentage}% discount to ${discountResults.length} products`,
          data: discountResults
        })

      case 'bulk_stock_update':
        const stockResults = await Products.updateBulkStock(data.updates)
        return NextResponse.json({
          success: true,
          message: 'Stock updated for multiple products',
          data: stockResults
        })

      case 'category_analytics':
        const analytics = await Categories.getCategoryAnalytics()
        return NextResponse.json({
          success: true,
          data: analytics
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Enhanced Products POST Error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to process request',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
