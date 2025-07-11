import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import Order from '@/models/Order'

export async function GET() {
  try {
    console.log('🧪 Testing MongoDB isFakeOrder query fix...')
    
    // Connect to MongoDB
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI!)
    }
    
    // Test the corrected query
    const activeOrders = await Order.find({
      deletedAt: null,
      isFakeOrder: false // Explicitly match false for MongoDB
    }, {
      orderNumber: 1,
      isFakeOrder: 1,
      deletedAt: 1,
      createdAt: 1,
      recipientName: 1,
      total: 1
    })
      .sort({ createdAt: -1 })
      .limit(10)

    const activeCount = await Order.countDocuments({
      deletedAt: null,
      isFakeOrder: false
    })

    const allCount = await Order.countDocuments({
      deletedAt: null
    })

    console.log('✅ Query test results:', {
      activeOrdersFound: activeOrders.length,
      activeCount,
      allCount,
      firstOrder: activeOrders[0] ? {
        orderNumber: activeOrders[0].orderNumber,
        isFakeOrder: activeOrders[0].isFakeOrder,
        recipientName: activeOrders[0].recipientName
      } : null
    })

    return NextResponse.json({
      success: true,
      activeOrdersFound: activeOrders.length,
      activeCount,
      allCount,
      orders: activeOrders.map(order => ({
        orderNumber: order.orderNumber,
        isFakeOrder: order.isFakeOrder,
        recipientName: order.recipientName,
        total: order.total,
        createdAt: order.createdAt
      }))
    })

  } catch (error) {
    console.error('❌ Error in query test:', error)
    return NextResponse.json(
      { 
        error: 'Test failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
