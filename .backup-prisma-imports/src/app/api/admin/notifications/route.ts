import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/auth';
import { withMongoose, parseQueryParams, getPaginationParams } from '@/lib/mongoose-utils';


export const dynamic = 'force-dynamic';

export const GET = withMongoose(async (req) => {
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
    // from recent orders, pending orders, and low stock products
    
    // Get recent orders (last 24 hours)
    const recentOrders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
        isActive: true,
      },
      include: {
        customer: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    });

    // Get pending orders (older than 2 hours, still pending)
    const pendingOrders = await prisma.order.findMany({
      where: {
        status: 'PENDING',
        createdAt: {
          lte: new Date(Date.now() - 2 * 60 * 60 * 1000), // Older than 2 hours
        },
        isActive: true,
      },
      include: {
        customer: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    });

    // Get very recent pending orders (need attention)
    const urgentPendingOrders = await prisma.order.findMany({
      where: {
        status: 'PENDING',
        paymentStatus: 'PENDING',
        isActive: true,
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
          lte: 5,
        },
        status: 'ACTIVE',
      },
      orderBy: {
        stock: 'asc',
      },
      take: 5,
    });

    // Get recent reviews pending moderation
    const pendingReviews = await prisma.review.findMany({
      where: {
        status: 'PENDING',
      },
      include: {
        product: {
          select: { id: true, name: true },
        },
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    });

    // Create notifications array
    const notifications: any[] = [];

    // Add recent order notifications
    recentOrders.forEach(order => {
      if (type === 'all' || type === 'order') {
        notifications.push({
          id: `recent-order-${order.id}`,
          type: 'order',
          title: 'New Order Received',
          message: `Order #${order.orderNumber} placed by ${order.customer?.name || 'Customer'} - $${order.total.toFixed(2)}`,
          createdAt: order.createdAt,
          isRead: false,
          readAt: null,
          priority: 'NORMAL',
          user: {
            id: order.customer?.id,
            name: order.customer?.name,
            email: order.customer?.email,
          },
          metadata: { orderId: order.id, orderNumber: order.orderNumber },
        });
      }
    });

    // Add urgent pending order notifications (high priority)
    urgentPendingOrders.forEach(order => {
      if (type === 'all' || type === 'pending') {
        const hoursOld = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60));
        notifications.push({
          id: `urgent-pending-${order.id}`,
          type: 'pending',
          title: 'Urgent: Pending Order Needs Attention',
          message: `Order #${order.orderNumber} pending for ${hoursOld}h - ${order.customer?.name || 'Customer'} - $${order.total.toFixed(2)}`,
          createdAt: order.createdAt,
          isRead: false,
          readAt: null,
          priority: 'HIGH',
          user: {
            id: order.customer?.id,
            name: order.customer?.name,
            email: order.customer?.email,
          },
          metadata: { orderId: order.id, orderNumber: order.orderNumber, hoursOld },
        });
      }
    });

    // Add old pending order notifications
    pendingOrders.forEach(order => {
      if (type === 'all' || type === 'pending') {
        const hoursOld = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60));
        notifications.push({
          id: `old-pending-${order.id}`,
          type: 'pending',
          title: 'Old Pending Order',
          message: `Order #${order.orderNumber} pending for ${hoursOld}h - Needs follow-up`,
          createdAt: order.createdAt,
          isRead: false,
          readAt: null,
          priority: 'NORMAL',
          user: {
            id: order.customer?.id,
            name: order.customer?.name,
            email: order.customer?.email,
          },
          metadata: { orderId: order.id, orderNumber: order.orderNumber, hoursOld },
        });
      }
    });

    // Add inventory notifications
    lowStockProducts.forEach(product => {
      if (type === 'all' || type === 'inventory') {
        const priority = product.stock === 0 ? 'URGENT' : product.stock <= 2 ? 'HIGH' : 'NORMAL';
        notifications.push({
          id: `inventory-${product.id}`,
          type: 'inventory',
          title: product.stock === 0 ? 'Out of Stock!' : 'Low Stock Alert',
          message: `"${product.name}" - ${product.stock} remaining${product.stock === 0 ? ' (SOLD OUT)' : ''}`,
          createdAt: new Date(),
          isRead: false,
          readAt: null,
          priority,
          user: null,
          metadata: { productId: product.id, stock: product.stock },
        });
      }
    });

    // Add review moderation notifications
    pendingReviews.forEach(review => {
      if (type === 'all' || type === 'review') {
        notifications.push({
          id: `review-${review.id}`,
          type: 'review',
          title: 'Review Awaiting Moderation',
          message: `${review.rating}-star review for "${review.product.name}" by ${review.user?.name || 'Guest'}`,
          createdAt: review.createdAt,
          isRead: false,
          readAt: null,
          priority: 'NORMAL',
          user: review.user ? {
            id: review.user.id,
            name: review.user.name,
            email: review.user.email,
          } : null,
          metadata: { 
            reviewId: review.id, 
            productId: review.productId,
            productName: review.product.name,
            rating: review.rating,
          },
        });
      }
    });

    // Sort by priority first, then by timestamp (newest first)
    const priorityOrder = { 'URGENT': 4, 'HIGH': 3, 'NORMAL': 2, 'LOW': 1 };
    notifications.sort((a, b) => {
      const priorityDiff = (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - 
                          (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

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

export const POST = withMongoose(async (req) => {
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

export const PATCH = withMongoose(async (req) => {
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
