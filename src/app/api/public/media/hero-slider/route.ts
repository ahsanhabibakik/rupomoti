import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fallbackHeroSlides } from '@/lib/fallback-data';

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
    console.log('🔄 Using fallback hero slides due to database connectivity issues');
    
    // Return fallback hero slides when database is unreachable
    const fallbackFormatted = fallbackHeroSlides.map(slide => ({
      id: slide.id,
      image: slide.url,
      mobileImage: slide.url,
      title: slide.alt,
      subtitle: 'Discover our exquisite collection',
      link: '/shop',
      cta: 'Shop Now',
    }));
    
    return NextResponse.json(fallbackFormatted);
  }
}
