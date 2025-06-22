import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth-config';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authConfig);
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create the upload preset
    const result = await cloudinary.api.create_upload_preset({
      name: 'rupomoti_products',
      folder: 'rupomoti/products',
      allowed_formats: ['jpg', 'png', 'webp'],
      transformation: [
        { width: 800, height: 800, crop: 'limit' },
        { quality: 'auto' }
      ],
      unique_filename: true,
      use_filename: true,
      overwrite: false
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error creating upload preset:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create upload preset' },
      { status: 500 }
    );
  }
} 