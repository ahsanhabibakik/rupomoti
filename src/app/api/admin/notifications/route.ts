import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get recent orders for notifications
    const recentOrders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
        deletedAt: null,
      },
      include: {
        customer: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    })

    // Get low stock products
    const lowStockProducts = await prisma.product.findMany({
      where: {
        stock: {
          lte: 5, // Consider low stock when 5 or fewer items
        },
        deletedAt: null,
      },
      take: 5,
    })

    // Create notifications array
    const notifications = []

    // Add order notifications
    recentOrders.forEach(order => {
      notifications.push({
        id: `order-${order.id}`,
        type: 'order',
        title: 'New Order Received',
        message: `Order #${order.id.slice(-8)} has been placed by ${order.customer.name || 'Customer'}`,
        timestamp: order.createdAt.toISOString(),
        read: false,
        metadata: { orderId: order.id },
      })
    })

    // Add inventory notifications
    lowStockProducts.forEach(product => {
      notifications.push({
        id: `inventory-${product.id}`,
        type: 'inventory',
        title: 'Low Stock Alert',
        message: `Product "${product.name}" is running low on stock (${product.stock} remaining)`,
        timestamp: new Date().toISOString(),
        read: false,
        metadata: { productId: product.id },
      })
    })

    // Sort by timestamp (newest first)
    notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return NextResponse.json(notifications)
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
