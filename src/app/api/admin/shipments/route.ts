import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth-config';
import { COURIERS, CourierId } from '@/lib/couriers';

async function getPathaoAccessToken() {
    try {
        const response = await fetch('https://courier-api-sandbox.pathao.com/aladdin/api/v1/issue-token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                client_id: process.env.PATHAO_CLIENT_ID,
                client_secret: process.env.PATHAO_CLIENT_SECRET,
                grant_type: 'client_credentials',
            }),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to get Pathao access token');
        }
        return data.access_token;
    } catch (error) {
        console.error("Pathao token error:", error);
        throw new Error("Could not retrieve Pathao access token.");
    }
}

async function handleCourierError(res: Response, courierName: string) {
  const errorText = await res.text();
  console.error(`${courierName} API Error Response:`, {
    status: res.status,
    statusText: res.statusText,
    body: errorText,
  });

  if (res.status === 401) {
    throw new Error(`Authentication failed for ${courierName}. Please check your API credentials (API Key and Secret Key) in the environment variables.`);
  }

  try {
    const errorJson = JSON.parse(errorText);
    throw new Error(errorJson.message || `${courierName} API request failed.`);
  } catch (e) {
    throw new Error(errorText || `${courierName} API request failed.`);
  }
}

export async function POST(request: Request) {
    const session = await getServerSession(authConfig);
    if (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'MANAGER') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { orderId, courierId, areaInfo } = await request.json();

        if (!orderId || !courierId) {
            return NextResponse.json({ error: 'Missing orderId or courierId' }, { status: 400 });
        }

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { items: { include: { product: true } }, customer: true }
        });

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        const courier = COURIERS.find(c => c.id === courierId);
        if (!courier) {
            return NextResponse.json({ error: 'Invalid courier' }, { status: 400 });
        }

        let courierResponse: any;
        let consignmentId: string | undefined;
        let trackingCode: string | undefined;

        switch (courierId as CourierId) {
            case 'steadfast': {
                const steadfastPayload = {
                    api_key: process.env.STEADFAST_API_KEY,
                    secret_key: process.env.STEADFAST_SECRET_KEY,
                    invoice: order.orderNumber,
                    recipient_name: order.customer.name,
                    recipient_phone: order.customer.phone,
                    recipient_address: order.customer.address,
                    cod_amount: order.total,
                    note: 'Handle with care',
                };
                const steadfastRes = await fetch(courier.apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(steadfastPayload)
                });

                if (!steadfastRes.ok) {
                    await handleCourierError(steadfastRes, 'Steadfast');
                }
                
                courierResponse = await steadfastRes.json();

                if (courierResponse.status === 200) {
                    consignmentId = courierResponse.consignment.consignment_id;
                    trackingCode = courierResponse.consignment.tracking_code;
                } else {
                    console.error("Steadfast API Error:", courierResponse);
                    throw new Error(courierResponse.message || 'Steadfast API error');
                }
                break;
            }

            case 'redx': {
                const redxPayload = {
                    customer_name: order.customer.name,
                    customer_phone: order.customer.phone,
                    delivery_area_id: areaInfo.areaId, 
                    customer_address: order.customer.address,
                    cash_collection_amount: order.total,
                    parcel_weight: order.items.reduce((acc, item) => acc + (item.product.weight || 0.5) * item.quantity, 0),
                    merchant_invoice_id: order.orderNumber,
                    parcel_details_json: order.items.map(item => ({
                        name: item.product.name,
                        quantity: item.quantity,
                        price: item.price
                    }))
                };
                const redxRes = await fetch(courier.apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'API-KEY': process.env.REDX_API_KEY!,
                    },
                    body: JSON.stringify(redxPayload)
                });
                
                if (!redxRes.ok) {
                   await handleCourierError(redxRes, 'RedX');
                }

                courierResponse = await redxRes.json();
                trackingCode = courierResponse.tracking_id;
                consignmentId = courierResponse.tracking_id;
                break;
            }

            case 'pathao': {
                const pathaoToken = await getPathaoAccessToken();
                const pathaoPayload = {
                    store_id: process.env.PATHAO_STORE_ID,
                    merchant_order_id: order.orderNumber,
                    recipient_name: order.customer.name,
                    recipient_phone: order.customer.phone,
                    recipient_address: order.customer.address,
                    recipient_city: areaInfo.cityId,
                    recipient_zone: areaInfo.zoneId,
                    delivery_type: 48, 
                    item_type: 2, 
                    item_quantity: order.items.reduce((sum, item) => sum + item.quantity, 0),
                    item_weight: order.items.reduce((acc, item) => acc + (item.product.weight || 0.5) * item.quantity, 0),
                    amount_to_collect: order.total,
                };

                const pathaoRes = await fetch(courier.apiUrl, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${pathaoToken}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(pathaoPayload)
                });

                if (!pathaoRes.ok) {
                    await handleCourierError(pathaoRes, 'Pathao');
                }

                courierResponse = await pathaoRes.json();
                if (courierResponse.type === 'success') {
                    consignmentId = courierResponse.data.consignment_id;
                    trackingCode = courierResponse.data.consignment_id;
                } else {
                    console.error("Pathao API Error:", courierResponse);
                    throw new Error(courierResponse.message || 'Pathao API error');
                }
                break;
            }
            
            case 'carrybee':
                 throw new Error("CarryBee is not implemented yet.");

            default:
                return NextResponse.json({ error: 'Invalid courier' }, { status: 400 });
        }

        await prisma.order.update({
            where: { id: orderId },
            data: {
                status: 'SHIPPED',
                courierName: courier.name,
                courierConsignmentId: consignmentId,
                courierTrackingCode: trackingCode,
                courierStatus: 'Shipment Created',
                courierInfo: courierResponse as any,
            }
        });
        
        const updatedOrder = await prisma.order.findUnique({
            where: { id: orderId },
            include: { customer: true, items: { include: { product: true } } },
        });

        return NextResponse.json({ success: true, order: updatedOrder });

    } catch (error: any) {
        console.error('Shipment creation failed:', error);
        return NextResponse.json({ error: error.message || 'Failed to create shipment' }, { status: 500 });
    }
} 