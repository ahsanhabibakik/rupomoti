import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createShippingService } from '@/lib/shipping/factory';
import type { ShippingProvider } from '@/lib/shipping/factory';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { action, providerId, params } = data;

    const provider = await prisma.shippingProvider.findUnique({
      where: { id: providerId },
    });

    if (!provider || !provider.isActive) {
      return NextResponse.json(
        { error: 'Invalid or inactive shipping provider' },
        { status: 400 }
      );
    }

    const shippingService = createShippingService(provider as ShippingProvider);

    switch (action) {
      case 'get_cities':
        const cities = await shippingService.getCities();
        return NextResponse.json({ cities });

      case 'get_zones':
        const zones = await shippingService.getZones(params.cityId);
        return NextResponse.json({ zones });

      case 'get_areas':
        const areas = await shippingService.getAreas(params.zoneId);
        return NextResponse.json({ areas });

      case 'calculate_rate':
        const rate = await shippingService.calculateRate(params);
        return NextResponse.json({ rate });

      case 'create_order':
        const result = await shippingService.createOrder(params);
        
        // Save shipping info to database
        await prisma.order.update({
          where: { id: params.orderId },
          data: {
            shippingProvider: {
              connect: { id: providerId }
            },
            shippingInfo: {
              create: {
                trackingId: result.trackingId,
                providerOrderId: result.providerOrderId,
                status: result.status,
                deliveryCharge: result.deliveryCharge,
                estimatedDeliveryDate: result.estimatedDeliveryDate,
                trackingUrl: result.trackingUrl,
                lastUpdate: new Date(),
                lastMessage: result.message,
              }
            }
          }
        });

        return NextResponse.json({ result });

      case 'get_status':
        const status = await shippingService.getOrderStatus(params.trackingId);
        
        // Update shipping status in database
        await prisma.shippingInfo.update({
          where: { trackingId: params.trackingId },
          data: {
            status: status.status,
            lastUpdate: new Date(status.lastUpdate),
            lastMessage: status.lastMessage,
            location: status.location,
            deliveryAttempts: status.deliveryAttempts,
          }
        });

        return NextResponse.json({ status });

      case 'cancel_order':
        const cancelResult = await shippingService.cancelOrder(params.trackingId);
        
        if (cancelResult.success) {
          await prisma.shippingInfo.update({
            where: { trackingId: params.trackingId },
            data: {
              status: 'CANCELLED',
              lastUpdate: new Date(),
              lastMessage: cancelResult.message,
            }
          });
        }

        return NextResponse.json({ result: cancelResult });

      case 'check_fraud':
        if (!shippingService.checkFraud) {
          return NextResponse.json(
            { error: 'Fraud check not supported by this provider' },
            { status: 400 }
          );
        }
        const fraudCheck = await shippingService.checkFraud(params);
        return NextResponse.json({ result: fraudCheck });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in shipping operation:', error);
    return NextResponse.json(
      { error: 'Failed to process shipping operation' },
      { status: 500 }
    );
  }
} 