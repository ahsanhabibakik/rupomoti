import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(session.user?.role as string)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const type = searchParams.get('type') || 'all';
    const isRead = searchParams.get('isRead');

    const skip = (page - 1) * limit;

    // Since we don't have a notifications table yet, let's create dynamic notifications
    // from recent orders and low stock products
    
    // Get recent orders for notifications
    const recentOrders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
      include: {
        customer: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    // Get low stock products
    const lowStockProducts = await prisma.product.findMany({
      where: {
        stock: {
          lte: 5, // Consider low stock when 5 or fewer items
        },
        status: 'ACTIVE',
      },
      take: 5,
    });

    // Create notifications array
    const notifications: any[] = [];

    // Add order notifications
    recentOrders.forEach(order => {
      if (type === 'all' || type === 'order') {
        notifications.push({
          id: `order-${order.id}`,
          type: 'order',
          title: 'New Order Received',
          message: `Order #${order.orderNumber} has been placed by ${order.customer?.name || 'Customer'}`,
          createdAt: order.createdAt,
          isRead: false,
          readAt: null,
          user: {
            id: order.customer?.id,
            name: order.customer?.name,
            email: order.customer?.email,
          },
          metadata: { orderId: order.id },
        });
      }
    });

    // Add inventory notifications
    lowStockProducts.forEach(product => {
      if (type === 'all' || type === 'inventory') {
        notifications.push({
          id: `inventory-${product.id}`,
          type: 'inventory',
          title: 'Low Stock Alert',
          message: `Product "${product.name}" is running low on stock (${product.stock} remaining)`,
          createdAt: new Date(),
          isRead: false,
          readAt: null,
          user: null,
          metadata: { productId: product.id },
        });
      }
    });

    // Sort by timestamp (newest first)
    notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Apply pagination
    const total = notifications.length;
    const paginatedNotifications = notifications.slice(skip, skip + limit);

    return NextResponse.json({
      notifications: paginatedNotifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !['SUPER_ADMIN', 'ADMIN'].includes(session.user?.role as string)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, message, type, userId } = body;

    if (!title || !message || !type) {
      return NextResponse.json({ error: 'Title, message, and type are required' }, { status: 400 });
    }

    // For now, we'll just return success since we don't have a notifications table
    // In a real implementation, you would create the notification in the database
    const notification = {
      id: `custom-${Date.now()}`,
      title,
      message,
      type,
      createdAt: new Date(),
      isRead: false,
      readAt: null,
      user: userId ? { id: userId } : { id: session.user.id },
    };

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { notificationIds, isRead } = body;

    if (!Array.isArray(notificationIds)) {
      return NextResponse.json({ error: 'notificationIds must be an array' }, { status: 400 });
    }

    // For now, we'll just return success since we don't have a notifications table
    // In a real implementation, you would update the notifications in the database
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating notifications:', error);
    return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 });
  }
}
