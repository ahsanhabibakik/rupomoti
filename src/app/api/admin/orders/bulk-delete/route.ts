import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/auth';



export async function DELETE(req: Request) {
  try {
    await connectDB();
  try {
    const session = await getServerSession(authOptions);
    
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

    // Soft delete fake orders
    const result = await prisma.order.updateMany({
      where: {
        id: { in: orderIds },
        isFakeOrder: true,
        deletedAt: null
      },
      data: {
        deletedAt: new Date()
      }
    });

    return NextResponse.json({ 
      success: true,
      message: `${result.count} fake orders deleted successfully`,
      affected: result.count
    });

  } catch (error) {
    console.error('Bulk delete fake orders error:', error);
    return NextResponse.json(
      { error: 'Failed to delete fake orders' },
      { status: 500 }
    );
  }
}
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}} catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}