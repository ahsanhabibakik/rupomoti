import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Webhook handler for Steadfast delivery status updates
export async function POST(request: Request) {
  try {
    // Verify webhook auth token
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    if (token !== process.env.STEADFAST_WEBHOOK_TOKEN) {
      return NextResponse.json({ status: 'error', message: 'Invalid token' }, { status: 401 })
    }

    const payload = await request.json()
    console.log('📦 Steadfast webhook received:', payload)

    // Handle different notification types
    switch (payload.notification_type) {
      case 'delivery_status':
        await handleDeliveryStatus(payload)
        break
      case 'tracking_update':
        await handleTrackingUpdate(payload)
        break
      default:
        console.warn('⚠️ Unknown notification type:', payload.notification_type)
    }

    return NextResponse.json({ status: 'success', message: 'Webhook received successfully.' })
  } catch (error) {
    console.error('❌ Webhook processing error:', error)
    return NextResponse.json(
      { status: 'error', message: 'Failed to process webhook' },
      { status: 500 }
    )
  }
}

async function handleDeliveryStatus(payload: any) {
  const { consignment_id, invoice, status, cod_amount, delivery_charge, tracking_message, updated_at } = payload

  // Map Steadfast status to our OrderStatus
  const orderStatus = mapSteadfastStatus(status)

  try {
    // Find order by invoice number
    const order = await prisma.order.findFirst({
      where: { orderNumber: invoice }
    })

    if (!order) {
      console.error('❌ Order not found for invoice:', invoice)
      return
    }

    // Update order status and Steadfast info
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: orderStatus,
        steadfastInfo: {
          consignmentId: consignment_id.toString(),
          status: status,
          lastUpdate: new Date(updated_at),
          deliveryCharge: delivery_charge,
          codAmount: cod_amount,
          lastMessage: tracking_message
        }
      }
    })

    console.log('✅ Order status updated:', { invoice, status: orderStatus })
  } catch (error) {
    console.error('❌ Failed to update order status:', error)
    throw error
  }
}

async function handleTrackingUpdate(payload: any) {
  const { consignment_id, invoice, tracking_message, updated_at } = payload

  try {
    // Find order by invoice number
    const order = await prisma.order.findFirst({
      where: { orderNumber: invoice }
    })

    if (!order) {
      console.error('❌ Order not found for invoice:', invoice)
      return
    }

    // Update tracking information
    await prisma.order.update({
      where: { id: order.id },
      data: {
        steadfastInfo: {
          ...order.steadfastInfo,
          lastUpdate: new Date(updated_at),
          lastMessage: tracking_message
        }
      }
    })

    console.log('✅ Tracking info updated:', { invoice, message: tracking_message })
  } catch (error) {
    console.error('❌ Failed to update tracking info:', error)
    throw error
  }
}

function mapSteadfastStatus(steadfastStatus: string): 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' {
  switch (steadfastStatus.toLowerCase()) {
    case 'delivered':
      return 'DELIVERED'
    case 'partial_delivered':
      return 'DELIVERED'
    case 'cancelled':
      return 'CANCELLED'
    case 'pending':
      return 'PROCESSING'
    default:
      return 'SHIPPED'
  }
} 