import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/auth';
import { ShippingManager } from '@/lib/shipping'

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const body = await req.json()
    const { action, orderId, trackingNumber, provider, status } = body
    switch (action) {
      case 'add-tracking':
        if (!orderId || !trackingNumber || !provider) {
          return NextResponse.json(
            { error: 'Order ID, tracking number, and provider required' },
            { status: 400 }
          )
        }
        const order = await ShippingManager.addTrackingToOrder(
          orderId,
          trackingNumber,
          provider
        )
        return NextResponse.json(order)
      case 'update-status':
        if (!orderId || !status) {
          return NextResponse.json(
            { error: 'Order ID and status required' },
            { status: 400 }
          )
        }
        const updatedOrder = await ShippingManager.updateShippingStatus(
          orderId,
          status
        )
        return NextResponse.json(updatedOrder)
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Shipping API error:', error)
    return NextResponse.json(
      { error: 'Failed to process shipping request' },
      { status: 500 }
    )
  }
}
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url)
    const orderId = searchParams.get('orderId')
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 })
    }
    const shippingStatus = await ShippingManager.getShippingStatus(orderId)
    return NextResponse.json(shippingStatus)
  } catch (error) {
    console.error('Shipping API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch shipping status' },
      { status: 500 }
    )
  }
}
