import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
const { auth } = await import('@/app/auth');


import { AuditLogger } from '@/lib/audit-logger';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Support both POST and DELETE methods for better RESTful API design
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
    const { categoryIds } = body;

    if (!categoryIds || !Array.isArray(categoryIds) || categoryIds.length === 0) {
      return NextResponse.json(
        { error: 'Category IDs array is required' },
        { status: 400 }
      );
    }

    // Check if any categories have products
    const categoriesWithProducts = await prisma.category.findMany({
      where: {
        id: { in: categoryIds },
        products: { some: {} }
      },
      select: {
        id: true,
        name: true,
        _count: {
          select: { products: true }
        }
      }
    });

    if (categoriesWithProducts.length > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete categories with existing products',
          categoriesWithProducts: categoriesWithProducts.map(cat => ({
            id: cat.id,
            name: cat.name,
            productsCount: cat._count.products
          }))
        },
        { status: 400 }
      );
    }

    // Log the action for auditing
    await AuditLogger.log({
      userId: session.user.id,
      model: 'Category',
      action: 'BULK_DELETE_CATEGORIES',
      recordId: categoryIds.join(','),
      details: { categoryIds }
    }).catch(err => console.error('Failed to log audit:', err));
    
    // Delete categories with safety check
    const result = await prisma.category.deleteMany({
      where: {
        id: { in: categoryIds },
        // Additional safety check to ensure no products are attached
        products: { none: {} }
      }
    });

    console.log(`✅ Bulk deleted ${result.count} categories`);

    return NextResponse.json({
      message: `Successfully deleted ${result.count} categories`,
      count: result.count
    });

  } catch (error) {
    console.error('❌ Failed to bulk delete categories:', error);
    return NextResponse.json(
      { error: 'Failed to delete categories' },
      { status: 500 }
    );
  }
}