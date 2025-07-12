import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db';


export async function GET() {
  try {
    console.log('🧪 Testing MongoDB isFakeOrder query fix...')
    
    // Test the corrected query
    const activeOrders = await prisma.order.findMany({
      where: {
        deletedAt: null,
        isFakeOrder: false // Explicitly match false for MongoDB
      },
      select: {
        id: true,
        orderNumber: true,
        isFakeOrder: true,
        deletedAt: true,
        createdAt: true,
        recipientName: true,
        total: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    const activeCount = await prisma.order.count({
      where: {
        deletedAt: null,
        isFakeOrder: false
      }
    })

    const allCount = await prisma.order.count({
      where: {
        deletedAt: null
      }
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
