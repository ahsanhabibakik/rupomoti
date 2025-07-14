import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongoose'
import { getCategoryModel } from '@/models/Category';
import { getProductModel } from '@/models/Product';
const Category = getCategoryModel();
const Product = getProductModel();

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    await connectDB();
    await dbConnect()
    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const search = searchParams.get('search') || '';

    // Build query filter
    const filter: Record<string, unknown> = {}
    if (search) {
      filter.name = { $regex: search, $options: 'i' }
    }

    // Get total count
    const totalCategories = await Category.countDocuments(filter)

    // Get categories with pagination
    const categories = await Category
      .find(filter)
      .sort({ name: 1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean()
      .exec()

    // Get product counts for each category
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        const productCount = await Product.countDocuments({
          categoryId: category._id.toString(),
          status: 'ACTIVE'
        })
        
        return {
          id: category._id.toString(),
          name: category.name,
          description: category.description || null,
          image: category.image || null,
          slug: category.slug,
          isActive: category.isActive || true,
          sortOrder: category.sortOrder || 0,
          seo: category.seo || {},
          createdAt: category.createdAt,
          updatedAt: category.updatedAt,
          _count: {
            products: productCount
          }
        }
      })
    )

    const totalPages = Math.ceil(totalCategories / pageSize)

    return NextResponse.json({
      success: true,
      data: categoriesWithCounts,
      pagination: {
        page,
        pageSize,
        totalCategories,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    })

  } catch (error) {
    console.error('Categories API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    await dbConnect()
    
    const body = await req.json()
    const { name, description, image, slug, isActive = true, sortOrder = 0, seo } = body

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      )
    }

    // Check if slug already exists
    const existingCategory = await Category.findOne({ slug })
    if (existingCategory) {
      return NextResponse.json(
        { error: 'A category with this slug already exists' },
        { status: 400 }
      )
    }

    const newCategory = new Category({
      name,
      description: description || null,
      image: image || null,
      slug,
      isActive,
      sortOrder,
      seo: seo || {}
    })

    const savedCategory = await newCategory.save()
    
    const createdCategory = {
      id: savedCategory._id.toString(),
      ...savedCategory.toObject(),
      _count: { products: 0 }
    }

    return NextResponse.json({
      success: true,
      data: createdCategory
    }, { status: 201 })

  } catch (error) {
    console.error('Create Category Error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to create category',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
