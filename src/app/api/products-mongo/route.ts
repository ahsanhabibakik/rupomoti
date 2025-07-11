import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongoose'
import Product from '@/models/Product'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export const GET = withMongoose(async (req) => {
  try {
    await dbConnect()
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '12', 10);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build query filter
    const filter: Record<string, unknown> = {}
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'seo.keywords': { $regex: search, $options: 'i' } }
      ]
    }

    if (category) {
      filter.categoryId = category
    }

    if (minPrice || maxPrice) {
      const priceFilter: Record<string, number> = {}
      if (minPrice) priceFilter.$gte = parseFloat(minPrice)
      if (maxPrice) priceFilter.$lte = parseFloat(maxPrice)
      filter.price = priceFilter
    }

    // Handle special query parameters
    const isFeatured = searchParams.get('isFeatured')
    const isPopular = searchParams.get('isPopular')
    const limit = searchParams.get('limit')
    const sort = searchParams.get('sort')

    if (isFeatured === 'true') {
      filter.isFeatured = true
    }

    if (isPopular === 'true') {
      filter.isPopular = true
    }

    // Only show active products
    filter.status = 'ACTIVE'

    // Get total count
    const totalProducts = await Product.countDocuments(filter)

    // Build sort object
    const sortObj: Record<string, 1 | -1> = {}
    if (sort === 'newest') {
      sortObj.createdAt = -1
    } else if (sort === 'oldest') {
      sortObj.createdAt = 1
    } else {
      sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1
    }

    // Get products with pagination
    let query = Product.find(filter).sort(sortObj)

    if (limit) {
      query = query.limit(parseInt(limit, 10))
    } else {
      query = query.skip((page - 1) * pageSize).limit(pageSize)
    }

    const products = await query.lean().exec()

    // Transform products to match expected format
    const transformedProducts = products.map(product => ({
      id: product._id.toString(),
      name: product.name,
      description: product.description || null,
      price: product.price || 0,
      discountPrice: product.discountPrice || null,
      sku: product.sku || null,
      images: product.images || [],
      status: product.status,
      isFeatured: product.isFeatured || false,
      isPopular: product.isPopular || false,
      categoryId: product.categoryId || null,
      stock: product.stock || 0,
      weight: product.weight || null,
      dimensions: product.dimensions || null,
      materials: product.materials || [],
      colors: product.colors || [],
      sizes: product.sizes || [],
      tags: product.tags || [],
      seo: product.seo || {},
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    }))

    const totalPages = Math.ceil(totalProducts / pageSize)

    return NextResponse.json({
      success: true,
      data: transformedProducts,
      pagination: {
        page,
        pageSize,
        totalProducts,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    })

  } catch (error) {
    console.error('Products API Error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch products',
        message: error instanceof Error ? error.message : 'Internal server error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

export const POST = withMongoose(async (req) => {
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
