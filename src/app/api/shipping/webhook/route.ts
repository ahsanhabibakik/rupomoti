import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { provider, trackingId, status, message, updatedAt } = body;

    // Verify the webhook signature if needed
    const signature = request.headers.get('X-Signature');
    if (!signature) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Update the order's shipping status
    const order = await prisma.order.update({
      where: { trackingId },
      data: {
        shippingStatus: status,
        shippingInfo: {
          ...body,
          updatedAt: new Date(updatedAt)
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}
