import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth-config';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authConfig);
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create default logo media
    const logo = await prisma.media.upsert({
      where: {
        id: 'default_logo',
      },
      update: {},
      create: {
        id: 'default_logo',
        name: 'Default Logo',
        url: '/images/branding/logo.png',
        alt: 'Rupomoti Logo',
        type: 'image',
        section: 'logo',
        position: 0,
        isActive: true,
        metadata: {
          width: 200,
          height: 60,
        },
      },
    });

    // Create default favicon media
    const favicon = await prisma.media.upsert({
      where: {
        id: 'default_favicon',
      },
      update: {},
      create: {
        id: 'default_favicon',
        name: 'Default Favicon',
        url: '/favicon.ico',
        alt: 'Rupomoti Favicon',
        type: 'image',
        section: 'favicon',
        position: 0,
        isActive: true,
      },
    });

    return NextResponse.json({ logo, favicon });
  } catch (error) {
    console.error('Error seeding media:', error);
    return NextResponse.json(
      { error: 'Failed to seed media' },
      { status: 500 }
    );
  }
} 