import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    message: 'Upload debug endpoint is working',
    cloudinaryConfig: {
      hasCloudinaryUrl: !!process.env.CLOUDINARY_URL,
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      hasApiKey: !!process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY
    }
  });
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
  try {
    console.log('🔧 Debug: Upload endpoint called');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    console.log('🔧 Debug: File received:', {
      hasFile: !!file,
      name: file?.name,
      type: file?.type,
      size: file?.size
    });
    
    if (!file) {
      console.log('❌ Debug: No file provided');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.log('❌ Debug: Invalid file type:', file.type);
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      console.log('❌ Debug: File too large:', file.size);
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 });
    }

    console.log('✅ Debug: File validation passed');

    // For now, just return a mock URL to test the flow
    const mockUrl = `https://res.cloudinary.com/dotinshdj/image/upload/v1/rupomoti/categories/test-${Date.now()}.jpg`;
    
    console.log('✅ Debug: Returning mock URL:', mockUrl);
    
    return NextResponse.json({ 
      url: mockUrl,
      debug: true,
      message: 'This is a mock upload response for testing'
    });
    
  } catch (error) {
    console.error('💥 Debug: Upload error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Upload failed';
    return NextResponse.json({ error: errorMessage, debug: true }, { status: 500 });
  }
}
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}} catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}