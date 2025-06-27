import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const pathaoEnvSchema = z.object({
  PATHAO_API_URL: z.string().url().default('https://api-hermes.pathao.com'),
  PATHAO_CLIENT_ID: z.string().min(1),
  PATHAO_CLIENT_SECRET: z.string().min(1),
  PATHAO_USERNAME: z.string().min(1),
  PATHAO_PASSWORD: z.string().min(1),
});

let _env: z.infer<typeof pathaoEnvSchema> | undefined;

function getEnv() {
  if (_env) {
    return _env;
  }
  try {
    _env = pathaoEnvSchema.parse(process.env);
    return _env;
  } catch (error) {
    console.error("❌ Missing or invalid Pathao environment variables:", error);
    throw new Error("Server configuration error: Missing Pathao API credentials.");
  }
}

// Centralized error handling for Pathao API calls
async function fetchFromPathaoAPI(endpoint: string, options: RequestInit, context: string) {
  const env = getEnv();
  const url = `${env.PATHAO_API_URL}${endpoint}`;
  const res = await fetch(url, options);
  const responseText = await res.text();
  const contentType = res.headers.get('content-type') || '';

  if (!res.ok) {
    console.error(`❌ Pathao API Error (${context}) - Status: ${res.status}`, {
      status: res.status,
      statusText: res.statusText,
      body: responseText,
    });
  }

  if (!contentType.includes('application/json')) {
    const errMessage = `Pathao API (${context}) returned non-JSON response. Status: ${res.status}. Response: ${responseText.substring(0, 500)}...`;
    console.error(`❌ ${errMessage}`);
    throw new Error(errMessage);
  }

  try {
    const json = JSON.parse(responseText);
    if (!res.ok) {
      const message = json.message || json.error || (json.errors && JSON.stringify(json.errors)) || 'API request failed.';
      throw new Error(`Pathao Error (${context}): ${message}`);
    }
    return json;
  } catch (e) {
    const errMessage = `Failed to parse JSON from Pathao (${context}). Status: ${res.status}. Response: ${responseText.substring(0, 500)}...`;
    console.error(`❌ ${errMessage}`, e);
    throw new Error(errMessage);
  }
}

// Function to get a valid access token, handling refresh logic
export async function getPathaoAccessToken(): Promise<string> {
  const env = getEnv();
  const existingToken = await prisma.courierToken.findUnique({ where: { courier: 'pathao' } });

  if (existingToken && existingToken.expiresAt > new Date(Date.now() + 60000)) {
    return existingToken.accessToken;
  }

  if (existingToken && existingToken.refreshToken) {
    console.log(`Pathao access token expired. Attempting to refresh...`);
    try {
      const refreshed = await fetchFromPathaoAPI(
        '/aladdin/api/v1/issue-token',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            client_id: env.PATHAO_CLIENT_ID,
            client_secret: env.PATHAO_CLIENT_SECRET,
            grant_type: 'refresh_token',
            refresh_token: existingToken.refreshToken,
          }),
        },
        'Refresh Token'
      );

      if (refreshed.access_token) {
        const expiresAt = new Date(Date.now() + refreshed.expires_in * 1000);
        await prisma.courierToken.upsert({
          where: { courier: 'pathao' },
          update: { accessToken: refreshed.access_token, refreshToken: refreshed.refresh_token, expiresAt },
          create: { courier: 'pathao', accessToken: refreshed.access_token, refreshToken: refreshed.refresh_token, expiresAt },
        });
        console.log('✅ Successfully refreshed Pathao token.');
        return refreshed.access_token;
      }
    } catch (error) {
      console.warn(`⚠️ Failed to refresh Pathao token. Falling back to password grant.`, error);
    }
  }

  console.log(`Fetching new Pathao token using password grant...`);
  const response = await fetchFromPathaoAPI(
    '/aladdin/api/v1/issue-token',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        client_id: env.PATHAO_CLIENT_ID,
        client_secret: env.PATHAO_CLIENT_SECRET,
        username: env.PATHAO_USERNAME,
        password: env.PATHAO_PASSWORD,
        grant_type: 'password',
      }),
    },
    'Issue Token'
  );

  if (!response.access_token) {
    throw new Error(`Failed to get Pathao token: ${response.message || 'Malformed response'}`);
  }

  const expiresAt = new Date(Date.now() + response.expires_in * 1000);
  await prisma.courierToken.upsert({
    where: { courier: 'pathao' },
    update: { accessToken: response.access_token, refreshToken: response.refresh_token, expiresAt },
    create: { courier: 'pathao', accessToken: response.access_token, refreshToken: response.refresh_token, expiresAt },
  });
  console.log('✅ Successfully fetched new Pathao token.');
  return response.access_token;
}

// Function to fetch all cities
export async function fetchPathaoCities(accessToken: string): Promise<any[]> {
  const response = await fetchFromPathaoAPI(
    '/aladdin/api/v1/city-list',
    { headers: { 'Authorization': `Bearer ${accessToken}`, 'Accept': 'application/json' } },
    'City List'
  );
  return response.data.data;
}

// Function to fetch zones for a specific city
export async function fetchPathaoZones(cityId: number, accessToken: string): Promise<any[]> {
  const response = await fetchFromPathaoAPI(
    `/aladdin/api/v1/cities/${cityId}/zone-list`,
    { headers: { 'Authorization': `Bearer ${accessToken}`, 'Accept': 'application/json' } },
    `Zone List for City ${cityId}`
  );
  return response.data.data;
}

export async function createPathaoOrder(payload: any, accessToken: string): Promise<any> {
  return await fetchFromPathaoAPI('/aladdin/api/v1/orders', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(payload),
  }, 'Create Order');
} 