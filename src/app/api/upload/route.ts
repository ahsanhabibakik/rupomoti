import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const uploadPromises = files.map((file) => {
      return new Promise<{ secure_url: string }>((resolve, reject) => {
        file.arrayBuffer().then((bytes) => {
          const buffer = Buffer.from(bytes);

          cloudinary.uploader
            .upload_stream(
              {
                resource_type: 'auto',
                folder: 'rupomoti',
              },
              (error, result) => {
                if (error) {
                  reject(error);
                } else if (result) {
                  resolve(result as { secure_url: string });
                } else {
                  reject(new Error('Cloudinary upload failed'));
                }
              },
            )
            .end(buffer);
        });
      });
    });

    const results = await Promise.all(uploadPromises);
    const urls = results.map((result) => result.secure_url);

    return NextResponse.json({ urls });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
} 