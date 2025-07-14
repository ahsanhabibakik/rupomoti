import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';



import { z } from 'zod';

// Query schema for filtering with proper handling of empty strings
const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional().default(''),
  status: z.string().optional().transform(val => {
    if (!val || val === '') return 'all';
    return ['active', 'inactive', 'all'].includes(val) ? val : 'all';
  }),
  sortBy: z.string().optional().transform(val => {
    if (!val || val === '' || val === 'sortOrder') return 'createdAt';
    return ['name', 'createdAt', 'products'].includes(val) ? val : 'createdAt';
  }),
  sortOrder: z.string().optional().transform(val => {
    if (!val || val === '') return 'desc';
    return ['asc', 'desc'].includes(val) ? val : 'desc';
  }),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

// GET /api/admin/categories - Get all categories with filtering and pagination
export async function GET(req: Request) {
  try {
    await connectDB();
    const session = await auth();

    if (!session || !['SUPER_ADMIN', 'ADMIN'].includes(session.user?.role as string)) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const query = querySchema.parse(Object.fromEntries(searchParams));

    const where: Record<string, unknown> = {};

    // Apply search filter
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    // Apply status filter
    if (query.status !== 'all') {
      where.isActive = query.status === 'active';
    }

    // Apply date range filter
    if (query.dateFrom && query.dateTo) {
      where.createdAt = {
        gte: new Date(query.dateFrom),
        lte: new Date(query.dateTo),
      };
    }

    const skip = (query.page - 1) * query.limit;

    // Build sort object
    let orderBy: Record<string, string> = {};
    if (query.sortBy === 'products') {
      // For products count, we'll sort by the count
      orderBy = { products: { _count: query.sortOrder } };
    } else {
      orderBy[query.sortBy] = query.sortOrder;
    }

    // Execute parallel queries
    const [categories, totalCount] = await Promise.all([
      prisma.category.findMany({
        where,
        include: {
          _count: {
            select: { products: true }
          }
        },
        orderBy,
        skip,
        take: query.limit,
      }),
      prisma.category.count({ where })
    ]);

    // Calculate additional stats
    const totalProducts = await prisma.product.count({
      where: { categoryId: { in: categories.map(c => c.id) } }
    });

    // Transform data for admin view
    const processedCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description,
      image: category.image,
      isActive: category.isActive,
      productsCount: category._count.products,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    }));

    const totalPages = Math.ceil(totalCount / query.limit);

    console.log(`✅ Admin Categories - Returning ${processedCategories.length} categories (page ${query.page}/${totalPages})`);

    return NextResponse.json({
      categories: processedCategories,
      totalCount,
      totalProducts,
      totalPages,
      currentPage: query.page,
      limit: query.limit,
      hasMore: query.page < totalPages,
    });
  } catch (error) {
    console.error('❌ Failed to fetch admin categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST /api/admin/categories - Create new category
export async function POST(req: Request) {
  try {
    await connectDB();
    const session = await auth();

    if (!session || !['SUPER_ADMIN', 'ADMIN'].includes(session.user?.role as string)) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, description, image, isActive } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    // Check if category with same name exists
    const existingCategory = await prisma.category.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } }
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Category with this name already exists' },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name,
        description,
        image,
        isActive: isActive ?? true,
      },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    return NextResponse.json({
      message: 'Category created successfully',
      category: {
        id: category.id,
        name: category.name,
        description: category.description,
        image: category.image,
        isActive: category.isActive,
        productsCount: category._count.products,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      }
    });
  } catch (error) {
    console.error('❌ Failed to create category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/categories - Update category
export async function PUT(req: Request) {
  try {
    await connectDB();
    const session = await auth();

    if (!session || !['SUPER_ADMIN', 'ADMIN'].includes(session.user?.role as string)) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { id, name, description, image, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id }
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Check if another category with same name exists
    const duplicateCategory = await prisma.category.findFirst({
      where: { 
        name: { equals: name, mode: 'insensitive' },
        id: { not: id }
      }
    });

    if (duplicateCategory) {
      return NextResponse.json(
        { error: 'Category with this name already exists' },
        { status: 400 }
      );
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        description,
        image,
        isActive,
      },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    return NextResponse.json({
      message: 'Category updated successfully',
      category: {
        id: category.id,
        name: category.name,
        description: category.description,
        image: category.image,
        isActive: category.isActive,
        productsCount: category._count.products,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      }
    });
  } catch (error) {
    console.error('❌ Failed to update category:', error);
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/categories - Delete category
export async function DELETE(req: Request) {
  try {
    await connectDB();
    const session = await auth();

    if (!session || !['SUPER_ADMIN', 'ADMIN'].includes(session.user?.role as string)) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Check if category has products
    if (existingCategory._count.products > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with existing products' },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: { id }
    });

    return NextResponse.json({
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('❌ Failed to delete category:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}
