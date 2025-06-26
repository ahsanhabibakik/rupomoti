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

// --- Unified Error Handling ---
async function handleCourierError(res: Response, courierName: string) {
    const errorBody = await res.text();
    console.error(`❌ ${courierName} API Error (Status: ${res.status})`, { status: res.status, statusText: res.statusText, body: errorBody });
    if (res.status === 401) {
        if (courierName.startsWith('RedX') && env.REDX_API_URL.includes('openapi.redx')) {
            throw new Error(`RedX Production API authentication failed (401). This usually means the 'REDX_API_KEY' in your environment is for the sandbox. Please update it to your production key.`);
        }
        throw new Error(`Authentication failed for ${courierName}. Please check your API credentials.`);
    }
    try {
        const errorJson = JSON.parse(errorBody);
        const message = errorJson.message || errorJson.error || (errorJson.errors && JSON.stringify(errorJson.errors)) || 'API request failed.';
        throw new Error(`${courierName} Error: ${message}`);
    } catch (e) {
        throw new Error(`${courierName} Error: ${errorBody || 'An unknown API error occurred.'}`);
    }
}

// --- Dynamic Area/Zone ID Fetching ---
// THIS IS NOW DEPRECATED as the client sends pre-validated location info.
// I am keeping the functions here in case they are needed for other features, but they are not used in this POST handler.
async function getPathaoAreaInfo(city: string, zone: string, accessToken: string) {
    console.log(`Fetching Pathao areas for city: ${city}, zone: ${zone}`);
    const cityRes = await fetch(`${env.PATHAO_API_URL}/aladdin/api/v1/city-list`, {
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Accept': 'application/json' },
    });
    if (!cityRes.ok) await handleCourierError(cityRes, 'Pathao (City List)');
    const cityData = await cityRes.json();
    const cityInfo = cityData.data.data.find((c: any) => c.city_name.toLowerCase() === city.toLowerCase());
    if (!cityInfo) throw new Error(`Pathao city not found: ${city}`);

    const zoneRes = await fetch(`${env.PATHAO_API_URL}/aladdin/api/v1/cities/${cityInfo.city_id}/zone-list`, {
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Accept': 'application/json' },
    });
    if (!zoneRes.ok) await handleCourierError(zoneRes, 'Pathao (Zone List)');
    const zoneData = await zoneRes.json();
    const zoneInfo = zoneData.data.data.find((z: any) => z.zone_name.toLowerCase().includes(zone.toLowerCase()));
    if (!zoneInfo) throw new Error(`Pathao zone not found in ${city}: ${zone}`);

    // Pathao can also have a third level 'area'
    const areaRes = await fetch(`${env.PATHAO_API_URL}/aladdin/api/v1/zones/${zoneInfo.zone_id}/area-list`, {
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Accept': 'application/json' },
    });
     if (!areaRes.ok) await handleCourierError(areaRes, 'Pathao (Area List)');
    const areaData = await areaRes.json();
    // For now, we are not using area for pathao, but this is how you'd get it.
    // Assuming area is not mandatory for Pathao shipment.

    return { cityId: cityInfo.city_id, zoneId: zoneInfo.zone_id, areaId: null };
}

async function getRedxAreaInfo(district: string, areaName: string) {
    console.log(`Fetching RedX area for district: ${district}, area: ${areaName}`);
    const districtQueryUrl = `${env.REDX_API_URL}/areas?district_name=${encodeURIComponent(district)}`;
    const headers = { 'API-ACCESS-TOKEN': `Bearer ${env.REDX_API_KEY}` };

    const districtRes = await fetch(districtQueryUrl, { headers });

    if (districtRes.ok) {
        const areaData = await districtRes.json();
        const areaInfo = areaData.areas?.find((a: any) => a.name.toLowerCase().includes(areaName.toLowerCase()));
        if (areaInfo) {
            console.log(`Found RedX area '${areaInfo.name}' (ID: ${areaInfo.id}) for district '${district}'.`);
            return { areaId: areaInfo.id, areaName: areaInfo.name };
        }
    } else {
        const errorBody = await districtRes.text();
        console.warn(`RedX API call with district '${district}' failed with status ${districtRes.status}. Body: ${errorBody}. Falling back to fetching all areas.`);
    }
    
    console.log(`Fallback: Fetching all RedX areas to find '${areaName}'.`);
    const allAreasRes = await fetch(`${env.REDX_API_URL}/areas`, { headers });
    if (!allAreasRes.ok) {
        await handleCourierError(allAreasRes, 'RedX (All Areas)');
        throw new Error('Failed to fetch all areas from RedX after initial district lookup failed.');
    }

    const allAreasData = await allAreasRes.json();
    const candidates = allAreasData.areas?.filter((a: any) => 
        a.name.toLowerCase().includes(areaName.toLowerCase())
    ) || [];

    if (candidates.length === 0) {
        console.error(`RedX area not found for '${areaName}'. All available areas from RedX:`, allAreasData.areas?.map((a:any) => a.name));
        throw new Error(`RedX area not found for '${areaName}' after fallback.`);
    }

    if (candidates.length > 1) {
        const districtMatch = candidates.find((c: any) => c.name.toLowerCase().includes(district.toLowerCase()) || c.division_name?.toLowerCase().includes(district.toLowerCase()));
        if (districtMatch) {
            console.log(`Found multiple candidates for '${areaName}', selected '${districtMatch.name}' based on district '${district}'.`);
            return { areaId: districtMatch.id, areaName: districtMatch.name };
        }
        console.warn(`Found multiple areas for '${areaName}' and could not disambiguate using district '${district}'. Picking the first one: '${candidates[0].name}'. Candidates:`, candidates.map((c:any) => c.name));
    }
    
    const areaInfo = candidates[0];

    console.log(`Found RedX area '${areaInfo.name}' (ID: ${areaInfo.id}) via fallback search.`);
    return { areaId: areaInfo.id, areaName: areaInfo.name };
}

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
        if (!env.CARRYBEE_API_URL || !env.CARRYBEE_CLIENT_EMAIL || !env.CARRYBEE_CLIENT_PASSWORD) {
            throw new Error("CarryBee API credentials are not configured in environment variables.");
        }
        const res = await fetch(`${env.CARRYBEE_API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({
                username: env.CARRYBEE_CLIENT_EMAIL!,
                password: env.CARRYBEE_CLIENT_PASSWORD!,
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

// --- Main API Handler ---
export async function POST(request: Request) {
    const session = await getServerSession(authConfig);
    if (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'MANAGER') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { orderId } = body;

        if (!orderId) {
            return NextResponse.json({ error: 'Invalid input: orderId is required' }, { status: 400 });
        }

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { items: { include: { product: true } }, customer: true }
        });

        if (!order || !order.customer) {
            return NextResponse.json({ error: 'Order or customer not found' }, { status: 404 });
        }
        
        const courierId = order.courierName as CourierId | null;
        if (!courierId) {
             return NextResponse.json({ error: 'Order has no courier assigned' }, { status: 400 });
        }

        // --- Pre-shipment Data Validation ---
        // Validate customer phone number format for couriers with strict rules.
        if (courierId === 'steadfast') {
            const phone = order.customer.phone;
            // Steadfast requires an 11-digit Bangladeshi phone number (e.g., 01xxxxxxxxx).
            const bdPhoneRegex = /^01[3-9]\d{8}$/;
            if (!phone || !bdPhoneRegex.test(phone)) {
                throw new Error(`Invalid phone number for Steadfast: '${phone}'. Please correct the customer's phone number to a valid 11-digit format.`);
            }
        }

        let courierResponse: any;
        let consignmentId: string | number | undefined;
        let trackingCode: string | number | undefined;

        const totalWeight = order.items.reduce((acc, item) => acc + (item.product.weight || 0.5) * item.quantity, 0);
        const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
        
        // The client now sends recipientCity and recipientZone, which are assigned to the order.
        // We use these values to perform server-side lookups for courier-specific IDs.
        const { recipientCity, recipientZone, recipientArea } = order;
        if (!recipientCity || !recipientZone) {
            throw new Error('Recipient city and zone are required to ship.');
        }

        switch (courierId) {
            case 'steadfast': {
                const payload = {
                    invoice: order.orderNumber,
                    recipient_name: order.customer.name,
                    recipient_phone: order.customer.phone,
                    // Combine address details for Steadfast
                    recipient_address: `${order.customer.address}, ${recipientZone}, ${recipientCity}`,
                    cod_amount: order.total,
                    note: order.orderNote || 'Handle with care',
                };
                const res = await fetch(`${env.STEADFAST_API_URL}/create_order`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Api-Key': env.STEADFAST_API_KEY, 'Secret-Key': env.STEADFAST_SECRET_KEY },
                    body: JSON.stringify(payload)
                });
                if (!res.ok) await handleCourierError(res, 'Steadfast');
                courierResponse = await res.json();
                if (courierResponse.status !== 200) {
                    const errorMessage = `Steadfast API Error: ${courierResponse.message || 'Unknown error'}. Full response: ${JSON.stringify(courierResponse)}`;
                    console.error('❌ Steadfast shipment creation failed.', { request: payload, response: courierResponse });
                    throw new Error(errorMessage);
                }
                consignmentId = courierResponse.consignment.consignment_id;
                trackingCode = courierResponse.consignment.tracking_code;
                break;
            }

            case 'redx': {
                // RedX requires looking up area_id from area name (recipientZone) within a district (recipientCity).
                const { areaId, areaName } = await getRedxAreaInfo(recipientCity, recipientZone);

                const res = await fetch(`${env.REDX_API_URL}/parcel`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'API-ACCESS-TOKEN': `Bearer ${env.REDX_API_KEY}` },
                    body: JSON.stringify({
                        customer_name: order.customer.name,
                        customer_phone: order.customer.phone,
                        delivery_area_id: areaId,
                        delivery_area: areaName,
                        customer_address: order.customer.address,
                        cash_collection_amount: order.total,
                        value: order.total, // The declared value of the parcel
                        parcel_weight: totalWeight * 1000, // API expects weight in grams
                        merchant_invoice_id: order.orderNumber,
                        // Optional: Add detailed item list if needed
                        // parcel_details_json: order.items.map(item => ({ name: item.product.name, quantity: item.quantity, value: item.price }))
                    })
                });
                if (!res.ok) await handleCourierError(res, 'RedX');
                courierResponse = await res.json();
                if (courierResponse.message && courierResponse.message.toLowerCase().includes('error')) {
                     throw new Error(`RedX Error: ${JSON.stringify(courierResponse.message)}`);
                }
                trackingCode = courierResponse.tracking_id;
                consignmentId = courierResponse.tracking_id;
                break;
            }

            case 'pathao': {
                const accessToken = await getAccessToken('pathao');
                const { cityId, zoneId } = await getPathaoAreaInfo(recipientCity, recipientZone, accessToken);
                
                const res = await fetch(`${env.PATHAO_API_URL}/aladdin/api/v1/orders`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify({
                        store_id: parseInt(env.PATHAO_STORE_ID),
                        merchant_order_id: order.orderNumber,
                        recipient_name: order.customer.name,
                        recipient_phone: order.customer.phone,
                        recipient_address: order.customer.address,
                        recipient_city: cityId,
                        recipient_zone: zoneId,
                        // recipient_area: areaId, // Area ID is optional for Pathao
                        delivery_type: 48, // 48 for standard, 12 for on-demand
                        item_type: 2, // 2 for parcel
                        item_quantity: totalQuantity,
                        item_weight: totalWeight, // Pathao expects weight in KG
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
                 if (!env.CARRYBEE_API_URL || !env.CARRYBEE_CLIENT_EMAIL || !env.CARRYBEE_CLIENT_PASSWORD || !env.CARRYBEE_STORE_ID) {
                    throw new Error("CarryBee API credentials are not fully configured in environment variables.");
                 }
                 const accessToken = await getAccessToken('carrybee');
                 
                 // THIS IS A MAJOR ASSUMPTION. CarryBee's API for getting location IDs is unknown.
                 // We are assuming it's similar to Pathao's. This will likely fail if their API is different.
                 // We need the real CarryBee API documentation to implement this correctly.
                 console.warn("⚠️ CarryBee implementation is based on assumptions due to missing API documentation.");

                 // Mocking a lookup. Replace with actual API calls when available.
                 // const { cityId, zoneId, areaId } = await getCarryBeeAreaInfo(recipientCity, recipientZone, recipientArea);

                 const res = await fetch(`${env.CARRYBEE_API_URL}/orders`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        store_id: env.CARRYBEE_STORE_ID,
                        merchant_order_id: order.orderNumber,
                        recipient_name: order.customer.name,
                        recipient_phone: order.customer.phone,
                        recipient_address: order.customer.address,
                        recipient_city: recipientCity, // This is likely wrong, should be an ID
                        recipient_thana: recipientZone, // This is likely wrong, should be an ID
                        // area_id: areaId,
                        cod_amount: order.total,
                        package_weight: totalWeight,
                        package_details: order.items.map(i => `${i.product.name} (x${i.quantity})`).join(', '),
                    })
                 });
                if (!res.ok) await handleCourierError(res, 'CarryBee');
                courierResponse = await res.json();
                if(!courierResponse.success) throw new Error(`CarryBee API Error: ${courierResponse.message || 'Unknown error'}`);
                trackingCode = courierResponse.tracking_id;
                consignmentId = courierResponse.order_id;
                break;
            }
            
            default:
                return NextResponse.json({ error: 'Invalid or not implemented courier' }, { status: 400 });
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
        console.error('💥 Shipment creation failed:', error);
        return NextResponse.json({ error: error.message || 'An unexpected error occurred.' }, { status: 500 });
    }
} 