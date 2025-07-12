import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';

import { existsSync } from 'fs';
import { join } from 'path';

// Default logo configuration
const DEFAULT_LOGO = {
  id: 'default',
  url: '/images/branding/logo.png',
  name: 'Rupomoti Logo',
  alt: 'Rupomoti Jewelry',
  metadata: {
    isDefault: true,
    width: 300,
    height: 100,
  }
};

// Cache settings
export const revalidate = 3600; // Revalidate every hour

/**
 * Validate that a URL exists in the public directory
 */
const validatePublicAssetExists = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  
  // Ignore absolute URLs
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return true;
  }
  
  // For local paths, check if the file exists
  try {
    // Remove leading slash and convert to filesystem path
    const cleanPath = url.startsWith('/') ? url.substring(1) : url;
    const filePath = join(process.cwd(), 'public', cleanPath);
    return existsSync(filePath);
  } catch (error) {
    console.error('Error checking if file exists:', error);
    return false;
  }
};

export async function GET() {
  try {
    // 1. Try to get the active logo from the database
    const logo = await prisma.media.findFirst({
      where: {
        section: 'logo',
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
        createdAt: true,
        updatedAt: true,
      }
    });

    // 2. If no logo is found or the URL doesn't pass validation checks
    if (!logo || !logo.url) {
      // Check if default logo exists before returning it
      if (validatePublicAssetExists(DEFAULT_LOGO.url)) {
        console.log('No DB logo found, using default logo:', DEFAULT_LOGO.url);
        // Return with cache headers
        return NextResponse.json(DEFAULT_LOGO, {
          headers: {
            'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
          }
        });
      } else {
        console.log('No DB logo and default logo missing, using fallback');
        // If default logo doesn't exist either, return a fallback
        return NextResponse.json({
          ...DEFAULT_LOGO,
          url: '/images/placeholder.png',
          metadata: {
            ...DEFAULT_LOGO.metadata,
            isFallback: true
          }
        });
      }
    }
    
    // Special handling for local upload paths that need to be served from Cloudinary
    if (logo.url.startsWith('/uploads/') && !logo.url.includes('res.cloudinary.com')) {
      console.log('Converting local upload path to Cloudinary URL:', logo.url);
      // Extract folder and filename
      const pathParts = logo.url.split('/').filter(Boolean);
      const folder = pathParts.length > 1 ? pathParts[pathParts.length - 2] : '';
      const filename = pathParts[pathParts.length - 1];
      const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dotinshdj';
      
      // Update the URL to use Cloudinary
      logo.url = `https://res.cloudinary.com/${cloudName}/image/upload/${folder ? folder + '/' : ''}${filename}`;
    }

    // 3. Return the logo from the database with proper formatting
    const formattedLogo = {
      id: logo.id,
      url: logo.url,
      name: logo.name || 'Rupomoti Logo',
      alt: logo.alt || 'Rupomoti Logo',
      metadata: logo.metadata || {},
      lastUpdated: logo.updatedAt
    };

    // Add cache headers for better performance
    return NextResponse.json(formattedLogo, {
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
      }
    });
  } catch (error) {
    console.error('Failed to fetch logo:', error);
    
    // In case of error, return the default logo instead of an error
    if (validatePublicAssetExists(DEFAULT_LOGO.url)) {
      return NextResponse.json(DEFAULT_LOGO);
    } else {
      return NextResponse.json({
        ...DEFAULT_LOGO,
        url: '/images/placeholder.png',
        metadata: {
          ...DEFAULT_LOGO.metadata,
          isFallback: true,
          isError: true
        }
      });
    }
  }
}
