import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { createHmac } from 'crypto';

function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string,
  provider: string
): boolean {
  switch (provider) {
    case 'steadfast': {
      const hmac = createHmac('sha256', secret)
        .update(payload)
        .digest('hex');
      return hmac === signature;
    }
    case 'redx': {
      const hmac = createHmac('sha256', secret)
        .update(payload)
        .digest('base64');
      return hmac === signature;
    }
    case 'pathao': {
      const hmac = createHmac('sha256', secret)
        .update(payload)
        .digest('hex');
      return hmac === signature;
    }
    default:
      return false;
  }
}

export async function POST(request: Request) {
  try {
    const headersList = headers();
    const provider = headersList.get('x-provider');
    const signature = headersList.get('x-signature');

    if (!provider || !signature) {
      return NextResponse.json(
        { error: 'Missing required headers' },
        { status: 400 }
      );
    }

    // Get provider secret from database
    const shippingProvider = await prisma.shippingProvider.findFirst({
      where: { type: provider.toLowerCase() },
    });

    if (!shippingProvider) {
      return NextResponse.json(
        { error: 'Invalid shipping provider' },
        { status: 400 }
      );
    }

    const payload = await request.text();
    const webhookSecret = shippingProvider.credentials.webhookSecret;

    // Verify webhook signature
    if (!verifyWebhookSignature(payload, signature, webhookSecret, provider)) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      );
    }

    const data = JSON.parse(payload);

    // Update shipping info in database
    await prisma.shippingInfo.update({
      where: {
        trackingId: data.tracking_number || data.consignment_id || data.tracking_id,
      },
      data: {
        status: data.status || data.order_status || data.delivery_status,
        lastUpdate: new Date(data.updated_at || data.timestamp),
        lastMessage: data.message || data.status_message || data.tracking_message,
        location: data.location || data.current_location,
        deliveryAttempts: data.delivery_attempts,
      },
    });

    // If order is delivered, update order status
    if (
      data.status === 'DELIVERED' ||
      data.order_status === 'DELIVERED' ||
      data.delivery_status === 'DELIVERED'
    ) {
      await prisma.order.update({
        where: {
          shippingInfo: {
            trackingId: data.tracking_number || data.consignment_id || data.tracking_id,
          },
        },
        data: {
          status: 'DELIVERED',
          deliveredAt: new Date(data.updated_at || data.timestamp),
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}
