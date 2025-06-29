import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma, ProductStatus } from '@prisma/client'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const categories = searchParams.getAll('categories')
    const minPrice = Number(searchParams.get('minPrice')) || 0
    const maxPrice = Number(searchParams.get('maxPrice')) || 100000
    const sort = searchParams.get('sort') || 'newest'
    const page = Number(searchParams.get('page')) || 1
    const limit = Number(searchParams.get('limit')) || 30
    const status = searchParams.get('status')
    const includeOutOfStock = searchParams.get('includeOutOfStock') === 'true' // For admin views
    const adminView = searchParams.get('adminView') === 'true' // For admin-only access

    const categoryFilter: Prisma.CategoryWhereInput = {
      isActive: true,
    };
    if (categories.length > 0) {
      categoryFilter.slug = {
        in: categories,
      };
    }

    // Build the where clause
    const where: Prisma.ProductWhereInput = {
      price: {
        gte: minPrice,
        lte: maxPrice,
      },
      category: categoryFilter,
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (status) {
      where.status = status as ProductStatus
    } else {
      // Only show active products for regular users
      where.status = ProductStatus.ACTIVE
    }

    // Exclude out-of-stock products for regular users (unless specifically requested)
    if (!includeOutOfStock && !adminView) {
      where.stock = {
        gt: 0
      }
    }

    // Build the orderBy clause
    let orderBy = {}
    switch (sort) {
      case 'price-low':
        orderBy = { price: 'asc' }
        break
      case 'price-high':
        orderBy = { price: 'desc' }
        break
      case 'popular':
        orderBy = { views: 'desc' }
        break
      case 'featured':
        orderBy = { isFeatured: 'desc' }
        break
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' }
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    const totalProducts = await prisma.product.count({ where })
    const products = await prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        category: true,
      },
    })

    return NextResponse.json({ 
      products, 
      total: totalProducts,
      page,
      limit,
      totalPages: Math.ceil(totalProducts / limit),
      hasMore: page * limit < totalProducts
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Error fetching products' },
      { status: 500 }
    )
  }
} 