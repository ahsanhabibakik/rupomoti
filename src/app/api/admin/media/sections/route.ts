import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';


import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/auth';

// Default sections if none are found in the database
const DEFAULT_SECTIONS = [
  {
    name: 'hero-slider',
    title: 'Hero Slider',
    description: 'Main banner images for the homepage',
    maxItems: 10,
    isActive: true,
    settings: {
      formats: ['image/jpeg', 'image/png', 'image/webp'],
      maxWidth: 1920,
      maxHeight: 800,
      guidelines: 'Desktop: 1920x800px (16:9 ratio). Mobile: 800x1000px (4:5 ratio).'
    }
  },
  {
    name: 'logo',
    title: 'Logo',
    description: 'Website logo and branding',
    maxItems: 1,
    isActive: true,
    settings: {
      formats: ['image/png', 'image/svg+xml'],
      maxWidth: 300,
      maxHeight: 100,
      guidelines: '300x100px, PNG with transparent background'
    }
  },
  {
    name: 'banner',
    title: 'Banners',
    description: 'Promotional banners and ads',
    maxItems: 20,
    isActive: true,
    settings: {
      formats: ['image/jpeg', 'image/png', 'image/webp'],
      maxWidth: 1200,
      maxHeight: 400,
      guidelines: '1200x400px, JPG/PNG/WEBP, max 1MB'
    }
  }
];

// Helper to get session and check for user
const getSession = async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error('Unauthorized: No user session found');
  }
  return session;
};

// Helper for authorization check
const hasWritePermission = (role?: string) => {
  return role === 'ADMIN' || role === 'SUPER_ADMIN';
};

// GET /api/admin/media/sections - Fetch all media sections
export async function GET(req: Request) {
  try {
    await connectDB();
    const session = await getSession();
    
    // Allow read access for Admin and Super Admin
    if (!hasWritePermission(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Get sections from the database
    let sections = await prisma.mediaSection.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
    
    // If no sections are found, return the defaults
    if (!sections || sections.length === 0) {
      return NextResponse.json(DEFAULT_SECTIONS);
    }
    
    return NextResponse.json(sections);
  } catch (error) {
    console.error('Error fetching media sections:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    const statusCode = errorMessage.startsWith('Unauthorized') ? 401 : 500;
    // Return default sections on error instead of failing
    return NextResponse.json(DEFAULT_SECTIONS);
  }
}