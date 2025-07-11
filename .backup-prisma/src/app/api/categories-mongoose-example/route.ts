import { NextRequest, NextResponse } from 'next/server';
import { withMongoose, parseQueryParams, getPaginationParams } from '@/lib/mongoose-utils';
import Category from '@/models/Category';

/**
 * GET /api/categories - Get all categories
 */
export const GET = withMongoose(async (req: NextRequest) => {
  try {
    // Parse query parameters
    const query = parseQueryParams(req.url);
    const { page, limit, skip } = getPaginationParams(req.url);
    
    // Build filter
    const filter: Record<string, unknown> = {};
    
    // Filter by featured status if specified
    if (query.featured !== undefined) {
      filter.featured = query.featured;
    }
    
    // Filter by parent category
    if (query.parent) {
      filter.parentId = query.parent;
    }
    
    // Search by name
    if (query.search) {
      filter.name = { $regex: query.search, $options: 'i' };
    }
    
    // Get categories with pagination
    const categories = await Category.find(filter)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    // Get total count
    const total = await Category.countDocuments(filter);
    
    // Format response
    return NextResponse.json({
      data: categories.map(category => ({
        id: category._id?.toString(),
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        image: category.image || '/images/categories/placeholder.svg',
        featured: category.featured || false,
        parentId: category.parentId?.toString() || null,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt
      })),
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting categories:', error);
    return NextResponse.json(
      { error: 'Failed to get categories' },
      { status: 500 }
    );
  }
});

/**
 * POST /api/categories - Create a new category
 */
export const POST = withMongoose(async (req: NextRequest) => {
  try {
    // Parse request body
    const body = await req.json();
    
    // Create category
    const category = await Category.create(body);
    
    // Return response
    return NextResponse.json({
      data: {
        id: category._id.toString(),
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        image: category.image || '/images/categories/placeholder.svg',
        featured: category.featured || false,
        parentId: category.parentId?.toString() || null,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
});
