import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { OrderTrackingManager } from '@/lib/order-tracking'

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await auth()
    const orderId = params.orderId

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Allow users to track their own orders, admins can track any order
    const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(session.user.role)
    const userId = isAdmin ? undefined : session.user.id

    const trackingInfo = await OrderTrackingManager.getCustomerTrackingInfo(orderId, userId)

    return NextResponse.json({
      success: true,
      ...trackingInfo
    })
  } catch (error) {
    console.error('Failed to get tracking info:', error)
    return NextResponse.json(
      { error: 'Failed to get tracking information' },
      { status: 500 }
    )
  }
}

// POST /api/orders/[orderId]/track - Create shipment
export async function POST(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { 
      courier, 
      recipientName, 
      recipientPhone, 
      recipientAddress, 
      recipientCity,
      recipientZone,
      recipientArea,
      weight,
      packageValue,
      paymentMethod,
      codAmount,
      note 
    } = body

    const orderId = params.orderId

    let result
    switch (courier?.toLowerCase()) {
      case 'steadfast':
        result = await OrderTrackingManager.createSteadfastShipment({
          orderId,
          recipientName,
          recipientPhone,
          recipientAddress,
          recipientCity,
          recipientZone,
          recipientArea,
          weight,
          packageValue,
          paymentMethod,
          codAmount,
          note
        })
        break
      default:
        return NextResponse.json(
          { error: 'Unsupported courier service' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      ...result
    })
  } catch (error) {
    console.error('Failed to create shipment:', error)
    return NextResponse.json(
      { error: 'Failed to create shipment' },
      { status: 500 }
    )
  }
}
