import { NextResponse } from 'next/server';
import { BANGLADESH_DISTRICTS } from '@/lib/constants/bangladesh-locations';

export async function GET() {
    try {
        const allDistricts = Object.values(BANGLADESH_DISTRICTS).flat();
        const formattedDistricts = allDistricts.map(d => ({ id: d.id, name: d.name }));
        return NextResponse.json({ districts: formattedDistricts });
    } catch (error) {
        console.error("Error fetching districts:", error);
        return NextResponse.json({ error: 'Failed to fetch districts' }, { status: 500 });
    }
} 