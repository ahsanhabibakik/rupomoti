import { NextRequest, NextResponse } from 'next/server';
import { withMongoose, parseQueryParams, getPaginationParams } from '@/lib/mongoose-utils';


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ section: string }> }
) {
  let section: string = '';
  try {
    const resolvedParams = await params;
    section = resolvedParams.section;

    if (!section) {
      return NextResponse.json({ error: 'Section is required' }, { status: 400 });
    }

    const media = await prisma.media.findMany({
      where: {
        section: section,
        isActive: true,
      },
      orderBy: [
        { position: 'asc' },
        { createdAt: 'desc' }
      ],
    });

    return NextResponse.json(media);
  } catch (error) {
    console.error(`Error fetching media for section ${section || 'unknown'}:`, error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 