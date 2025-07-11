import { NextResponse } from 'next/server';
import { withMongoose, parseQueryParams, getPaginationParams } from '@/lib/mongoose-utils';


export const revalidate = 60; // Revalidate every 60 seconds

export async function GET() {
  try {
    const slides = await prisma.media.findMany({
      where: {
        section: 'hero-slider',
        isActive: true,
      },
      orderBy: {
        position: 'asc',
      },
      select: {
        id: true,
        name: true,
        url: true,
        alt: true,
        metadata: true,
      }
    });

    const formattedSlides = slides
      .filter(slide => slide.url && slide.url.trim() !== '') // Filter out slides with empty URLs
      .map(slide => {
        const metadata = slide.metadata as any || {};
        const baseUrl = slide.url.trim();
        const mobileUrl = metadata.mobileUrl && metadata.mobileUrl.trim() !== '' 
          ? metadata.mobileUrl.trim() 
          : baseUrl;
        
        return {
          id: slide.id,
          image: baseUrl,
          mobileImage: mobileUrl,
          title: slide.name || 'Hero Slide',
          subtitle: slide.alt || '',
          link: metadata.link && metadata.link.trim() !== '' ? metadata.link.trim() : '#',
          cta: metadata.cta && metadata.cta.trim() !== '' ? metadata.cta.trim() : 'Shop Now',
        };
      });

    return NextResponse.json(formattedSlides);
  } catch (error) {
    console.error('Failed to fetch hero slides:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
