import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createShippingProvider } from '@/lib/shipping/factory';

export async function POST(request: Request, { params }: { params: { orderId: string } }) {
  try {
    const { providerId } = await request.json();
    const order = await prisma.order.findUnique({
      where: { id: params.orderId },
      include: {
        customer: true,
        shippingProvider: true
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    if (order.status !== 'confirmed') {
      return NextResponse.json(
        { error: 'Order must be confirmed before shipping' },
        { status: 400 }
      );
    }

    const shippingProvider = await prisma.shippingProvider.findUnique({
      where: { id: providerId }
    });

    if (!shippingProvider) {
      return NextResponse.json(
        { error: 'Shipping provider not found' },
        { status: 404 }
      );
    }

    const shippingService = createShippingProvider(shippingProvider);

    // Prepare shipping data based on provider type
    let shippingData = {
      customer_name: order.customer.name,
      customer_phone: order.customer.phone,
      customer_address: order.deliveryAddress,
      order_value: order.total,
      items: order.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        value: item.price
      }))
    };

    if (shippingProvider.type === 'pathao') {
      // Add Pathao specific fields
      shippingData = {
        ...shippingData,
        pickup_address: process.env.PATHAO_PICKUP_ADDRESS,
        pickup_contact_name: process.env.PATHAO_PICKUP_CONTACT_NAME,
        pickup_contact_phone: process.env.PATHAO_PICKUP_CONTACT_PHONE
      };
    }

    if (shippingProvider.type === 'redx') {
      // Add RedX specific fields
      shippingData = {
        ...shippingData,
        pickup_address: process.env.REDX_PICKUP_ADDRESS,
        pickup_contact: process.env.REDX_PICKUP_CONTACT_NAME,
        pickup_phone: process.env.REDX_PICKUP_CONTACT_PHONE
      };
    }

    if (shippingProvider.type === 'steadfast') {
      // Add Steadfast specific fields
      shippingData = {
        ...shippingData,
        pickup_address: process.env.STEADFAST_PICKUP_ADDRESS,
        pickup_contact: process.env.STEADFAST_PICKUP_CONTACT_NAME,
        pickup_phone: process.env.STEADFAST_PICKUP_CONTACT_PHONE
      };
    }

    // Create shipping order
    const shippingResult = await shippingService.createOrder(shippingData);

    // Update order with shipping information
    const updatedOrder = await prisma.order.update({
      where: { id: params.orderId },
      data: {
        shippingProviderId: providerId,
        trackingId: shippingResult.trackingId,
        status: 'shipped',
        shippingStatus: 'in_transit',
        shippingInfo: shippingResult
      }
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Error shipping order:', error);
    return NextResponse.json(
      { error: 'Failed to ship order' },
      { status: 500 }
    );
  }
}
