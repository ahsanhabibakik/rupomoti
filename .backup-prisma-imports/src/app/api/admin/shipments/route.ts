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
import { auth } from '@/app/auth';
import { withMongoose, parseQueryParams, getPaginationParams } from '@/lib/mongoose-utils';

import { z } from 'zod';


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

let _env: z.infer<typeof courierEnvSchema> | null = null;

function getEnv() {
    if (_env) {
        return _env;
    }
    try {
        const parsedEnv = courierEnvSchema.parse(process.env);
        
        // --- HOTFIX for RedX API URL ---
        parsedEnv.REDX_API_URL = "https://openapi.redx.com.bd/v1.0.0-beta";
        console.log("🟢 Overriding RedX API URL to production endpoint:", parsedEnv.REDX_API_URL);
        
        _env = parsedEnv;
        return _env;
    } catch (error) {
        console.error("❌ Missing or invalid courier environment variables:", error);
        throw new Error("Server configuration error: Missing courier API credentials.");
    }
}

type CourierId = 'steadfast' | 'pathao' | 'redx' | 'carrybee';

// --- Unified Fetch & Error Handling Utility ---
async function fetchWithCourierErrorHandling(url: string, options: RequestInit, courierName: string): Promise<any> {
    const res = await fetch(url, options);
    const responseText = await res.text();
    const contentType = res.headers.get('content-type') || '';

    if (!res.ok) {
         console.error(`❌ ${courierName} API Error (Status: ${res.status})`, { status: res.status, statusText: res.statusText, body: responseText });
         if (res.status === 401) {
            const env = getEnv();
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
    // Make sure to import CourierToken at the top
const existingToken = await CourierToken.findOne({ courier: 'pathao' } );
    if (existingToken && existingToken.expiresAt > new Date(Date.now() + 60000)) {
        return existingToken.accessToken;
    }
    console.log(`Token for Pathao is invalid or expired. Fetching new token...`);
    const env = getEnv();

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
async function getRedxAreaInfo(district: string, areaName: string) {
    console.log(`Fetching RedX area for district: ${district}, area: ${areaName}`);
    const env = getEnv();
    const headers = { 'API-ACCESS-TOKEN': `Bearer ${env.REDX_API_KEY}` };
    try {
        const areaData = await fetchWithCourierErrorHandling(
            `${env.REDX_API_URL}/areas?district_name=${encodeURIComponent(district)}`, 
            { headers }, 
            'RedX (Area by District)'
        );
        const areaInfo = areaData.areas?.find((a: Record<string, unknown>) => a.name.toLowerCase().includes(areaName.toLowerCase()));
        if (areaInfo) {
            console.log(`Found RedX area '${areaInfo.name}' (ID: ${areaInfo.id}) for district '${district}'.`);
            return { areaId: areaInfo.id, areaName: areaInfo.name };
        }
    } catch (e) {
        console.warn(`RedX district search failed, falling back to all areas. Error: ${e}`);
    }
    
    console.log(`Fallback: Fetching all RedX areas to find '${areaName}'.`);
    const allAreasData = await fetchWithCourierErrorHandling(`${env.REDX_API_URL}/areas`, { headers }, 'RedX (All Areas)');
    const candidates = allAreasData.areas?.filter((a: Record<string, unknown>) => a.name.toLowerCase().includes(areaName.toLowerCase())) || [];

    if (candidates.length === 0) throw new Error(`RedX area not found for '${areaName}' after fallback.`);
    if (candidates.length > 1) {
        const districtMatch = candidates.find((c: Record<string, unknown>) => c.name.toLowerCase().includes(district.toLowerCase()) || c.division_name?.toLowerCase().includes(district.toLowerCase()));
        if (districtMatch) return { areaId: districtMatch.id, areaName: districtMatch.name };
        console.warn(`Multiple areas found for '${areaName}', picking first one.`);
    }
    return { areaId: candidates[0].id, areaName: candidates[0].name };
}

// --- Main API Handler ---
export const POST = withMongoose(async (req) => {
    const session = await auth();
    if (!session || !['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(session.user?.role as string)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const env = getEnv(); // Ensure env is loaded
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

        let courierResponse: Record<string, unknown>;
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
                const areaInfo = await getRedxAreaInfo(recipientCity, recipientZone);
                const env = getEnv();
                const payload = {
                    customer_name: order.customer.name,
                    customer_phone: order.customer.phone,
                    customer_address: `${order.customer.address}, ${recipientZone}, ${recipientCity}`,
                    area_id: areaInfo.areaId,
                    merchant_invoice_id: order.orderNumber,
                    payment_type: "COD",
                    weight: totalWeight < 0.5 ? 0.5 : totalWeight,
                    cod_amount: order.total,
                    get_fragile: false,
                    delivery_instructions: order.orderNote,
                    value: order.subtotal,
                    item_description: order.items.map(i => i.product.name).join(', '),
                    items: order.items.map(item => ({
                        name: item.product.name,
                        quantity: item.quantity,
                    })),
                };

                 console.log("Sending payload to RedX:", JSON.stringify(payload, null, 2));

                courierResponse = await fetchWithCourierErrorHandling(
                    `${env.REDX_API_URL}/order`,
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
                
                // Find Pathao location IDs from our local DB
                const cityInfo = await prisma.pathaoLocation.findFirst({
                    where: { 
                        city_name: { equals: recipientCity, mode: 'insensitive' },
                    }
                });

                if (!cityInfo) {
                    throw new Error(`Pathao City '${recipientCity}' not found in local database. Please run the location sync or correct the city name.`);
                }

                const zoneInfo = await prisma.pathaoLocation.findFirst({
                    where: { 
                        city_id: cityInfo.city_id,
                        zone_name: { equals: recipientZone, mode: 'insensitive' },
                    }
                });

                if (!zoneInfo) {
                    throw new Error(`Pathao Zone '${recipientZone}' for City '${recipientCity}' not found in local database. Please run the location sync or correct the zone name.`);
                }
                
                const payload = {
                    store_id: env.PATHAO_STORE_ID,
                    merchant_order_id: order.orderNumber,
                    recipient_name: order.customer.name,
                    recipient_phone: order.customer.phone,
                    recipient_address: order.customer.address,
                    recipient_city: cityInfo.city_id,
                    recipient_zone: zoneInfo.zone_id,
                    delivery_type: 48, // 48 for Normal, 12 for On-demand
                    item_type: 2, // 2 for Parcel
                    special_instruction: order.orderNote,
                    item_quantity: order.items.reduce((sum, item) => sum + item.quantity, 0),
                    item_weight: totalWeight < 0.5 ? 0.5 : totalWeight,
                    amount_to_collect: order.total,
                    item_description: order.items.map(i => i.product.name).join(', '),
                };

                courierResponse = await fetchWithCourierErrorHandling(
                    `${env.PATHAO_API_URL}/aladdin/api/v1/orders`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}`, 'Accept': 'application/json' },
                        body: JSON.stringify(payload)
                    },
                    'Pathao'
                );
                consignmentId = courierResponse?.consignment_id;
                trackingCode = courierResponse?.consignment_id; // Pathao uses consignment_id as tracking code
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

    } catch (error: Record<string, unknown>) {
        console.error('💥 Shipment creation failed:', error.message);
        return NextResponse.json({ error: error.message || 'An unexpected error occurred.' }, { status: 500 });
    }
} 