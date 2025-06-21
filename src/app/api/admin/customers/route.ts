import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth-config';

export async function GET() {
  try {
    const session = await getServerSession(authConfig);
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const customers = await prisma.customer.findMany({
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