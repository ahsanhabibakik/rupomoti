import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth-config';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = (buffer: Buffer, folder: string, resource_type: 'image' | 'video' | 'raw' | 'auto') => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream({
      folder,
      resource_type,
      transformation: resource_type === 'image' ? [{ quality: 'auto:good' }, { fetch_format: 'auto' }] : undefined,
    }, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    }).end(buffer);
  });
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const section = searchParams.get('section');
  
  // Publicly accessible sections
  const publicSections = ['logo', 'hero', 'homepage-features'];

  try {
    if (section && publicSections.includes(section)) {
      const media = await prisma.media.findMany({
        where: { section: section },
        orderBy: { position: 'asc' },
      });
      return NextResponse.json(media);
    }
    
    // For all other media, require admin authentication
    const session = await getServerSession(authConfig);
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const media = await prisma.media.findMany({
      orderBy: [
        { section: 'asc' },
        { position: 'asc' },
        { createdAt: 'desc' }
      ]
    });
    return NextResponse.json(media);
  } catch (error) {
    console.error('Error fetching media:', error);
    return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const mobileFile = formData.get('mobileFile') as File | null;
    const section = formData.get('section') as string;
    const name = formData.get('name') as string;
    const alt = formData.get('alt') as string;
    const type = (formData.get('type') as string) || 'image';

    if (!file || !section || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const result: any = await uploadToCloudinary(buffer, `rupomoti/${section}`, type as 'image' | 'video' | 'raw' | 'auto');

    let mobileResult: any = null;
    if (mobileFile) {
      const mobileBytes = await mobileFile.arrayBuffer();
      const mobileBuffer = Buffer.from(mobileBytes);
      mobileResult = await uploadToCloudinary(mobileBuffer, `rupomoti/${section}/mobile`, type as 'image' | 'video' | 'raw' | 'auto');
    }

    const maxPosition = await prisma.media.aggregate({
      where: { section },
      _max: { position: true },
    });

    const newPosition = (maxPosition._max.position || 0) + 1;

    const media = await prisma.media.create({
      data: {
        name,
        url: result.secure_url,
        alt: alt || name,
        type,
        section,
        position: newPosition,
        cloudinaryId: result.public_id,
        metadata: {
          width: result.width,
          height: result.height,
          format: result.format,
          size: result.bytes,
          originalName: file.name,
          mobileUrl: mobileResult?.secure_url,
          mobileCloudinaryId: mobileResult?.public_id,
        },
      },
    });

    return NextResponse.json(media);
  } catch (error) {
    console.error('Error uploading media:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Media ID is required' }, { status: 400 })
    }

    const media = await prisma.media.findUnique({ where: { id } })
    if (!media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 })
    }

    if (media.cloudinaryId) {
      await cloudinary.uploader.destroy(media.cloudinaryId);
    }

    const metadata = media.metadata as { mobileCloudinaryId?: string };
    if (metadata?.mobileCloudinaryId) {
      await cloudinary.uploader.destroy(metadata.mobileCloudinaryId);
    }

    await prisma.media.delete({ where: { id } });

    return NextResponse.json({ message: 'Media deleted successfully' });
  } catch (error) {
    console.error('Error deleting media:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 