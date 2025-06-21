import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { section: string } }
) {
  try {
    const section = params.section;

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
    console.error(`Error fetching media for section ${params.section}:`, error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 