import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// GET - Fetch all media or media by section
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const section = searchParams.get('section')
    const type = searchParams.get('type')

    let where: any = {}
    if (section) where.section = section
    if (type) where.type = type

    const media = await prisma.media.findMany({
      where,
      orderBy: [
        { section: 'asc' },
        { position: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json(media)
  } catch (error) {
    console.error('Error fetching media:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Upload new media
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const section = formData.get('section') as string
    const name = formData.get('name') as string
    const alt = formData.get('alt') as string
    const type = formData.get('type') as string || 'image'

    if (!file || !section || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: `rupomoti/${section}`,
          resource_type: 'auto',
          transformation: type === 'image' ? [
            { quality: 'auto:good' },
            { fetch_format: 'auto' }
          ] : undefined
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      ).end(buffer)
    }) as any

    // Get the highest position for this section
    const maxPosition = await prisma.media.aggregate({
      where: { section },
      _max: { position: true }
    })

    const newPosition = (maxPosition._max.position || 0) + 1

    // Save to database
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
          originalName: file.name
        }
      }
    })

    return NextResponse.json(media)
  } catch (error) {
    console.error('Error uploading media:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update media
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, name, alt, position, isActive } = body

    if (!id) {
      return NextResponse.json({ error: 'Media ID is required' }, { status: 400 })
    }

    const media = await prisma.media.update({
      where: { id },
      data: {
        name: name || undefined,
        alt: alt || undefined,
        position: position !== undefined ? position : undefined,
        isActive: isActive !== undefined ? isActive : undefined
      }
    })

    return NextResponse.json(media)
  } catch (error) {
    console.error('Error updating media:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete media
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Media ID is required' }, { status: 400 })
    }

    // Get media to delete from Cloudinary
    const media = await prisma.media.findUnique({
      where: { id }
    })

    if (!media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 })
    }

    // Delete from Cloudinary if cloudinaryId exists
    if (media.cloudinaryId) {
      try {
        await cloudinary.uploader.destroy(media.cloudinaryId)
      } catch (cloudinaryError) {
        console.error('Error deleting from Cloudinary:', cloudinaryError)
        // Continue with database deletion even if Cloudinary fails
      }
    }

    // Delete from database
    await prisma.media.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Media deleted successfully' })
  } catch (error) {
    console.error('Error deleting media:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 