import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';
import { steadfast } from '@/lib/steadfast';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where = {
      ...(status && { status }),
      ...(startDate && endDate && {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      })
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          customer: true,
          items: {
            include: {
              product: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.order.count({ where })
    ]);

    return NextResponse.json({
      orders,
      pages: Math.ceil(total / limit)
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
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { orderId, action, ...data } = body;

    if (!orderId || !action) {
      return NextResponse.json(
        { error: 'Order ID and action are required' },
        { status: 400 }
      );
    }

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
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    switch (action) {
      case 'update_status':
        const { status } = data;
        if (!status) {
          return NextResponse.json(
            { error: 'Status is required' },
            { status: 400 }
          );
        }

        const updatedOrder = await prisma.order.update({
          where: { id: orderId },
          data: { status },
        });

        return NextResponse.json(updatedOrder);

      case 'create_shipment':
        // Create parcel in Steadfast
        const parcelData = {
          invoice: order.orderNumber,
          recipient_name: order.shippingInfo.name,
          recipient_phone: order.shippingInfo.phone,
          recipient_address: order.shippingInfo.address,
          recipient_city: order.shippingInfo.city,
          recipient_zone: order.shippingInfo.state || 'Default',
          parcel_weight: 1, // Calculate based on products
          payment_method: order.paymentMethod || 'COD',
          amount_to_collect: order.paymentStatus === 'PENDING' ? order.total : 0,
          merchant_invoice_id: order.orderNumber,
          parcel_content: order.items.map(item => item.product.name).join(', '),
        };

        const steadfastResponse = await steadfast.createParcel(parcelData);
        if (!steadfastResponse.success) {
          return NextResponse.json(
            { error: steadfastResponse.message },
            { status: 400 }
          );
        }

        // Update order with Steadfast tracking info
        const orderWithTracking = await prisma.order.update({
          where: { id: orderId },
          data: {
            status: 'SHIPPED',
            steadfastInfo: {
              trackingId: steadfastResponse.tracking_id,
              consignmentId: steadfastResponse.consignment_id,
              status: 'PICKED',
              lastUpdate: new Date(),
            },
          },
        });

        return NextResponse.json(orderWithTracking);

      case 'track_shipment':
        if (!order.steadfastInfo?.trackingId) {
          return NextResponse.json(
            { error: 'No tracking ID found for this order' },
            { status: 400 }
          );
        }

        const trackingResponse = await steadfast.trackParcel(
          order.steadfastInfo.trackingId
        );

        if (!trackingResponse.success) {
          return NextResponse.json(
            { error: trackingResponse.message },
            { status: 400 }
          );
        }

        return NextResponse.json(trackingResponse);

      case 'cancel_shipment':
        if (!order.steadfastInfo?.consignmentId) {
          return NextResponse.json(
            { error: 'No consignment ID found for this order' },
            { status: 400 }
          );
        }

        const cancelResponse = await steadfast.cancelParcel(
          order.steadfastInfo.consignmentId
        );

        if (!cancelResponse.success) {
          return NextResponse.json(
            { error: cancelResponse.message },
            { status: 400 }
          );
        }

        // Update order status
        const cancelledOrder = await prisma.order.update({
          where: { id: orderId },
          data: {
            status: 'CANCELLED',
            steadfastInfo: {
              ...order.steadfastInfo,
              status: 'CANCELLED',
              lastUpdate: new Date(),
            },
          },
        });

        return NextResponse.json(cancelledOrder);

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error processing order action:', error);
    return NextResponse.json(
      { error: 'Failed to process order action' },
      { status: 500 }
    );
  }
} 