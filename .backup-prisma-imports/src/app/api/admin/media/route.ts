import { NextRequest, NextResponse } from 'next/server';
import { withMongoose, parseQueryParams, getPaginationParams } from '@/lib/mongoose-utils';

import { auth } from '@/app/auth';
import { z } from 'zod';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// Helper to get session and check for user
const getSession = async () => {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized: No user session found');
  }
  return session;
};

// Helper for authorization check for write operations
const hasWritePermission = (role?: string) => {
  return role === 'ADMIN' || role === 'SUPER_ADMIN';
};

// GET /api/admin/media - Fetch all media
export const GET = withMongoose(async (req) => {
  try {
    const session = await getSession();
    // Allow read access for more roles if needed, for now restricted
    if (!hasWritePermission(session.user.role)) {
         return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const media = await prisma.media.findMany({
      orderBy: [{ section: 'asc' }, { position: 'asc' }],
    });
    return NextResponse.json(media);
  } catch (error) {
    console.error('Error fetching media:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    const statusCode = errorMessage.startsWith('Unauthorized') ? 401 : 500;
    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}

// Helper to upload a file to local storage
const uploadFile = async (file: File, section: string) => {
  // Check if this is an SVG from Cloudinary - if so, don't save it locally
  if ((file.type === 'image/svg+xml' || file.name.endsWith('.svg')) && file.name.includes('cloudinary')) {
    const timestamp = Date.now();
    const filename = `cloudinary_svg_${timestamp}.svg`;
    
    // Don't actually save the file, just return the cloudinary URL if available
    // This is a placeholder - in production, extract the actual Cloudinary URL
    return {
      url: file.name.startsWith('cloudinary:') 
        ? file.name.substring(11) // Extract URL if prefixed with cloudinary:
        : `/placeholder.svg`, // Fallback if no URL is provided
      filename
    };
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Create filename with timestamp to avoid conflicts
  const timestamp = Date.now();
  const extension = file.name.split('.').pop();
  const filename = `${section}_${timestamp}.${extension}`;
  
  // Create uploads directory if it doesn't exist
  const uploadsDir = join(process.cwd(), 'public', 'uploads', section);
  if (!existsSync(uploadsDir)) {
    await mkdir(uploadsDir, { recursive: true });
  }

  const filepath = join(uploadsDir, filename);
  await writeFile(filepath, buffer);
  
  return {
    url: `/uploads/${section}/${filename}`,
    filename
  };
};

// POST /api/admin/media - Upload new media
export const POST = withMongoose(async (req) => {
  try {
    const session = await getSession();
    if (!hasWritePermission(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const formData = await req.formData();
    const desktopFile = formData.get('file') as File | null;
    const cloudinaryUrl = formData.get('cloudinaryUrl') as string | null;
    const mobileFile = formData.get('mobileFile') as File | null;
    const mobileCloudinaryUrl = formData.get('mobileCloudinaryUrl') as string | null;
    const name = formData.get('name') as string;
    const alt = formData.get('alt') as string;
    const section = formData.get('section') as string;

    // Validate required fields - either a file or cloudinaryUrl is required
    if ((!desktopFile && !cloudinaryUrl) || !name || !section) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // For logo section, check if a logo already exists
    if (section === 'logo') {
      const existingLogo = await prisma.media.findFirst({
        where: { section: 'logo' }
      });
      
      if (existingLogo) {
        return NextResponse.json({ 
          error: 'A logo already exists. Please update the existing logo instead of creating a new one.' 
        }, { status: 400 });
      }
    }

    // Handle file uploads or use Cloudinary URLs
    let desktopUrl: string;
    let mobileUrl: string | null = null;
    let desktopFilename: string | null = null;
    let mobileFilename: string | null = null;
    let isCloudinary = false;

    if (cloudinaryUrl) {
      // Use the provided Cloudinary URL
      desktopUrl = cloudinaryUrl;
      isCloudinary = true;
      
      // For Cloudinary URLs, extract the public ID as filename
      try {
        // Extract filename from URL
        const matches = cloudinaryUrl.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/);
        desktopFilename = matches ? matches[1] : `cloudinary-${Date.now()}`;
      } catch (error) {
        console.warn('Error extracting filename from Cloudinary URL:', error);
        desktopFilename = `cloudinary-${Date.now()}`;
      }
    } else if (desktopFile) {
      try {
        // Check if it's a real file or a placeholder for Cloudinary URL
        if (desktopFile.name.startsWith('cloudinary-url') && desktopFile.size === 0) {
          // This is a placeholder file, but we don't have a cloudinaryUrl
          return NextResponse.json({ error: 'Invalid Cloudinary URL' }, { status: 400 });
        }
        
        // Don't save SVG files locally if they come from Cloudinary
        if (desktopFile.name.endsWith('.svg') && desktopFile.type === 'image/svg+xml' && (formData.get('isFromCloudinary') === 'true')) {
          // Extract the URL from the file object if possible or use a placeholder
          desktopUrl = `/placeholder.svg`; // This should be replaced with proper SVG handling
          desktopFilename = `cloudinary-svg-${Date.now()}`;
          isCloudinary = true;
        } else {
          // Upload the file to local storage
          const upload = await uploadFile(desktopFile, section);
          desktopUrl = upload.url;
          desktopFilename = upload.filename;
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        return NextResponse.json({ error: 'File upload failed' }, { status: 500 });
      }
    } else {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    if (mobileCloudinaryUrl) {
      mobileUrl = mobileCloudinaryUrl;
      try {
        // Extract filename from URL
        const matches = mobileCloudinaryUrl.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/);
        mobileFilename = matches ? matches[1] : `mobile-cloudinary-${Date.now()}`;
      } catch (error) {
        mobileFilename = `mobile-cloudinary-${Date.now()}`;
      }
    } else if (mobileFile) {
      try {
        // Check if it's a real file or a placeholder for Cloudinary URL
        if (mobileFile.name.startsWith('cloudinary-url') && mobileFile.size === 0) {
          // This is a placeholder file, but we don't have a mobileCloudinaryUrl
          // Skip mobile file in this case rather than failing
        } else {
          const upload = await uploadFile(mobileFile, `${section}/mobile`);
          mobileUrl = upload.url;
          mobileFilename = upload.filename;
        }
      } catch (error) {
        console.error('Error uploading mobile file:', error);
        // Continue without mobile image if it fails
      }
    }

    // Get the highest position for the section
    const maxPosition = await prisma.media.findFirst({
      where: { section },
      orderBy: { position: 'desc' },
      select: { position: true }
    });

    // Determine whether the upload is from Cloudinary
    const isFromCloudinary = cloudinaryUrl || formData.get('isFromCloudinary') === 'true';
    
    // Determine if we're dealing with an SVG file
    const isSvg = (desktopFile && (desktopFile.type === 'image/svg+xml' || desktopFile.name.endsWith('.svg'))) || 
                  (cloudinaryUrl && cloudinaryUrl.toLowerCase().includes('.svg'));

    const newMedia = await prisma.media.create({
      data: {
        name,
        url: desktopUrl,
        alt,
        type: isFromCloudinary ? 'cloudinary' : (isSvg ? 'svg' : (desktopFile?.type || 'image')),
        section,
        position: (maxPosition?.position || 0) + 1,
        isActive: true,
        metadata: {
          mobileUrl,
          filename: desktopFilename,
          mobileFilename,
          isCloudinary: isFromCloudinary,
          isSvg,
          isMobileCloudinary: !!mobileCloudinaryUrl,
          originalFilename: desktopFile?.name,
          originalMobileFilename: mobileFile?.name,
        },
      },
    });

    return NextResponse.json(newMedia, { status: 201 });
  } catch (error) {
    console.error('Error creating media:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

const updateSchema = z.object({
  name: z.string().optional(),
  alt: z.string().optional(),
  isActive: z.boolean().optional(),
});

// PUT /api/admin/media?id=... - Update media details
export const PUT = withMongoose(async (req) => {
  try {
    const session = await getSession();
    if (!hasWritePermission(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // Check if the request is formdata or JSON
    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      // Handle form data update with potential file uploads
      const formData = await req.formData();
      const name = formData.get('name') as string;
      const alt = formData.get('alt') as string;
      const isActiveStr = formData.get('isActive') as string;
      const isActive = isActiveStr === 'true';
      const file = formData.get('file') as File | null;
      const mobileFile = formData.get('mobileFile') as File | null;
      const cloudinaryUrl = formData.get('cloudinaryUrl') as string | null;
      const mobileCloudinaryUrl = formData.get('mobileCloudinaryUrl') as string | null;

      // Get current media item
      const currentMedia = await prisma.media.findUnique({
        where: { id },
        select: { 
          url: true, 
          section: true,
          metadata: true
        }
      });

      if (!currentMedia) {
        return NextResponse.json({ error: 'Media not found' }, { status: 404 });
      }

      // Prepare update data
      let updateData: Record<string, unknown> = {
        name,
        alt,
        isActive
      };

      // Handle file uploads or Cloudinary URLs
      if (cloudinaryUrl) {
        updateData.url = cloudinaryUrl;
        updateData.type = 'cloudinary';
        
        // Extract filename from cloudinary URL
        const urlParts = cloudinaryUrl.split('/');
        const filename = urlParts[urlParts.length - 1];
        
        // Update metadata
        updateData.metadata = {
          ...(typeof currentMedia.metadata === 'object' && currentMedia.metadata !== null ? currentMedia.metadata : {}),
          filename,
          isCloudinary: true,
          updatedAt: new Date().toISOString()
        };
      } else if (file) {
        const upload = await uploadFile(file, currentMedia.section);
        updateData.url = upload.url;
        
        // Update metadata
        updateData.metadata = {
          ...(typeof currentMedia.metadata === 'object' && currentMedia.metadata !== null ? currentMedia.metadata : {}),
          filename: upload.filename,
          originalFilename: file.name,
          updatedAt: new Date().toISOString()
        };
      }

      // Handle mobile image if present (for hero slides)
      if (mobileCloudinaryUrl) {
        // Extract filename from cloudinary URL
        const urlParts = mobileCloudinaryUrl.split('/');
        const mobileFilename = urlParts[urlParts.length - 1];
        
        // Update metadata with mobile URL
        updateData.metadata = {
          ...(updateData.metadata || currentMedia.metadata || {}),
          mobileUrl: mobileCloudinaryUrl,
          mobileFilename,
          isMobileCloudinary: true
        };
      } else if (mobileFile) {
        const mobileUpload = await uploadFile(mobileFile, `${currentMedia.section}/mobile`);
        
        // Update metadata with mobile URL
        updateData.metadata = {
          ...(updateData.metadata || currentMedia.metadata || {}),
          mobileUrl: mobileUpload.url,
          mobileFilename: mobileUpload.filename,
          originalMobileFilename: mobileFile.name
        };
      }

      const updatedMedia = await prisma.media.update({
        where: { id },
        data: updateData
      });

      return NextResponse.json(updatedMedia);
    } else {
      // Handle JSON update (no files)
      const body = await req.json();
      const validatedBody = updateSchema.parse(body);

      const updatedMedia = await prisma.media.update({
        where: { id },
        data: validatedBody,
      });

      return NextResponse.json(updatedMedia);
    }
  } catch (error) {
    console.error('Error updating media:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// DELETE /api/admin/media?id=... - Delete media
export const DELETE = withMongoose(async (req) => {
  try {
    const session = await getSession();
    if (!hasWritePermission(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // Make sure to import Media at the top
const mediaToDelete = await Media.findOne({ id } );
    if (!mediaToDelete) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }
    
    // Prevent deletion of logo items - only allow update
    if (mediaToDelete.section === 'logo') {
      return NextResponse.json({ error: 'Logo cannot be deleted. You can only update it.' }, { status: 403 });
    }

    // Delete physical files
    const { unlink } = await import('fs/promises');
    const { join } = await import('path');
    
    try {
      if (mediaToDelete.metadata && typeof mediaToDelete.metadata === 'object') {
        const metadata = mediaToDelete.metadata as any;
        if (metadata.filename) {
          const filePath = join(process.cwd(), 'public', 'uploads', mediaToDelete.section, metadata.filename);
          await unlink(filePath);
        }
        if (metadata.mobileFilename) {
          const mobileFilePath = join(process.cwd(), 'public', 'uploads', mediaToDelete.section, metadata.mobileFilename);
          await unlink(mobileFilePath);
        }
      }
    } catch (fileError) {
      console.warn('Error deleting files:', fileError);
    }

    await prisma.media.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting media:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}