import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { steadfast } from '@/lib/steadfast';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const trackingId = params.id;

    // Find order by tracking ID or order number
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { orderNumber: trackingId },
          { steadfastInfo: { trackingId: trackingId } }
        ]
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // If user is logged in, verify they own the order
    if (session?.user?.email && order.userEmail !== session.user.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // If order has Steadfast tracking, get latest status
    if (order.steadfastInfo?.trackingId) {
      try {
        const trackingResponse = await steadfast.getDeliveryStatus(
          order.steadfastInfo.trackingId,
          'tracking'
        );

        if (trackingResponse.success) {
          // Update order with latest tracking info
          await prisma.order.update({
            where: { id: order.id },
            data: {
              steadfastInfo: {
                ...order.steadfastInfo,
                status: trackingResponse.status,
                lastUpdate: new Date(),
                lastMessage: trackingResponse.tracking_message
              }
            }
          });

          // Update order status based on tracking
          if (trackingResponse.status === 'delivered') {
            await prisma.order.update({
              where: { id: order.id },
              data: { status: 'DELIVERED' }
            });
          }
        }
      } catch (error) {
        console.error('Error fetching tracking status:', error);
        // Continue with existing order data even if tracking update fails
      }
    }

    // Fetch updated order data
    const updatedOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        customer: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Error tracking order:', error);
    return NextResponse.json(
      { error: 'Failed to track order' },
      { status: 500 }
    );
  }
} 