import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const section = searchParams.get('section');
  
  const publicSections = ['logo', 'hero', 'homepage-features', 'favicon'];

  if (!section || !publicSections.includes(section)) {
    return NextResponse.json({ error: 'Invalid section' }, { status: 400 });
  }

  try {
    const media = await prisma.media.findMany({
      where: { section: section },
      orderBy: { position: 'asc' },
    });
    
    if (!media || media.length === 0) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    return NextResponse.json(media);
  } catch (error) {
    console.error(`Error fetching media for section ${section}:`, error);
    return NextResponse.json({ error: `Failed to fetch media for section ${section}` }, { status: 500 });
  }
} 