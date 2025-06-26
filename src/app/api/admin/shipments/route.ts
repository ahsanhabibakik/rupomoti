/**
 * Prisma Schema for CourierToken:
 * 
 * model CourierToken {
 *   courier      String   @id @map("_id")
 *   accessToken  String
 *   refreshToken String?
 *   expiresAt    DateTime
 * }
 */
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth-config';
import { z } from 'zod';
import { Order, User } from '@prisma/client';

// --- Environment Variable Validation ---
const courierEnvSchema = z.object({
    STEADFAST_API_URL: z.string().url(),
    STEADFAST_API_KEY: z.string().min(1),
    STEADFAST_SECRET_KEY: z.string().min(1),
    REDX_API_URL: z.string().url(),
    REDX_API_KEY: z.string().min(1),
    PATHAO_API_URL: z.string().url(),
    PATHAO_CLIENT_ID: z.string().min(1),
    PATHAO_CLIENT_SECRET: z.string().min(1),
    PATHAO_STORE_ID: z.string().min(1),
    CARRYBEE_API_URL: z.string().url(),
    CARRYBEE_CLIENT_EMAIL: z.string().email(),
    CARRYBEE_CLIENT_PASSWORD: z.string().min(1),
    CARRYBEE_STORE_ID: z.string().min(1),
});

let env: z.infer<typeof courierEnvSchema>;
try {
    env = courierEnvSchema.parse(process.env);
} catch (error) {
    console.error("❌ Missing or invalid courier environment variables:", error);
    // This error is thrown at startup, so the server won't start if env vars are missing.
    throw new Error("Server configuration error: Missing courier API credentials.");
}

// --- Zod schema for validation and transformation ---
const apiRequestSchema = z.object({
    orderId: z.string().min(1),
    courierId: z.enum(['steadfast', 'redx', 'pathao', 'carrybee']),
    areaInfo: z.object({
        cityId: z.any().optional(),
        zoneId: z.any().optional(),
        areaId: z.any().optional(),
        area_id: z.any().optional(),
        areaName: z.string().optional(),
        area_name: z.string().optional(),
    }).default({}),
}).transform(data => {
    if (data.courierId === 'redx') {
        const ai = data.areaInfo;
        return {
            ...data,
            areaInfo: {
                ...ai,
                areaId: ai.areaId ?? ai.area_id,
                areaName: ai.areaName ?? ai.area_name,
            }
        };
    }
    return data;
}).superRefine((data, ctx) => {
    if (data.courierId === 'redx') {
        if (!data.areaInfo.areaId) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['areaInfo', 'areaId'],
                message: 'areaId or area_id is required for RedX.'
            });
        }
        if (!data.areaInfo.areaName) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['areaInfo', 'areaName'],
                message: 'areaName or area_name is required for RedX.'
            });
        }
    }
});

type CourierId = 'steadfast' | 'pathao' | 'redx' | 'carrybee';

// --- Token Management for OAuth Couriers ---
async function getAccessToken(courierId: 'pathao' | 'carrybee'): Promise<string> {
    const existingToken = await prisma.courierToken.findUnique({ where: { courier: courierId } });
    if (existingToken && existingToken.expiresAt > new Date(Date.now() + 60000)) {
        return existingToken.accessToken;
    }
    console.log(`Token for ${courierId} is invalid or expired. Fetching new token...`);
    let tokenData;
    if (courierId === 'pathao') {
        const res = await fetch(`${env.PATHAO_API_URL}/aladdin/api/v1/issue-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({
                client_id: env.PATHAO_CLIENT_ID,
                client_secret: env.PATHAO_CLIENT_SECRET,
                grant_type: 'client_credentials',
            }),
        });
        const json = await res.json();
        if (!res.ok || !json.access_token) throw new Error(`Failed to get Pathao token: ${json.message || 'Unknown error'}`);
        tokenData = { accessToken: json.access_token, refreshToken: json.refresh_token, expiresIn: json.expires_in };
    } else { // carrybee
        const res = await fetch(`${env.CARRYBEE_API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({
                username: env.CARRYBEE_CLIENT_EMAIL,
                password: env.CARRYBEE_CLIENT_PASSWORD,
                grant_type: 'password',
            }),
        });
        const json = await res.json();
        if (!res.ok || !json.access_token) throw new Error(`Failed to get CarryBee token: ${json.message || 'Unknown error'}`);
        tokenData = { accessToken: json.access_token, refreshToken: json.refresh_token, expiresIn: json.expires_in || 3600 };
    }
    const expiresAt = new Date(Date.now() + tokenData.expiresIn * 1000);
    await prisma.courierToken.upsert({
        where: { courier: courierId },
        update: { accessToken: tokenData.accessToken, refreshToken: tokenData.refreshToken, expiresAt: expiresAt },
        create: { courier: courierId, accessToken: tokenData.accessToken, refreshToken: tokenData.refreshToken, expiresAt: expiresAt },
    });
    return tokenData.accessToken;
}

// --- Unified Error Handling ---
async function handleCourierError(res: Response, courierName: string) {
    const errorBody = await res.text();
    console.error(`❌ ${courierName} API Error (Status: ${res.status})`, { status: res.status, statusText: res.statusText, body: errorBody });
    if (res.status === 401) throw new Error(`Authentication failed for ${courierName}. Please check your API credentials.`);
    try {
        const errorJson = JSON.parse(errorBody);
        const message = errorJson.message || errorJson.error || (errorJson.errors && JSON.stringify(errorJson.errors)) || 'API request failed.';
        throw new Error(`${courierName} Error: ${message}`);
    } catch (e) {
        throw new Error(`${courierName} Error: ${errorBody || 'An unknown API error occurred.'}`);
    }
}

// --- Main API Handler ---
export async function POST(request: Request) {
    const session = await getServerSession(authConfig);
    if (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'MANAGER') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const validation = apiRequestSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: 'Invalid input', issues: validation.error.issues }, { status: 400 });
        }

        const { orderId, courierId, areaInfo } = validation.data;

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { items: { include: { product: true } }, customer: true }
        });

        if (!order || !order.customer) {
            return NextResponse.json({ error: 'Order or customer not found' }, { status: 404 });
        }

        let courierResponse: any;
        let consignmentId: string | number | undefined;
        let trackingCode: string | number | undefined;

        const totalWeight = order.items.reduce((acc, item) => acc + (item.product.weight || 0.5) * item.quantity, 0);
        const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);

        switch (courierId as CourierId) {
            case 'steadfast': {
                const res = await fetch(`${env.STEADFAST_API_URL}/create_order`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Api-Key': env.STEADFAST_API_KEY, 'Secret-Key': env.STEADFAST_SECRET_KEY },
                    body: JSON.stringify({
                        invoice: order.orderNumber,
                        recipient_name: order.customer.name,
                        recipient_phone: order.customer.phone,
                        recipient_address: order.customer.address,
                        cod_amount: order.total,
                        note: order.orderNote || 'Handle with care',
                    })
                });
                if (!res.ok) await handleCourierError(res, 'Steadfast');
                courierResponse = await res.json();
                if (courierResponse.status !== 200) throw new Error(courierResponse.message || 'Steadfast API returned a non-200 status');
                consignmentId = courierResponse.consignment.consignment_id;
                trackingCode = courierResponse.consignment.tracking_code;
                break;
            }

            case 'redx': {
                const res = await fetch(`${env.REDX_API_URL}/parcel`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'API-ACCESS-TOKEN': `Bearer ${env.REDX_API_KEY}`,
                    },
                    body: JSON.stringify({
                        customer_name: order.customer.name,
                        customer_phone: order.customer.phone,
                        delivery_area: areaInfo.areaName,
                        delivery_area_id: areaInfo.areaId,
                        customer_address: order.customer.address,
                        cash_collection_amount: order.total,
                        value: order.total,
                        parcel_weight: totalWeight,
                        merchant_invoice_id: order.orderNumber,
                        parcel_details_json: order.items.map(item => ({
                            name: item.product.name,
                            quantity: item.quantity,
                            price: item.price,
                            value: item.price * item.quantity
                        })),
                    })
                });
                if (!res.ok) await handleCourierError(res, 'RedX');
                courierResponse = await res.json();
                trackingCode = courierResponse.tracking_id;
                consignmentId = courierResponse.tracking_id;
                break;
            }

            case 'pathao': {
                const accessToken = await getAccessToken('pathao');
                const res = await fetch(`${env.PATHAO_API_URL}/aladdin/api/v1/orders`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify({
                        store_id: env.PATHAO_STORE_ID,
                        merchant_order_id: order.orderNumber,
                        recipient_name: order.customer.name,
                        recipient_phone: order.customer.phone,
                        recipient_address: order.customer.address,
                        recipient_city: areaInfo.cityId,
                        recipient_zone: areaInfo.zoneId,
                        delivery_type: 48,
                        item_type: 2,
                        item_quantity: totalQuantity,
                        item_weight: totalWeight,
                        amount_to_collect: order.total,
                    })
                });
                if (!res.ok) await handleCourierError(res, 'Pathao');
                courierResponse = await res.json();
                if (courierResponse.type !== 'success') throw new Error(courierResponse.message || 'Pathao API error');
                consignmentId = courierResponse.data.consignment_id;
                trackingCode = courierResponse.data.consignment_id;
                break;
            }

            case 'carrybee': {
                const accessToken = await getAccessToken('carrybee');
                const res = await fetch(`${env.CARRYBEE_API_URL}/orders`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify({
                        store_id: env.CARRYBEE_STORE_ID,
                        merchant_order_id: order.orderNumber,
                        recipient_name: order.customer.name,
                        recipient_phone: order.customer.phone,
                        recipient_address: order.customer.address,
                        city_id: areaInfo.cityId,
                        zone_id: areaInfo.zoneId,
                        area_id: areaInfo.areaId,
                        delivery_type: 48,
                        product_type: 2,
                        quantity: totalQuantity,
                        weight: totalWeight,
                        amount_collect: order.total,
                    })
                });
                if (!res.ok) await handleCourierError(res, 'CarryBee');
                courierResponse = await res.json();
                if (!courierResponse.success) throw new Error(courierResponse.message || 'CarryBee API error');
                consignmentId = courierResponse.data.order_id;
                trackingCode = courierResponse.data.tracking_id;
                break;
            }

            default:
                return NextResponse.json({ error: 'Invalid or not implemented courier' }, { status: 400 });
        }

        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
                status: 'SHIPPED',
                courierName: courierId,
                courierConsignmentId: consignmentId ? String(consignmentId) : undefined,
                courierTrackingCode: trackingCode ? String(trackingCode) : undefined,
                courierStatus: 'Shipment Created',
                courierInfo: courierResponse as any,
            },
            include: { customer: true, items: { include: { product: true } } },
        });

        return NextResponse.json({ success: true, order: updatedOrder });

    } catch (error: any) {
        console.error('💥 Shipment creation failed:', error);
        return NextResponse.json({ error: error.message || 'An unexpected error occurred.' }, { status: 500 });
    }
} 