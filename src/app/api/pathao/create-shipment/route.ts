import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getPathaoAccessToken, createPathaoOrder } from '@/lib/pathao';

const shipmentSchema = z.object({
  recipient_name: z.string().min(1),
  recipient_phone: z.string().min(1),
  recipient_address: z.string().min(1),
  city_id: z.number().int(),
  zone_id: z.number().int(),
  area_id: z.number().int().optional(),
  item_weight: z.number(),
  item_description: z.string().optional(),
  amount_to_collect: z.number().min(0),
  store_id: z.number().int(),
  merchant_order_id: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = shipmentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.flatten() }, { status: 400 });
    }
    
    const payload = {
        ...validation.data,
        delivery_type: 48, // 48 for Normal Delivery
        item_type: 2,      // 2 for Parcel
    };

    const accessToken = await getPathaoAccessToken();
    const shipmentDetails = await createPathaoOrder(payload, accessToken);

    return NextResponse.json({
      message: 'Shipment created successfully!',
      data: shipmentDetails.data
    });

  } catch (error) {
    console.error('💥 Failed to create Pathao shipment:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to create shipment', details: errorMessage }, { status: 500 });
  }
} 