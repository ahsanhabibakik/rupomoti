import { NextRequest, NextResponse } from 'next/server'
const { auth } = await import('@/app/auth');



export async function GET(
  request: NextRequest,
  { params }: { params: { orderNumber: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { orderNumber } = params

    if (!orderNumber) {
      return NextResponse.json({ error: 'Order number is required' }, { status: 400 })
    }

    const order = await prisma.order.findFirst({
      where: { 
        orderNumber,
        userId: session.user.id
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
                price: true
              }
            }
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Generate tracking history based on order status and courier info
    const trackingHistory = generateTrackingHistory(order)

    return NextResponse.json({
      order,
      trackingHistory
    })
  } catch (error) {
    console.error('Error fetching order tracking:', error)
    return NextResponse.json({ error: 'Failed to fetch order tracking' }, { status: 500 })
  }
}

function generateTrackingHistory(order: Record<string, unknown>) {
  const history = []

  // Order placed
  history.push({
    status: 'PENDING',
    timestamp: order.createdAt,
    description: 'Order has been placed successfully',
    location: 'Online'
  })

  // Processing
  if (['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status)) {
    history.push({
      status: 'PROCESSING',
      timestamp: new Date(order.createdAt).getTime() + 2 * 60 * 60 * 1000, // 2 hours after order
      description: 'Order is being processed',
      location: 'Warehouse'
    })
  }

  // Shipped
  if (['SHIPPED', 'DELIVERED'].includes(order.status)) {
    history.push({
      status: 'SHIPPED',
      timestamp: new Date(order.createdAt).getTime() + 24 * 60 * 60 * 1000, // 1 day after order
      description: order.courierName 
        ? `Order has been shipped via ${order.courierName}`
        : 'Order has been shipped',
      location: order.courierName ? `${order.courierName} Facility` : 'Shipping Center'
    })

    // Add courier tracking info if available
    if (order.courierTrackingCode) {
      history.push({
        status: 'SHIPPED',
        timestamp: new Date(order.createdAt).getTime() + 24 * 60 * 60 * 1000,
        description: `Tracking number: ${order.courierTrackingCode}`,
        location: 'Courier System'
      })
    }
  }

  // Delivered
  if (order.status === 'DELIVERED') {
    history.push({
      status: 'DELIVERED',
      timestamp: order.updatedAt,
      description: 'Order has been delivered successfully',
      location: order.deliveryAddress
    })
  }

  // Sort by timestamp
  return history.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
} 