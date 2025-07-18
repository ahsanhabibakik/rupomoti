import { NextResponse } from 'next/server';
import { BANGLADESH_UPAZILAS, BANGLADESH_DISTRICTS } from '@/lib/constants/bangladesh-locations';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const districtName = searchParams.get('district');

        if (!districtName) {
            return NextResponse.json({ error: 'District name is required' }, { status: 400 });
        }

        // Find the district ID from its name
        let districtId: string | null = null;
        for (const key in BANGLADESH_DISTRICTS) {
            const found = BANGLADESH_DISTRICTS[key].find(d => d.name.toLowerCase() === districtName.toLowerCase());
            if (found) {
                districtId = found.id;
                break;
            }
        }
        
        if (!districtId) {
            return NextResponse.json({ upazilas: [] }); // No district found, return empty
        }
        
        const upazilas = BANGLADESH_UPAZILAS[districtId] || [];
        const formattedUpazilas = upazilas.map(u => ({ id: u.id, name: u.name }));
        
        return NextResponse.json({ upazilas: formattedUpazilas });
    } catch (error) {
        console.error("Error fetching upazilas:", error);
        return NextResponse.json({ error: 'Failed to fetch upazilas' }, { status: 500 });
    }
} 