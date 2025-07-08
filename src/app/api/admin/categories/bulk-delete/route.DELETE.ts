import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/auth';
import { prisma } from '@/lib/prisma';
import { AuditLogger } from '@/lib/audit-logger';

export const dynamic = 'force-dynamic';

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    
    // Check authentication and authorization
    if (!session || !['SUPER_ADMIN', 'ADMIN'].includes(session.user?.role as string)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json().catch(() => ({}));
    const { categoryIds } = body;

    // Validate input
    if (!categoryIds?.length) {
      return NextResponse.json({ error: 'Invalid request. Category IDs are required.' }, { status: 400 });
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
        _count: { select: { products: true } }
      }
    });

    if (categoriesWithProducts.length > 0) {
      return NextResponse.json({
        error: 'Cannot delete categories with existing products',
        categoriesWithProducts: categoriesWithProducts.map(cat => ({
          id: cat.id,
          name: cat.name,
          productsCount: cat._count.products
        }))
      }, { status: 400 });
    }

    // Log the action for auditing
    await AuditLogger.log({
      userId: session.user.id,
      model: 'Category',
      action: 'BULK_DELETE_CATEGORIES',
      recordId: categoryIds.join(','),
      details: { categoryIds }
    }).catch(err => console.error('Failed to log audit:', err));

    // Delete categories
    const result = await prisma.category.deleteMany({
      where: {
        id: { in: categoryIds },
        // Additional safety check to ensure no products are attached
        products: { none: {} }
      }
    });

    return NextResponse.json({
      message: `Successfully deleted ${result.count} categories`,
      count: result.count
    });
  } catch (error) {
    console.error('Error during bulk delete categories:', error);
    return NextResponse.json({ error: 'Failed to delete categories' }, { status: 500 });
  }
}
