export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongoose'
import { getProductModel } from '@/models/Product'
import { getCategoryModel } from '@/models/Category'

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
    const query: Record<string, unknown> = {}

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
      if (minPrice > 0) (query.price as any).$gte = minPrice
      if (maxPrice < 1000000) (query.price as any).$lte = maxPrice
    }

    // Stock filter
    if (!includeOutOfStock) {
      query.stock = { $gt: 0 }
    }

    // Special filters
    if (featured) query.featured = true
    if (popular) query.popular = true
    if (newArrivals) query.isNewArrival = true

    // Sort options
    let sortOptions: Record<string, 1 | -1> = {}
    switch (sort) {
      case 'price-asc':
        sortOptions = { price: 1 }
        break
      case 'price-desc':
        sortOptions = { price: -1 }
        break
      case 'popular':
        sortOptions = { views: -1, rating: -1 }
        break
      case 'rating':
        sortOptions = { rating: -1 }
        break
      case 'newest':
      default:
        sortOptions = { createdAt: -1 }
        break
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Execute queries in parallel
    const [products, totalCount] = await Promise.all([
      getProductModel().find(query)
        .populate('category', 'name displayName')
        .sort(sortOptions)
        .limit(limit)
        .skip(skip)
        .lean(),
      getProductModel().countDocuments(query)
    ])

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    const response = {
      products,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
      filters: {
        search,
        categories,
        priceRange: { min: minPrice, max: maxPrice },
        sort,
        includeOutOfStock,
        featured,
        popular,
        newArrivals,
      }
    }

    return NextResponse.json(response, {
      status: 200,
      headers: CACHE_HEADERS,
    })

  } catch (error) {
    console.error('Products API error:', error)
    return NextResponse.json(
      { 
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
    
    // Validate required fields
    const { name, description, price, category } = body
    
    if (!name || !description || !price || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify category exists
    const categoryDoc = await getCategoryModel().findById(category)
    if (!categoryDoc) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      )
    }

    // Create product
    const product = await getProductModel().create({
      ...body,
      slug: body.slug || name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'),
    })

    await product.populate('category', 'name displayName')

    return NextResponse.json(product, { status: 201 })

  } catch (error) {
    console.error('Create product error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create product',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
