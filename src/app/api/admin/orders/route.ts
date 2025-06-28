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
    const where: Prisma.OrderWhereInput = {};
    if (status === 'trashed') {
      where.deletedAt = { not: null };
    } else if (status === 'active') {
      // Show all orders that are not trashed (deletedAt is null or does not exist)
      where.OR = [
        { deletedAt: null },
        { deletedAt: { equals: undefined } },
      ];
    }

    if (search) {
      where.OR = [
        ...(where.OR || []),
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { recipientName: { contains: search, mode: 'insensitive' } },
        { recipientPhone: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (status && status !== 'all' && status !== 'trashed' && status !== 'active') {
        where.status = status as string;
    }

    if (from && to) {
      where.createdAt = {
        gte: new Date(from),
        lte: new Date(to),
      };
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

    const totalOrders = await prisma.order.count({ where });

    return NextResponse.json({
      orders,
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
            await steadfast.getDeliveryStatus(
              order.courierTrackingCode,
              'tracking'
            );
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