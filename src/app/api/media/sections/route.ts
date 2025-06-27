import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

// GET - Fetch all media sections
export async function GET() {
  try {
    const session = await getServerSession(authConfig)
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sections = await prisma.mediaSection.findMany({
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(sections)
  } catch (error) {
    console.error('Error fetching media sections:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new media section
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, title, description, maxItems, settings } = body

    if (!name || !title) {
      return NextResponse.json({ error: 'Name and title are required' }, { status: 400 })
    }

    const section = await prisma.mediaSection.create({
      data: {
        name,
        title,
        description,
        maxItems: maxItems || 5,
        settings: settings || {}
      }
    })

    return NextResponse.json(section)
  } catch (error) {
    console.error('Error creating media section:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update media section
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, title, description, maxItems, isActive, settings } = body

    if (!id) {
      return NextResponse.json({ error: 'Section ID is required' }, { status: 400 })
    }

    const section = await prisma.mediaSection.update({
      where: { id },
      data: {
        title: title || undefined,
        description: description || undefined,
        maxItems: maxItems !== undefined ? maxItems : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
        settings: settings || undefined
      }
    })

    return NextResponse.json(section)
  } catch (error) {
    console.error('Error updating media section:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 