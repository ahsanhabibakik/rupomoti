import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/auth';
import { prisma } from '@/lib/prisma';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = (buffer: Buffer, folder: string) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream({
      folder,
      resource_type: 'auto',
      transformation: [{ quality: 'auto:good' }, { fetch_format: 'auto' }],
    }, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    }).end(buffer);
  });
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const { id } = await params;

    const existingMedia = await prisma.media.findUnique({ where: { id } });
    if (!existingMedia) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    const data: any = {
        name: formData.get('name') as string,
        alt: formData.get('alt') as string,
        isActive: formData.get('isActive') === 'true',
    };

    const file = formData.get('file') as File | null;
    const mobileFile = formData.get('mobileFile') as File | null;

    const metadata = (existingMedia.metadata as any) || {};

    if (file) {
      if (existingMedia.cloudinaryId) {
        await cloudinary.uploader.destroy(existingMedia.cloudinaryId);
      }
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const result: any = await uploadToCloudinary(buffer, `rupomoti/${existingMedia.section}`);
      data.url = result.secure_url;
      data.cloudinaryId = result.public_id;
      metadata.width = result.width;
      metadata.height = result.height;
    }

    if (mobileFile) {
        if (metadata.mobileCloudinaryId) {
            await cloudinary.uploader.destroy(metadata.mobileCloudinaryId);
        }
        const mobileBytes = await mobileFile.arrayBuffer();
        const mobileBuffer = Buffer.from(mobileBytes);
        const mobileResult: any = await uploadToCloudinary(mobileBuffer, `rupomoti/${existingMedia.section}/mobile`);
        metadata.mobileUrl = mobileResult.secure_url;
        metadata.mobileCloudinaryId = mobileResult.public_id;
    }
    
    data.metadata = metadata;

    const updatedMedia = await prisma.media.update({
      where: { id },
      data,
    });

    return NextResponse.json(updatedMedia);
  } catch (error) {
    console.error('Error updating media:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 