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
    PATHAO_USERNAME: z.string().min(1).optional(), // Optional for now
    PATHAO_PASSWORD: z.string().min(1).optional(), // Optional for now
    CARRYBEE_API_URL: z.string().url().optional(),
    CARRYBEE_CLIENT_EMAIL: z.string().email().optional(),
    CARRYBEE_CLIENT_PASSWORD: z.string().min(1).optional(),
    CARRYBEE_STORE_ID: z.string().min(1).optional(),
});

let env: z.infer<typeof courierEnvSchema>;
try {
    env = courierEnvSchema.parse(process.env);
} catch (error) {
    console.error("❌ Missing or invalid courier environment variables:", error);
    throw new Error("Server configuration error: Missing courier API credentials.");
}

// --- HOTFIX for RedX API URL ---
// The following line forces the RedX API URL to the production endpoint.
// This is a temporary fix. The correct long-term solution is to ensure
// the REDX_API_URL in your .env file is set to the production URL.
env.REDX_API_URL = "https://openapi.redx.com.bd/v1.0.0-beta";
console.log("🟢 Overriding RedX API URL to production endpoint:", env.REDX_API_URL);

type CourierId = 'steadfast' | 'pathao' | 'redx' | 'carrybee';

// --- Unified Fetch & Error Handling Utility ---
async function fetchWithCourierErrorHandling(url: string, options: RequestInit, courierName: string): Promise<any> {
    const res = await fetch(url, options);
    const responseText = await res.text();
    const contentType = res.headers.get('content-type') || '';

    if (!res.ok) {
         console.error(`❌ ${courierName} API Error (Status: ${res.status})`, { status: res.status, statusText: res.statusText, body: responseText });
         if (res.status === 401) {
            if (courierName.startsWith('RedX') && env.REDX_API_URL.includes('openapi.redx')) {
                throw new Error(`RedX Production API authentication failed (401). Please check your production 'REDX_API_KEY'.`);
            }
            throw new Error(`Authentication failed for ${courierName}. Please check your API credentials.`);
         }
    }

    if (!contentType.includes('application/json')) {
        const errMessage = `${courierName} API returned a non-JSON response. Status: ${res.status}. Response: ${responseText.substring(0, 500)}...`;
        console.error(`❌ ${errMessage}`);
        throw new Error(errMessage);
    }
    
    try {
        const json = JSON.parse(responseText);
        // For cases where API returns 200 OK but with an error message in the body
        if (!res.ok) {
            const message = json.message || json.error || (json.errors && JSON.stringify(json.errors)) || 'API request failed.';
            throw new Error(`${courierName} Error: ${message}`);
        }
        return json;
    } catch (e) {
        const errMessage = `Failed to parse JSON response from ${courierName}. Status: ${res.status}. Response: ${responseText.substring(0, 500)}...`;
        console.error(`❌ ${errMessage}`, e);
        throw new Error(errMessage);
    }
}

// --- Token Management for OAuth Couriers ---
async function getPathaoAccessToken(): Promise<string> {
    const existingToken = await prisma.courierToken.findUnique({ where: { courier: 'pathao' } });
    if (existingToken && existingToken.expiresAt > new Date(Date.now() + 60000)) {
        return existingToken.accessToken;
    }
    console.log(`Token for Pathao is invalid or expired. Fetching new token...`);

    const usePasswordGrant = env.PATHAO_USERNAME && env.PATHAO_PASSWORD;
    const requestBody = usePasswordGrant 
        ? {
            client_id: env.PATHAO_CLIENT_ID,
            client_secret: env.PATHAO_CLIENT_SECRET,
            username: env.PATHAO_USERNAME,
            password: env.PATHAO_PASSWORD,
            grant_type: 'password',
          }
        : {
            client_id: env.PATHAO_CLIENT_ID,
            client_secret: env.PATHAO_CLIENT_SECRET,
            grant_type: 'client_credentials',
          };
    
    const tokenJson = await fetchWithCourierErrorHandling(
        `${env.PATHAO_API_URL}/aladdin/api/v1/issue-token`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(requestBody),
        },
        'Pathao (Token)'
    );

    if (!tokenJson.access_token) {
        throw new Error(`Failed to get Pathao token: ${tokenJson.message || 'Malformed response from Pathao token API.'}`);
    }

    const tokenData = { 
        accessToken: tokenJson.access_token, 
        refreshToken: tokenJson.refresh_token, 
        expiresIn: tokenJson.expires_in 
    };

    const expiresAt = new Date(Date.now() + tokenData.expiresIn * 1000);
    await prisma.courierToken.upsert({
        where: { courier: 'pathao' },
        update: { accessToken: tokenData.accessToken, refreshToken: tokenData.refreshToken, expiresAt: expiresAt },
        create: { courier: 'pathao', accessToken: tokenData.accessToken, refreshToken: tokenData.refreshToken, expiresAt: expiresAt },
    });
    return tokenData.accessToken;
}

// --- Automated Location ID Fetchers ---
async function getPathaoAreaInfo(city: string, zone: string, accessToken: string) {
    console.log(`Fetching Pathao areas for city: ${city}, zone: ${zone}`);
    const cityData = await fetchWithCourierErrorHandling(
        `${env.PATHAO_API_URL}/aladdin/api/v1/city-list`, 
        { headers: { 'Authorization': `Bearer ${accessToken}`, 'Accept': 'application/json' } },
        'Pathao (City List)'
    );
    const cityInfo = cityData.data.data.find((c: any) => c.city_name.toLowerCase() === city.toLowerCase());
    if (!cityInfo) throw new Error(`Pathao city not found: ${city}`);

    const zoneData = await fetchWithCourierErrorHandling(
         `${env.PATHAO_API_URL}/aladdin/api/v1/cities/${cityInfo.city_id}/zone-list`, 
         { headers: { 'Authorization': `Bearer ${accessToken}`, 'Accept': 'application/json' } },
         'Pathao (Zone List)'
    );
    const zoneInfo = zoneData.data.data.find((z: any) => z.zone_name.toLowerCase().includes(zone.toLowerCase()));
    if (!zoneInfo) throw new Error(`Pathao zone not found in ${city}: ${zone}`);
    
    return { cityId: cityInfo.city_id, zoneId: zoneInfo.zone_id };
}

async function getRedxAreaInfo(district: string, areaName: string) {
    console.log(`Fetching RedX area for district: ${district}, area: ${areaName}`);
    const headers = { 'API-ACCESS-TOKEN': `Bearer ${env.REDX_API_KEY}` };
    try {
        const areaData = await fetchWithCourierErrorHandling(
            `${env.REDX_API_URL}/areas?district_name=${encodeURIComponent(district)}`, 
            { headers }, 
            'RedX (Area by District)'
        );
        const areaInfo = areaData.areas?.find((a: any) => a.name.toLowerCase().includes(areaName.toLowerCase()));
        if (areaInfo) {
            console.log(`Found RedX area '${areaInfo.name}' (ID: ${areaInfo.id}) for district '${district}'.`);
            return { areaId: areaInfo.id, areaName: areaInfo.name };
        }
    } catch (e) {
        console.warn(`RedX district search failed, falling back to all areas. Error: ${e}`);
    }
    
    console.log(`Fallback: Fetching all RedX areas to find '${areaName}'.`);
    const allAreasData = await fetchWithCourierErrorHandling(`${env.REDX_API_URL}/areas`, { headers }, 'RedX (All Areas)');
    const candidates = allAreasData.areas?.filter((a: any) => a.name.toLowerCase().includes(areaName.toLowerCase())) || [];

    if (candidates.length === 0) throw new Error(`RedX area not found for '${areaName}' after fallback.`);
    if (candidates.length > 1) {
        const districtMatch = candidates.find((c: any) => c.name.toLowerCase().includes(district.toLowerCase()) || c.division_name?.toLowerCase().includes(district.toLowerCase()));
        if (districtMatch) return { areaId: districtMatch.id, areaName: districtMatch.name };
        console.warn(`Multiple areas found for '${areaName}', picking first one.`);
    }
    return { areaId: candidates[0].id, areaName: candidates[0].name };
}

// --- Main API Handler ---
export async function POST(request: Request) {
    const session = await getServerSession(authConfig);
    if (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'MANAGER') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { orderId } = body;
        if (!orderId) return NextResponse.json({ error: 'Invalid input: orderId is required' }, { status: 400 });

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { items: { include: { product: true } }, customer: true }
        });

        if (!order || !order.customer) return NextResponse.json({ error: 'Order or customer not found' }, { status: 404 });
        
        const courierId = order.courierName as CourierId | null;
        if (!courierId) return NextResponse.json({ error: 'Order has no courier assigned' }, { status: 400 });
        
        // --- Pre-shipment Data Validation ---
        if (courierId === 'steadfast') {
            const phone = order.customer.phone;
            const bdPhoneRegex = /^01[3-9]\d{8}$/;
            if (!phone || !bdPhoneRegex.test(phone)) {
                throw new Error(`Invalid phone number for Steadfast: '${phone}'. Please correct to an 11-digit format.`);
            }
        }
        const { recipientCity, recipientZone } = order;
        if (!recipientCity || !recipientZone) throw new Error('Recipient city and zone are required to ship.');

        let courierResponse: any;
        let consignmentId: string | number | undefined;
        let trackingCode: string | number | undefined;
        const totalWeight = order.items.reduce((acc, item) => acc + (item.product.weight || 0.5) * item.quantity, 0);

        switch (courierId) {
            case 'steadfast': {
                const payload = {
                    invoice: order.orderNumber,
                    recipient_name: order.customer.name,
                    recipient_phone: order.customer.phone,
                    recipient_address: `${order.customer.address}, ${recipientZone}, ${recipientCity}`,
                    cod_amount: order.total,
                    note: order.orderNote || 'Handle with care',
                };
                courierResponse = await fetchWithCourierErrorHandling(
                    `${env.STEADFAST_API_URL}/create_order`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Api-Key': env.STEADFAST_API_KEY, 'Secret-Key': env.STEADFAST_SECRET_KEY },
                        body: JSON.stringify(payload)
                    },
                    'Steadfast'
                );
                if (courierResponse.status !== 200) throw new Error(`Steadfast API Error: ${courierResponse.message || 'Unknown error'}`);
                consignmentId = courierResponse.consignment.consignment_id;
                trackingCode = courierResponse.consignment.tracking_code;
                break;
            }

            case 'redx': {
                const { areaId, areaName } = await getRedxAreaInfo(recipientCity, recipientZone);
                const payload = {
                    customer_name: order.customer.name,
                    customer_phone: order.customer.phone,
                    delivery_area_id: areaId,
                    delivery_area: areaName,
                    customer_address: order.customer.address,
                    cash_collection_amount: order.total,
                    value: order.total,
                    parcel_weight: totalWeight * 1000,
                    merchant_invoice_id: order.orderNumber,
                };
                courierResponse = await fetchWithCourierErrorHandling(
                    `${env.REDX_API_URL}/parcel`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'API-ACCESS-TOKEN': `Bearer ${env.REDX_API_KEY}` },
                        body: JSON.stringify(payload)
                    },
                    'RedX'
                );
                trackingCode = courierResponse.tracking_id;
                consignmentId = courierResponse.tracking_id;
                break;
            }

            case 'pathao': {
                const accessToken = await getPathaoAccessToken();
                const { cityId, zoneId } = await getPathaoAreaInfo(recipientCity, recipientZone, accessToken);
                const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
                const payload = {
                    store_id: parseInt(env.PATHAO_STORE_ID),
                    merchant_order_id: order.orderNumber,
                    recipient_name: order.customer.name,
                    recipient_phone: order.customer.phone,
                    recipient_address: order.customer.address,
                    recipient_city: cityId,
                    recipient_zone: zoneId,
                    delivery_type: 48,
                    item_type: 2,
                    item_quantity: totalQuantity,
                    item_weight: totalWeight,
                    amount_to_collect: order.total,
                };
                 courierResponse = await fetchWithCourierErrorHandling(
                    `${env.PATHAO_API_URL}/aladdin/api/v1/orders`,
                    {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json', 'Accept': 'application/json' },
                        body: JSON.stringify(payload)
                    },
                    'Pathao'
                );
                if (courierResponse.type !== 'success') throw new Error(courierResponse.message || 'Pathao API error');
                consignmentId = courierResponse.data.consignment_id;
                trackingCode = courierResponse.data.consignment_id;
                break;
            }
            
            default:
                throw new Error(`Courier '${courierId}' is not implemented.`);
        }

        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
                status: 'SHIPPED',
                courierConsignmentId: consignmentId ? String(consignmentId) : undefined,
                courierTrackingCode: trackingCode ? String(trackingCode) : undefined,
                courierStatus: 'Shipment Created',
                courierInfo: courierResponse as any,
            },
        });

        return NextResponse.json({ success: true, order: updatedOrder });

    } catch (error: any) {
        console.error('💥 Shipment creation failed:', error.message);
        return NextResponse.json({ error: error.message || 'An unexpected error occurred.' }, { status: 500 });
    }
} 