import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary explicitly
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 });
    }
    
    // Special handling for SVG files
    const isSvg = file.type === 'image/svg+xml' || formData.get('isSvg') === 'true';

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Get section parameter or use default
    const section = formData.get('section') as string || 'general';
    
    // Setup transformation options based on section
    let options: Record<string, any> = {
      resource_type: 'auto',
      folder: `rupomoti/${section}`,
    };
    
    // Special handling for SVG files - minimal transformations
    if (isSvg) {
      // For SVGs, don't apply transformations that could break the vector format
      options = {
        ...options,
        resource_type: 'image', // SVGs should be uploaded as images
        format: 'svg', // Preserve the SVG format
      };
    } else {
      // Standard image transformations for non-SVG files
      options = {
        ...options,
        quality: 'auto:good',
        fetch_format: 'auto',
      };
      
      // Apply section-specific dimensions for non-SVG files
      if (section === 'logo') {
        options.width = 300;
        options.height = 100;
        options.crop = 'limit';
      } else if (section === 'hero-slider' || section.startsWith('hero-slider/')) {
        options.width = 1920;
        options.height = 800;
        options.crop = 'limit';
      } else if (section === 'banner') {
        options.width = 1200;
        options.height = 400;
        options.crop = 'limit';
      } else {
        options.width = 800;
        options.height = 600;
        options.crop = 'limit';
      }
    }
    
    // Upload to cloudinary with optimization
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        options,
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(new Error(`Upload failed: ${error.message}`));
          } else {
            resolve(result);
          }
        }
      ).end(buffer);
    });

    return NextResponse.json({ url: (result as { secure_url: string }).secure_url });
  } catch (error) {
    console.error('Upload error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Upload failed';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 