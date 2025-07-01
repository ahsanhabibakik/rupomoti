import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma, ProductStatus } from '@prisma/client'

// Cache configuration
const CACHE_DURATION = 60 * 5 // 5 minutes in seconds
const CACHE_HEADERS = {
  'Cache-Control': `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=${CACHE_DURATION * 2}`,
  'CDN-Cache-Control': `public, max-age=${CACHE_DURATION}`,
  'Vercel-CDN-Cache-Control': `max-age=${CACHE_DURATION}`,
}

// Constants for performance optimization
const MAX_LIMIT = 100
const DEFAULT_LIMIT = 30
const MAX_PRICE = 1000000
const SORT_OPTIONS = ['newest', 'price-low', 'price-high', 'popular', 'featured'] as const

// Type definitions for better performance
interface QueryParams {
  search?: string
  categories: string[]
  minPrice: number
  maxPrice: number
  sort: string
  page: number
  limit: number
  status?: ProductStatus
  includeOutOfStock: boolean
  adminView: boolean
}

interface CacheKey {
  search: string
  categories: string
  priceRange: string
  sort: string
  page: number
  limit: number
  status: string
  includeOutOfStock: boolean
  adminView: boolean
}

// In-memory cache with TTL (consider Redis for production)
const cache = new Map<string, { data: unknown; timestamp: number }>()

function generateCacheKey(params: CacheKey): string {
  return `products:${JSON.stringify(params)}`
}

function getCachedData(key: string) {
  const cached = cache.get(key)
  if (!cached) return null
  
  const now = Date.now()
  if (now - cached.timestamp > CACHE_DURATION * 1000) {
    cache.delete(key)
    return null
  }
  
  return cached.data
}

function setCachedData(key: string, data: unknown) {
  // Prevent memory leaks by limiting cache size
  if (cache.size > 1000) {
    const firstKey = cache.keys().next().value
    cache.delete(firstKey)
  }
  
  cache.set(key, { data, timestamp: Date.now() })
}

function parseQueryParams(searchParams: URLSearchParams): QueryParams {
  const search = searchParams.get('search')?.trim() || undefined
  const categories = searchParams.getAll('categories').filter(Boolean)
  const minPrice = Math.max(0, Number(searchParams.get('minPrice')) || 0)
  const maxPrice = Math.min(MAX_PRICE, Number(searchParams.get('maxPrice')) || MAX_PRICE)
  const sort = SORT_OPTIONS.includes(searchParams.get('sort') as typeof SORT_OPTIONS[number]) 
    ? searchParams.get('sort')! 
    : 'newest'
  const page = Math.max(1, Number(searchParams.get('page')) || 1)
  const limit = Math.min(MAX_LIMIT, Math.max(1, Number(searchParams.get('limit')) || DEFAULT_LIMIT))
  const status = searchParams.get('status') as ProductStatus | undefined
  const includeOutOfStock = searchParams.get('includeOutOfStock') === 'true'
  const adminView = searchParams.get('adminView') === 'true'

  return {
    search,
    categories,
    minPrice,
    maxPrice,
    sort,
    page,
    limit,
    status,
    includeOutOfStock,
    adminView
  }
}

function buildWhereClause(params: QueryParams): Prisma.ProductWhereInput {
  const { search, categories, minPrice, maxPrice, status, includeOutOfStock, adminView } = params

  const where: Prisma.ProductWhereInput = {
    // Price filter - always applied
    price: {
      gte: minPrice,
      lte: maxPrice,
    },
  }

  // Category filter - only apply if categories are specified
  if (categories.length > 0) {
    where.category = {
      slug: { in: categories },
      isActive: true,
    }
  }
  // Note: If no categories specified, don't filter by category at all

  // Search filter with optimized full-text search
  if (search) {
    // Use more efficient search strategy
    const searchTerms = search.toLowerCase().split(' ').filter(term => term.length > 1)
    
    if (searchTerms.length === 1) {
      // Single term search
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { category: { name: { contains: search, mode: 'insensitive' } } },
      ]
    } else {
      // Multiple terms search - use AND logic for better relevance
      where.AND = searchTerms.map(term => ({
        OR: [
          { name: { contains: term, mode: 'insensitive' } },
          { description: { contains: term, mode: 'insensitive' } },
          { category: { name: { contains: term, mode: 'insensitive' } } },
        ]
      }))
    }
  }

  // Status filter
  if (status) {
    where.status = status
  } else if (!adminView) {
    // Only show active products for regular users
    where.status = ProductStatus.ACTIVE
  }

  // Stock filter
  if (!includeOutOfStock && !adminView) {
    where.stock = { gt: 0 }
  }

  return where
}

function buildOrderByClause(sort: string): Prisma.ProductOrderByWithRelationInput | Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case 'price-low':
      return { price: 'asc' }
    case 'price-high':
      return { price: 'desc' }
    case 'popular':
      return [{ isPopular: 'desc' }, { createdAt: 'desc' }]
    case 'featured':
      return [{ isFeatured: 'desc' }, { createdAt: 'desc' }]
    case 'newest':
    default:
      return { createdAt: 'desc' }
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const params = parseQueryParams(searchParams)
    
    // Generate cache key
    const cacheKey = generateCacheKey({
      search: params.search || '',
      categories: params.categories.join(','),
      priceRange: `${params.minPrice}-${params.maxPrice}`,
      sort: params.sort,
      page: params.page,
      limit: params.limit,
      status: params.status || '',
      includeOutOfStock: params.includeOutOfStock,
      adminView: params.adminView,
    })

    // Check cache first (skip cache for admin views or real-time data)
    if (!params.adminView) {
      const cachedData = getCachedData(cacheKey)
      if (cachedData) {
        return NextResponse.json(cachedData, {
          headers: {
            ...CACHE_HEADERS,
            'X-Cache': 'HIT',
          }
        })
      }
    }

    // Build optimized queries
    const where = buildWhereClause(params)
    const orderBy = buildOrderByClause(params.sort)
    const skip = (params.page - 1) * params.limit

    // Execute queries in parallel for better performance
    const [totalProducts, products] = await Promise.all([
      // Optimized count query
      prisma.product.count({ 
        where,
        // Skip expensive operations for count
      }),
      
      // Optimized product query with selective field loading
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: params.limit,
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          salePrice: true,  // Changed from compareAtPrice to salePrice
          stock: true,
          status: true,
          isFeatured: true,
          isNewArrival: true,
          isPopular: true,
          createdAt: true,
          updatedAt: true,
          images: true,  // Simplified to get all images array
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            }
          },
          // Removed tags and views as they don't exist in schema
        },
      })
    ])

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalProducts / params.limit)
    const hasMore = params.page * params.limit < totalProducts
    const hasPrevious = params.page > 1

    const responseData = {
      products,
      pagination: {
        total: totalProducts,
        page: params.page,
        limit: params.limit,
        totalPages,
        hasMore,
        hasPrevious,
      },
      filters: {
        search: params.search,
        categories: params.categories,
        priceRange: [params.minPrice, params.maxPrice],
        sort: params.sort,
      },
      meta: {
        timestamp: new Date().toISOString(),
        cached: false,
      }
    }

    // Cache the result (skip caching for admin views)
    if (!params.adminView) {
      setCachedData(cacheKey, responseData)
    }

    return NextResponse.json(responseData, {
      headers: {
        ...CACHE_HEADERS,
        'X-Cache': 'MISS',
        'X-Total-Count': totalProducts.toString(),
      }
    })

  } catch (error) {
    console.error('Error fetching products:', error)
    
    // Return structured error response
    return NextResponse.json(
      { 
        error: 'Failed to fetch products',
        message: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Internal server error',
        timestamp: new Date().toISOString(),
      },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        }
      }
    )
  }
}

// Optional: Add other HTTP methods for comprehensive API

export async function HEAD(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const params = parseQueryParams(searchParams)
    const where = buildWhereClause(params)
    
    const totalProducts = await prisma.product.count({ where })
    
    return new Response(null, {
      status: 200,
      headers: {
        ...CACHE_HEADERS,
        'X-Total-Count': totalProducts.toString(),
        'Content-Type': 'application/json',
      }
    })
  } catch {
    return new Response(null, { status: 500 })
  }
}

// Cleanup function to clear expired cache entries (call periodically)
export function cleanupCache() {
  const now = Date.now()
  const expiredKeys = []
  
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > CACHE_DURATION * 1000) {
      expiredKeys.push(key)
    }
  }
  
  expiredKeys.forEach(key => cache.delete(key))
  return expiredKeys.length
}