import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { steadfast } from '@/lib/steadfast';
import { authConfig } from '@/lib/auth-config';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: any = {};
    if (status) where.status = status;
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
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
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    const formattedOrders = orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customer: {
        name: order.customer.name,
        email: order.customer.email,
        phone: order.customer.phone,
        address: order.customer.address,
      },
      total: order.total,
      status: order.status,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt,
      items: order.items.map((item) => ({
        name: item.product.name,
        price: item.price,
        quantity: item.quantity,
        image: item.product.images[0] || '/placeholder.png',
      })),
      steadfastInfo: order.steadfastInfo,
    }));

    return NextResponse.json({
      orders: formattedOrders,
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user?.isAdmin) {
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

        if (order.steadfastInfo?.trackingId) {
          return NextResponse.json(
            { error: 'Shipment already exists' },
            { status: 400 }
          );
        }

        // Prepare shipment data for Steadfast
        const shipmentData = {
          recipient_name: order.customer.name,
          recipient_phone: order.customer.phone,
          recipient_address: order.customer.address,
          amount_to_collect: order.total,
          item_description: order.items
            .map((item) => `${item.product.name} (${item.quantity})`)
            .join(', '),
          item_quantity: order.items.reduce((sum, item) => sum + item.quantity, 0),
          item_weight: 1, // Default weight in kg
          service_type: 'regular', // or 'express' based on your needs
          instruction: 'Handle with care',
        };

        // Create shipment in Steadfast
        const steadfastResponse = await steadfast.createShipment(shipmentData);

        if (!steadfastResponse.success) {
          throw new Error(steadfastResponse.message || 'Failed to create shipment');
        }

        // Update order with Steadfast tracking info
        await prisma.order.update({
          where: { id: orderId },
          data: {
            status: 'SHIPPED',
            steadfastInfo: {
              trackingId: steadfastResponse.tracking_id,
              consignmentId: steadfastResponse.consignment_id,
              status: 'PICKED',
              lastUpdate: new Date().toISOString(),
              lastMessage: 'Shipment created and picked up by courier',
            },
          },
        });

        return NextResponse.json({
          message: 'Shipment created successfully',
          trackingId: steadfastResponse.tracking_id,
        });
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
        if (status === 'DELIVERED' && order.steadfastInfo?.trackingId) {
          try {
            await steadfast.updateDeliveryStatus(
              order.steadfastInfo.trackingId,
              'DELIVERED'
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
  } catch (error: any) {
    console.error('Error processing order action:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process order action' },
      { status: 500 }
    );
  }
} 