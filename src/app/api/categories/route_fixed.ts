import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongoose'
import { getCategoryModel } from '@/models/Category';
const Category = getCategoryModel();

export async function GET(request: Request) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10)
    const search = searchParams.get('search') || ''
    const active = searchParams.get('active')
    const level = searchParams.get('level')

    // Build query
    const query: Record<string, unknown> = {}
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    }

    if (active !== null && active !== undefined) {
      query.isActive = active === 'true'
    }

    if (level !== null && level !== undefined) {
      query.level = parseInt(level, 10)
    }

    // Calculate skip for pagination
    const skip = (page - 1) * pageSize

    // Execute query with pagination
    const [categories, totalCount] = await Promise.all([
      Category.find(query)
        .populate('parent', 'name slug')
        .populate('children', 'name slug')
        .sort({ level: 1, sortOrder: 1, name: 1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      Category.countDocuments(query)
    ])

    const totalPages = Math.ceil(totalCount / pageSize)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return NextResponse.json({
      categories,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    })

  } catch (error) {
    console.error('Categories API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch categories',
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
    const { name, slug } = body
    
    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Missing required fields: name and slug' },
        { status: 400 }
      )
    }

    // Check if slug already exists
    const existingCategory = await Category.findOne({ slug })
    if (existingCategory) {
      return NextResponse.json(
        { error: 'Category with this slug already exists' },
        { status: 400 }
      )
    }

    // If parent is specified, validate it exists
    if (body.parent) {
      const parentCategory = await Category.findById(body.parent)
      if (!parentCategory) {
        return NextResponse.json(
          { error: 'Parent category not found' },
          { status: 400 }
        )
      }
      body.level = parentCategory.level + 1
    } else {
      body.level = 1
    }

    // Create category
    const category = await Category.create(body)
    
    // Populate relationships
    await category.populate('parent', 'name slug')

    return NextResponse.json(category, { status: 201 })

  } catch (error) {
    console.error('Create category error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create category',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
