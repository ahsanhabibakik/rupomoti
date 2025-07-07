import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { productIds, action } = body

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json({ error: 'Product IDs are required' }, { status: 400 })
    }

    if (action === 'soft-delete') {
      // Soft delete - move to trash
      await prisma.product.updateMany({
        where: {
          id: { in: productIds },
          deletedAt: null
        },
        data: {
          deletedAt: new Date()
        }
      })
    } else if (action === 'permanent-delete') {
      // Permanent delete
      await prisma.product.deleteMany({
        where: {
          id: { in: productIds },
          deletedAt: { not: null }
        }
      })
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json({ 
      message: `${productIds.length} products ${action === 'soft-delete' ? 'moved to trash' : 'permanently deleted'} successfully` 
    })

  } catch (error) {
    console.error('Bulk delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete products' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { productIds, action } = body

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json({ error: 'Product IDs are required' }, { status: 400 })
    }

    if (action === 'restore') {
      // Restore from trash
      await prisma.product.updateMany({
        where: {
          id: { in: productIds },
          deletedAt: { not: null }
        },
        data: {
          deletedAt: null
        }
      })
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json({ 
      message: `${productIds.length} products restored successfully` 
    })

  } catch (error) {
    console.error('Bulk restore error:', error)
    return NextResponse.json(
      { error: 'Failed to restore products' },
      { status: 500 }
    )
  }
}
