import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/auth";
import { withMongoose, parseQueryParams, getPaginationParams } from '@/lib/mongoose-utils';


export const GET = withMongoose(async (req) => {
  try {
    const session = await auth();
    if (!session?.user?.isAdmin && session?.user?.role !== 'ADMIN' && session?.user?.role !== 'MANAGER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all orders for statistics
    const orders = await prisma.order.findMany({
      where: {
        deletedAt: null // Only non-deleted orders
      },
      select: {
        id: true,
        status: true,
        total: true,
        createdAt: true,
        isFakeOrder: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    const today = new Date();
    const isToday = (date: Date) => {
      const d = new Date(date);
      return d.getDate() === today.getDate() &&
             d.getMonth() === today.getMonth() &&
             d.getFullYear() === today.getFullYear();
    };

    const statistics = {
      total: orders.length,
      pending: orders.filter(o => o.status === 'PENDING').length,
      processing: orders.filter(o => o.status === 'PROCESSING').length,
      confirmed: orders.filter(o => o.status === 'CONFIRMED').length,
      shipped: orders.filter(o => o.status === 'SHIPPED').length,
      delivered: orders.filter(o => o.status === 'DELIVERED').length,
      cancelled: orders.filter(o => o.status === 'CANCELLED').length,
      fake: orders.filter(o => o.isFakeOrder === true).length,
      newToday: orders.filter(o => isToday(o.createdAt)).length,
      revenue: orders.reduce((sum, o) => sum + (o.total || 0), 0),
      revenueToday: orders.filter(o => isToday(o.createdAt)).reduce((sum, o) => sum + (o.total || 0), 0)
    };

    return NextResponse.json(statistics);
  } catch (error) {
    console.error('Error fetching order statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order statistics' },
      { status: 500 }
    );
  }
}
