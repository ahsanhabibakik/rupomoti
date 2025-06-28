import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/auth";
import { prisma } from "@/lib/prisma";
import { OrderStatus, Prisma } from "@prisma/client";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status'); // e.g., 'all', 'trashed', or specific order statuses
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const offset = (page - 1) * limit;

  try {
    let where: any = {}; // Using 'any' temporarily to bypass type issues
    
    // Handle different status filters
    if (status === 'trashed') {
      where.deletedAt = { not: null };
    } else if (status === 'fake') {
      where.deletedAt = null;
      where.isFakeOrder = true;
    } else if (status === 'active') {
      // Show non-deleted orders (temporarily not filtering by isFakeOrder due to MongoDB/Prisma boolean query issue)
      // Since all existing orders have isFakeOrder: false, this is effectively the same
      where.deletedAt = null;
      // Note: We can add a manual filter after query if needed for new fake orders
    } else {
      // For 'all' status, just show non-deleted orders
      where.deletedAt = null;
    }

    // Handle search
    if (search) {
      const searchConditions = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { recipientName: { contains: search, mode: 'insensitive' } },
        { recipientPhone: { contains: search, mode: 'insensitive' } },
      ];

      // Combine existing conditions with search
      const existingConditions = { ...where };
      where = {
        AND: [
          existingConditions,
          { OR: searchConditions }
        ]
      };
    }
    
    // Handle specific order status (not our custom statuses)
    if (status && status !== 'all' && status !== 'trashed' && status !== 'active' && status !== 'fake') {
      if (where.AND) {
        where.AND.push({ status });
      } else {
        const existingConditions = { ...where };
        where = {
          AND: [
            existingConditions,
            { status }
          ]
        };
      }
    }

    // Handle date range
    if (from && to) {
      const dateCondition = {
        createdAt: {
          gte: new Date(from),
          lte: new Date(to),
        }
      };

      if (where.AND) {
        where.AND.push(dateCondition);
      } else {
        const existingConditions = { ...where };
        where = {
          AND: [
            existingConditions,
            dateCondition
          ]
        };
      }
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
    });

    // Post-query filtering for active orders (workaround for boolean query issue)
    let filteredOrders = orders;
    if (status === 'active') {
      filteredOrders = orders.filter(order => order.isFakeOrder !== true);
    }

    // For count, we need to handle the filtering differently
    let totalOrders;
    if (status === 'active') {
      // Get all matching orders and filter them (less efficient but works)
      const allMatchingOrders = await prisma.order.findMany({
        where,
        select: { id: true, isFakeOrder: true }
      });
      totalOrders = allMatchingOrders.filter(order => order.isFakeOrder !== true).length;
    } else {
      totalOrders = await prisma.order.count({ where });
    }

    return NextResponse.json({
      orders: filteredOrders,
      totalOrders,
      totalPages: Math.ceil(totalOrders / limit),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user?.isAdmin && user?.role !== 'MANAGER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId, action, status } = await request.json();

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    switch (action) {
      case 'confirm_order': {
        if (order.status !== 'PENDING') {
          return NextResponse.json(
            { error: 'Order cannot be confirmed' },
            { status: 400 }
          );
        }

        await prisma.order.update({
          where: { id: orderId },
          data: { status: 'CONFIRMED' },
        });

        return NextResponse.json({ message: 'Order confirmed successfully' });
      }

      case 'create_shipment': {
        if (order.status !== 'CONFIRMED') {
          return NextResponse.json(
            { error: 'Order must be confirmed before creating shipment' },
            { status: 400 }
          );
        }

        if (order.courierConsignmentId) {
          return NextResponse.json(
            { error: 'Shipment already exists' },
            { status: 400 }
          );
        }
        
        // This whole case is now handled by /api/admin/shipments
        // I will remove it.
        return NextResponse.json({error: "This action is deprecated. Use /api/admin/shipments"}, {status: 400});
      }

      case 'update_status': {
        if (!status) {
          return NextResponse.json(
            { error: 'Status is required' },
            { status: 400 }
          );
        }

        const validStatuses = [
          'PENDING',
          'PROCESSING',
          'CONFIRMED',
          'SHIPPED',
          'DELIVERED',
          'CANCELLED',
        ];

        if (!validStatuses.includes(status)) {
          return NextResponse.json(
            { error: 'Invalid status' },
            { status: 400 }
          );
        }

        // If order is being marked as delivered, update Steadfast status
        if (status === 'DELIVERED' && order.courierTrackingCode) {
          // This might need to be updated to be generic for all couriers
          // For now, I'll leave it as it might be part of another feature
          try {
            // TODO: Import and implement steadfast courier integration
            // await steadfast.getDeliveryStatus(
            //   order.courierTrackingCode,
            //   'tracking'
            // );
            console.log('Order marked as delivered:', order.courierTrackingCode);
          } catch (error) {
            console.error('Error updating Steadfast status:', error);
          }
        }

        await prisma.order.update({
          where: { id: orderId },
          data: { status },
        });

        return NextResponse.json({ message: 'Order status updated successfully' });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to process order action' },
      { status: 500 }
    );
  }
}