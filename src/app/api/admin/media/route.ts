import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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
export async function GET(req: NextRequest) {
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
export async function POST(req: NextRequest) {
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

    if (cloudinaryUrl) {
      // Use the provided Cloudinary URL
      desktopUrl = cloudinaryUrl;
      // For Cloudinary URLs, extract the public ID as filename
      const urlParts = cloudinaryUrl.split('/');
      desktopFilename = urlParts[urlParts.length - 1];
    } else if (desktopFile) {
      // Upload the file to local storage
      const upload = await uploadFile(desktopFile, section);
      desktopUrl = upload.url;
      desktopFilename = upload.filename;
    } else {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    if (mobileCloudinaryUrl) {
      mobileUrl = mobileCloudinaryUrl;
      const urlParts = mobileCloudinaryUrl.split('/');
      mobileFilename = urlParts[urlParts.length - 1];
    } else if (mobileFile) {
      const upload = await uploadFile(mobileFile, section);
      mobileUrl = upload.url;
      mobileFilename = upload.filename;
    }

    // Get the highest position for the section
    const maxPosition = await prisma.media.findFirst({
      where: { section },
      orderBy: { position: 'desc' },
      select: { position: true }
    });

    const newMedia = await prisma.media.create({
      data: {
        name,
        url: desktopUrl,
        alt,
        type: cloudinaryUrl ? 'cloudinary' : (desktopFile?.type || 'image'),
        section,
        position: (maxPosition?.position || 0) + 1,
        isActive: true,
        metadata: {
          mobileUrl,
          filename: desktopFilename,
          mobileFilename,
          isCloudinary: !!cloudinaryUrl,
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
export async function PUT(req: NextRequest) {
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
      let updateData: any = {
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
          ...(currentMedia.metadata || {}),
          filename,
          isCloudinary: true,
          updatedAt: new Date().toISOString()
        };
      } else if (file) {
        const upload = await uploadFile(file, currentMedia.section);
        updateData.url = upload.url;
        
        // Update metadata
        updateData.metadata = {
          ...(currentMedia.metadata || {}),
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
export async function DELETE(req: NextRequest) {
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

    const mediaToDelete = await prisma.media.findUnique({ where: { id } });
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