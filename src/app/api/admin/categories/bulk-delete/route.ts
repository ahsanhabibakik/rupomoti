import { NextResponse } from 'next/server';
import { auth } from '@/app/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session || !['SUPER_ADMIN', 'ADMIN'].includes(session.user?.role as string)) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
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

    // Delete categories
    const result = await prisma.category.deleteMany({
      where: {
        id: { in: categoryIds }
      }
    });

    console.log(`✅ Bulk deleted ${result.count} categories`);

    return NextResponse.json({
      message: `Successfully deleted ${result.count} categories`,
      deletedCount: result.count
    });

  } catch (error) {
    console.error('❌ Failed to bulk delete categories:', error);
    return NextResponse.json(
      { error: 'Failed to delete categories' },
      { status: 500 }
    );
  }
}
