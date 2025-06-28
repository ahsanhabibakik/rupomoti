import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/auth';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('categoryId');
    const stockStatus = searchParams.get('stockStatus');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const isFeatured = searchParams.get('isFeatured');
    const isNewArrival = searchParams.get('isNewArrival');
    const isPopular = searchParams.get('isPopular');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);

    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (categoryId && categoryId !== 'all-categories') {
      where.categoryId = categoryId;
    }
    
    if (stockStatus && stockStatus !== 'all') {
      if (stockStatus === 'in-stock') {
        where.stock = { gt: 0 };
      } else if (stockStatus === 'out-of-stock') {
        where.stock = { equals: 0 };
      } else if (stockStatus === 'low-stock') {
        where.stock = { gt: 0, lt: 10 };
      }
    }
    
    if (minPrice) {
      where.price = { ...where.price, gte: parseFloat(minPrice) };
    }
    if (maxPrice) {
      where.price = { ...where.price, lte: parseFloat(maxPrice) };
    }
    
    if (isFeatured === 'true' || isFeatured === 'false') {
      where.isFeatured = isFeatured === 'true';
    }
    if (isNewArrival === 'true' || isNewArrival === 'false') {
      where.isNewArrival = isNewArrival === 'true';
    }
    if (isPopular === 'true' || isPopular === 'false') {
      where.isPopular = isPopular === 'true';
    }
    if (status) {
      if (status === 'ACTIVE' || status === 'TRASHED' || status === 'ARCHIVED') {
        where.status = status;
      }
    } else {
      where.status = 'ACTIVE';
    }

    const totalProducts = await prisma.product.count({ where });
    const products = await prisma.product.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ 
      products,
      totalCount: totalProducts,
      totalPages: Math.ceil(totalProducts / pageSize),
    });
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    const product = await prisma.product.create({
      data: { ...body },
    });

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Failed to create product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...data } = body;

    const product = await prisma.product.update({
      where: { id },
      data,
    });

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Failed to update product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
    try {
      const session = await getServerSession(authOptions);
      if (!session || !session.user || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
  
      const { searchParams } = new URL(request.url);
      const id = searchParams.get('id');
  
      if (!id) {
        return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
      }
  
      await prisma.product.update({
        where: { id },
        data: { status: 'TRASHED' },
      });
  
      return NextResponse.json({ success: true, message: 'Product moved to trash.' });
    } catch (error) {
      console.error('Error moving product to trash:', error);
      return NextResponse.json({ error: 'Failed to move product to trash' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const action = searchParams.get('action');

    if (!id || !action) {
      return NextResponse.json({ error: 'Product ID and action are required' }, { status: 400 });
    }

    if (action === 'restore') {
      await prisma.product.update({
        where: { id },
        data: { status: 'ACTIVE' },
      });
      return NextResponse.json({ success: true, message: 'Product restored.' });
    } else if (action === 'delete-permanent') {
      // Before permanent deletion, check if the product is in any orders
      const orderItems = await prisma.orderItem.findMany({
        where: { productId: id },
      });

      if (orderItems.length > 0) {
        return NextResponse.json({ error: 'Cannot delete product that is part of an order. Consider archiving it instead.' }, { status: 409 });
      }

      await prisma.product.delete({
        where: { id },
      });
      return NextResponse.json({ success: true, message: 'Product deleted permanently.' });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error updating product status:', error);
    return NextResponse.json({ error: 'Failed to update product status' }, { status: 500 });
    }
}

// Helper function to generate SKU
function generateSKU(name: string): string {
  const prefix = name.substring(0, 3).toUpperCase();
  const timestamp = Date.now().toString().slice(-6);
  return `${prefix}${timestamp}`;
} 