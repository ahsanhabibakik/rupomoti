import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { OrderTrackingManager } from '@/lib/order-tracking'

// POST /api/orders/tracking/sync - Sync order statuses with courier
export async function POST(req: Request) {
  try {
    await connectDB();
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { orderIds } = body

    if (!orderIds || !Array.isArray(orderIds)) {
      return NextResponse.json(
        { error: 'Order IDs array is required' },
        { status: 400 }
      )
    }

    const results = []
    for (const orderId of orderIds) {
      try {
        const result = await OrderTrackingManager.syncOrderStatus(orderId)
        results.push({ orderId, success: true, ...result })
      } catch (error) {
        results.push({ 
          orderId, 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        })
      }
    }

    return NextResponse.json({
      success: true,
      results
    })
  } catch (error) {
    console.error('Failed to sync tracking:', error)
    return NextResponse.json(
      { error: 'Failed to sync tracking' },
      { status: 500 }
    )
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
}// GET /api/orders/tracking/sync - Get tracking info for multiple orders
export async function GET(req: Request) {
  try {
    await connectDB();
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const orderIds = searchParams.get('orderIds')?.split(',') || []

    if (orderIds.length === 0) {
      return NextResponse.json(
        { error: 'Order IDs are required' },
        { status: 400 }
      )
    }

    const results = await OrderTrackingManager.bulkTrackOrders(orderIds)

    return NextResponse.json({
      success: true,
      results
    })
  } catch (error) {
    console.error('Failed to bulk track orders:', error)
    return NextResponse.json(
      { error: 'Failed to bulk track orders' },
      { status: 500 }
    )
  }
}
