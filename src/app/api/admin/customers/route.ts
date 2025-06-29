import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/app/auth';
import { Prisma } from '@prisma/client';

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

    const where: Prisma.CustomerWhereInput = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const customers = await prisma.customer.findMany({
      where,
      include: {
        orders: true, 
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    // Process data to include order count and total value
    const processedCustomers = customers.map(customer => {
        const totalSpent = customer.orders.reduce((sum, order) => sum + order.total, 0);
        return {
            ...customer,
            orderCount: customer.orders.length,
            totalSpent
        }
    });

    return NextResponse.json({ customers: processedCustomers });
  } catch (error) {
    console.error('Failed to fetch customers:', error);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}