import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongoose'
import { getOrderModel } from '@/models/Order';
const Order = getOrderModel();

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Webhook handler for Steadfast delivery status updates
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 })
    }
    const token = authHeader.split(' ')[1]
    if (token !== process.env.STEADFAST_WEBHOOK_TOKEN) {
      return NextResponse.json({ status: 'error', message: 'Invalid token' }, { status: 401 })
    }
    const payload = await req.json()
    console.log('📦 Steadfast webhook received:', payload)
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
    return NextResponse.json({ status: 'success' })
  } catch (error) {
    console.error('❌ Webhook error:', error)
    return NextResponse.json({ status: 'error', message: 'Internal server error' }, { status: 500 })
  }
}

async function handleDeliveryStatus(payload: Record<string, unknown>) {
  try {
    await dbConnect()
    
    // Find order by consignment ID
    const order = await Order.findOne({
      steadfastConsignmentId: payload.consignment_id,
      deletedAt: null
    })

    if (!order) {
      console.warn('⚠️ Order not found for consignment:', payload.consignment_id)
      return
    }

    // Update order status based on delivery status
    const statusMapping: Record<string, string> = {
      'delivered': 'DELIVERED',
      'partial_delivered': 'DELIVERED',
      'cancelled': 'CANCELLED',
      'returned': 'CANCELLED',
      'hold': 'PROCESSING',
      'in_transit': 'SHIPPED'
    }

    const newStatus = statusMapping[payload.delivery_status]
    if (newStatus && newStatus !== order.status) {
      await Order.findByIdAndUpdate(order._id, {
        status: newStatus,
        updatedAt: new Date()
      })
      
      console.log(`✅ Order ${order.orderNumber} status updated to ${newStatus}`)
    }
  } catch (error) {
    console.error('❌ Error handling delivery status:', error)
  }
}

async function handleTrackingUpdate(payload: Record<string, unknown>) {
  try {
    await dbConnect()
    
    // Find order by consignment ID
    const order = await Order.findOne({
      steadfastConsignmentId: payload.consignment_id,
      deletedAt: null
    })

    if (!order) {
      console.warn('⚠️ Order not found for consignment:', payload.consignment_id)
      return
    }

    // Update tracking information
    const updateData: Record<string, unknown> = {
      updatedAt: new Date()
    }

    if (payload.tracking_number) {
      updateData.trackingNumber = payload.tracking_number
    }

    if (payload.current_status) {
      const statusMapping: Record<string, string> = {
        'picked_up': 'CONFIRMED',
        'in_transit': 'SHIPPED', 
        'out_for_delivery': 'SHIPPED',
        'delivered': 'DELIVERED',
        'cancelled': 'CANCELLED',
        'returned': 'CANCELLED'
      }

      const newStatus = statusMapping[payload.current_status]
      if (newStatus) {
        updateData.status = newStatus
      }
    }

    await Order.findByIdAndUpdate(order._id, updateData)
    
    console.log('✅ Order tracking updated for', order.orderNumber)
  } catch (error) {
    console.error('❌ Error handling tracking update:', error)
  }
}