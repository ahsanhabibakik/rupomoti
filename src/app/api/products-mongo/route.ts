import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongoose'
import Product from '@/models/Product'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    await dbConnect()
    
    const { searchParams } = new URL(request.url);
    
    // Handle special query parameters
    const isFeatured = searchParams.get('isFeatured')
    const isPopular = searchParams.get('isPopular')
    const limit = searchParams.get('limit')
    const sort = searchParams.get('sort')

    // Build filter
    const filter: Record<string, unknown> = { status: 'ACTIVE' }

    if (isFeatured === 'true') {
      filter.isFeatured = true
    }

    if (isPopular === 'true') {
      filter.isPopular = true
    }

    // Build sort
    let sortObj: Record<string, 1 | -1> = { createdAt: -1 }
    if (sort === 'newest') {
      sortObj = { createdAt: -1 }
    }

    // Build query
    let query = Product.find(filter).sort(sortObj)

    if (limit) {
      query = query.limit(parseInt(limit, 10))
    }

    const products = await query.lean().exec()

    // Transform products
    const transformedProducts = products.map(product => ({
      id: product._id.toString(),
      name: product.name,
      description: product.description || null,
      price: product.price || 0,
      discountPrice: product.discountPrice || null,
      salePrice: product.salePrice || null,
      sku: product.sku || null,
      images: product.images || [],
      status: product.status,
      isFeatured: product.isFeatured || false,
      isPopular: product.isPopular || false,
      isNewArrival: product.isNewArrival || false,
      slug: product.slug || null,
      categoryId: product.categoryId || null,
      stock: product.stock || 0,
      tags: product.tags || [],
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    }))

    return NextResponse.json({
      success: true,
      data: transformedProducts
    })

  } catch (error) {
    console.error('Products API Error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch products',
        message: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect()
    
    const body = await request.json()
    
    // Create new product using Mongoose
    const product = new Product(body)
    const savedProduct = await product.save()
    
    return NextResponse.json({
      success: true,
      data: {
        id: savedProduct._id.toString(),
        ...savedProduct.toObject()
      }
    })
    
  } catch (error) {
    console.error('Product creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create product', message: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
