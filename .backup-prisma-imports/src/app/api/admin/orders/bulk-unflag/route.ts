import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/auth';
import { withMongoose, parseQueryParams, getPaginationParams } from '@/lib/mongoose-utils';


export const PATCH = withMongoose(async (req) => {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { orderIds } = body;

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json({ error: 'Order IDs are required' }, { status: 400 });
    }

    // Unflag orders (mark as real orders)
    const result = await prisma.order.updateMany({
      where: {
        id: { in: orderIds },
        isFakeOrder: true,
        deletedAt: null
      },
      data: {
        isFakeOrder: false
      }
    });

    return NextResponse.json({ 
      success: true,
      message: `${result.count} orders unflagged successfully`,
      affected: result.count
    });

  } catch (error) {
    console.error('Bulk unflag error:', error);
    return NextResponse.json(
      { error: 'Failed to unflag orders' },
      { status: 500 }
    );
  }
}
