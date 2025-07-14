import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';


import { z } from 'zod';
import { getPathaoAccessToken, fetchPathaoCities, fetchPathaoZones } from '@/lib/pathao';

const syncEnvSchema = z.object({
  PATHAO_SYNC_SECRET: z.string().min(1),
});

async function fetchAllPathaoLocations() {
  const accessToken = await getPathaoAccessToken();
  console.log('Fetching all cities from Pathao...');
  const cities = await fetchPathaoCities(accessToken);

  const allLocations = [];
  console.log(`Found ${cities.length} cities. Fetching zones for each...`);

  for (const city of cities) {
    try {
      const zones = await fetchPathaoZones(city.city_id, accessToken);
      allLocations.push({
        city_id: city.city_id,
        city_name: city.city_name,
        zones: zones.map((z: Record<string, unknown>) => ({ zone_id: z.zone_id, zone_name: z.zone_name })),
      });
      console.log(`✅ Fetched ${zones.length} zones for ${city.city_name}.`);
    } catch (error) {
      console.error(`❌ Failed to fetch zones for city: ${city.city_name} (ID: ${city.city_id})`, error);
    }
  }
  return allLocations;
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const env = syncEnvSchema.parse(process.env);
    const secret = request.headers.get('x-sync-secret');
    if (secret !== env.PATHAO_SYNC_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const locations = await fetchAllPathaoLocations();
    if (locations.length === 0) {
      return NextResponse.json({ message: 'No locations fetched from Pathao. Database not updated.' }, { status: 500 });
    }
    console.log(`Syncing ${locations.length} cities with zones to the database...`);
    const operations = locations.map(loc =>
      prisma.pathaoLocation.upsert({
        where: { city_id: loc.city_id },
        update: { city_name: loc.city_name, zones: loc.zones },
        create: { city_id: loc.city_id, city_name: loc.city_name, zones: loc.zones },
      })
    );
    await prisma.$transaction(operations);
    console.log('\u2705 Pathao locations synced successfully.');
    return NextResponse.json({
      message: 'Pathao locations synced successfully.',
      cityCount: locations.length,
    });
  } catch (error) {
    console.error('\ud83d\udca5 Failed to sync Pathao locations:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to sync locations', details: errorMessage }, { status: 500 });
  }
}