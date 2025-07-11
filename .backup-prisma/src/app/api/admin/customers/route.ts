import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/app/auth';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (
      !session ||
      !session.user ||
      !['ADMIN', 'MANAGER', 'SUPER_ADMIN'].includes(session.user.role)
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status') || 'all';
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const offset = (page - 1) * limit;

    console.log('📊 Query params:', { search, status, from, to, page, limit });

    // Build where clause
    const where: Prisma.CustomerWhereInput = {};
    
    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Status filter
    switch (status) {
      case 'verified':
        where.isVerified = true;
        break;
      case 'unverified':
        where.isVerified = false;
        break;
      case 'flagged':
        where.isFlagged = true;
        break;
      case 'vip':
        // VIP customers are those with high total spending
        // We'll filter this after the query since we need to calculate total spent
        break;
    }

    // Date range filter
    if (from && to) {
      where.createdAt = {
        gte: new Date(from),
        lte: new Date(to)
      };
    }

    console.log('🔍 Where clause:', JSON.stringify(where, null, 2));

    // Execute parallel queries for better performance
    const [customers, totalCount] = await Promise.all([
      prisma.customer.findMany({
        where,
        include: {
          orders: {
            select: {
              id: true,
              total: true,
              status: true,
              createdAt: true,
              orderNumber: true
            },
            orderBy: { createdAt: 'desc' },
            take: 5 // Only get recent orders for details
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.customer.count({ where })
    ]);

    // Process customers data to include calculated fields
    const processedCustomers = customers.map(customer => {
      const totalSpent = customer.orders.reduce((sum, order) => sum + order.total, 0);
      const totalOrders = customer.orders.length;
      const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
      const lastOrderDate = customer.orders.length > 0 ? customer.orders[0].createdAt : null;

      return {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        image: customer.image,
        role: customer.role || 'USER',
        isVerified: customer.isVerified || false,
        isFlagged: customer.isFlagged || false,
        totalOrders,
        totalSpent,
        averageOrderValue,
        lastOrderDate,
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt,
        orders: customer.orders,
        user: customer.user
      };
    });

    // Filter VIP customers if requested
    let filteredCustomers = processedCustomers;
    if (status === 'vip') {
      filteredCustomers = processedCustomers.filter(c => c.totalSpent > 50000); // VIP threshold
    }

    const totalPages = Math.ceil(totalCount / limit);

    console.log(`✅ Returning ${filteredCustomers.length} customers (page ${page}/${totalPages})`);

    return NextResponse.json({
      customers: filteredCustomers,
      total: totalCount,
      page,
      totalPages,
      limit
    });
  } catch (error) {
    console.error('❌ Failed to fetch customers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}