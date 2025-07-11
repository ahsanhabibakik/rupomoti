import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongoose'
import Category from '@/models/Category'

export const GET = withMongoose(async (req) => {
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

    // Calculate pagination
    const skip = (page - 1) * pageSize

    // Execute queries
    const [categories, totalCategories] = await Promise.all([
      Category.find(query)
        .sort({ sortOrder: 1, name: 1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      Category.countDocuments(query)
    ])

    // Get product counts for each category
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        const productCount = await Category.aggregate([
          { $match: { _id: category._id } },
          {
            $lookup: {
              from: 'Product',
              localField: '_id',
              foreignField: 'category',
              as: 'products'
            }
          },
          {
            $project: {
              productCount: { $size: '$products' }
            }
          }
        ])

        return {
          ...category,
          id: (category as any)._id.toString(),
          _count: {
            products: productCount[0]?.productCount || 0
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
        total: totalCategories,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })

  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch categories',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export const POST = withMongoose(async (req) => {
  try {
    await dbConnect()

    const body = await request.json()
    const {
      name,
      slug,
      description,
      image,
      isActive,
      sortOrder,
      metaTitle,
      metaDescription,
      parentId
    } = body

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      )
    }

    // Generate slug if not provided
    const categorySlug = slug || name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Check if slug already exists
    const existingCategory = await Category.findOne({ slug: categorySlug })
    if (existingCategory) {
      return NextResponse.json(
        { success: false, error: 'Slug already exists' },
        { status: 400 }
      )
    }

    // If parentId is provided, check if parent exists
    if (parentId) {
      const parent = await Category.findById(parentId)
      if (!parent) {
        return NextResponse.json(
          { success: false, error: 'Parent category not found' },
          { status: 400 }
        )
      }
    }

    // Create category
    const category = new Category({
      name,
      slug: categorySlug,
      description,
      image,
      isActive: isActive !== undefined ? isActive : true,
      sortOrder: sortOrder || 0,
      metaTitle,
      metaDescription,
      parentId
    })

    await category.save()

    return NextResponse.json({
      success: true,
      data: category,
      message: 'Category created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create category',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export const PUT = withMongoose(async (req) => {
  try {
    await dbConnect()

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Category ID is required' },
        { status: 400 }
      )
    }

    // If slug is being updated, check for duplicates
    if (updateData.slug) {
      const existingCategory = await Category.findOne({ 
        slug: updateData.slug,
        _id: { $ne: id }
      })
      if (existingCategory) {
        return NextResponse.json(
          { success: false, error: 'Slug already exists' },
          { status: 400 }
        )
      }
    }

    const category = await Category.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    )

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: category,
      message: 'Category updated successfully'
    })

  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update category',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export const DELETE = withMongoose(async (req) => {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Category ID is required' },
        { status: 400 }
      )
    }

    // Check if category has products
    const productCount = await Category.aggregate([
      { $match: { _id: id } },
      {
        $lookup: {
          from: 'Product',
          localField: '_id',
          foreignField: 'category',
          as: 'products'
        }
      },
      {
        $project: {
          productCount: { $size: '$products' }
        }
      }
    ])

    if (productCount[0]?.productCount > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cannot delete category with products. Please move or delete products first.' 
        },
        { status: 400 }
      )
    }

    const category = await Category.findByIdAndDelete(id)

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete category',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
