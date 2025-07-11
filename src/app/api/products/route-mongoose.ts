import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongoose'
import Product from '@/models/Product'
import Category from '@/models/Category'

// Cache configuration
const CACHE_DURATION = 60 * 5 // 5 minutes in seconds
const CACHE_HEADERS = {
  'Cache-Control': `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=${CACHE_DURATION * 2}`,
  'CDN-Cache-Control': `public, max-age=${CACHE_DURATION}`,
  'Vercel-CDN-Cache-Control': `max-age=${CACHE_DURATION}`,
}

const MAX_LIMIT = 100
const DEFAULT_LIMIT = 30

export async function GET(request: Request) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const search = searchParams.get('search') || ''
    const categories = searchParams.get('categories')?.split(',').filter(Boolean) || []
    const minPrice = Number(searchParams.get('minPrice')) || 0
    const maxPrice = Number(searchParams.get('maxPrice')) || 1000000
    const sort = searchParams.get('sort') || 'newest'
    const page = Number(searchParams.get('page')) || 1
    const limit = Math.min(Number(searchParams.get('limit')) || DEFAULT_LIMIT, MAX_LIMIT)
    const includeOutOfStock = searchParams.get('includeOutOfStock') === 'true'
    const featured = searchParams.get('featured') === 'true'
    const popular = searchParams.get('popular') === 'true'
    const newArrivals = searchParams.get('newArrivals') === 'true'

    // Build query
    const query: any = {}

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ]
    }

    // Category filter
    if (categories.length > 0) {
      query.category = { $in: categories }
    }

    // Price filter
    if (minPrice > 0 || maxPrice < 1000000) {
      query.price = {}
      if (minPrice > 0) query.price.$gte = minPrice
      if (maxPrice < 1000000) query.price.$lte = maxPrice
    }

    // Stock filter
    if (!includeOutOfStock) {
      query.stock = { $gt: 0 }
    }

    // Special filters
    if (featured) query.isFeatured = true
    if (popular) query.isPopular = true
    if (newArrivals) {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      query.createdAt = { $gte: thirtyDaysAgo }
    }

    // Build sort
    const sortOptions: any = {}
    switch (sort) {
      case 'price-low':
        sortOptions.price = 1
        break
      case 'price-high':
        sortOptions.price = -1
        break
      case 'popular':
        sortOptions.isPopular = -1
        sortOptions.createdAt = -1
        break
      case 'featured':
        sortOptions.isFeatured = -1
        sortOptions.createdAt = -1
        break
      case 'newest':
      default:
        sortOptions.createdAt = -1
        break
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Execute queries
    const [products, totalCount] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query)
    ])

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    const response = {
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? page + 1 : null,
        prevPage: hasPrevPage ? page - 1 : null
      },
      filters: {
        search,
        categories,
        minPrice,
        maxPrice,
        sort,
        includeOutOfStock,
        featured,
        popular,
        newArrivals
      }
    }

    return NextResponse.json(response, {
      headers: CACHE_HEADERS
    })

  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch products',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect()

    const body = await request.json()
    const {
      name,
      description,
      price,
      salePrice,
      sku,
      stock,
      images,
      category,
      isFeatured,
      isPopular,
      tags,
      weight,
      dimensions,
      materials,
      careInstructions
    } = body

    // Validate required fields
    if (!name || !description || !price || !category) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields',
          required: ['name', 'description', 'price', 'category']
        },
        { status: 400 }
      )
    }

    // Check if category exists
    const categoryExists = await Category.findById(category)
    if (!categoryExists) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 400 }
      )
    }

    // Generate slug from name
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Create product
    const product = new Product({
      name,
      slug,
      description,
      price,
      salePrice,
      sku: sku || `PROD-${Date.now()}`,
      stock: stock || 0,
      images: images || [],
      category,
      isFeatured: isFeatured || false,
      isPopular: isPopular || false,
      tags: tags || [],
      weight,
      dimensions,
      materials,
      careInstructions
    })

    await product.save()

    // Populate category for response
    await product.populate('category', 'name slug')

    return NextResponse.json({
      success: true,
      data: product,
      message: 'Product created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create product',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
