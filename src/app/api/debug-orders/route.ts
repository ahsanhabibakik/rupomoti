import { NextResponse } from 'next/server'
import { auth } from '@/app/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('🧪 Debug Orders API called')
    
    const session = await auth()
    
    console.log('Session data:', {
      hasSession: !!session,
      userId: session?.user?.id,
      email: session?.user?.email,
      isAdmin: session?.user?.isAdmin,
      role: session?.user?.role,
    })
    
    // For debugging, let's allow any authenticated user
    if (!session?.user?.id) {
      return NextResponse.json({ 
        error: 'Not authenticated',
        hasSession: false 
      }, { status: 401 })
    }
    
    // Get orders without filters first
    const totalOrders = await prisma.order.count()
    console.log('Total orders in DB:', totalOrders)
    
    const activeOrders = await prisma.order.count({ 
      where: { deletedAt: null } 
    })
    console.log('Active orders in DB:', activeOrders)
    
    // Get some orders with full data like the real endpoint
    const orders = await prisma.order.findMany({
      where: { deletedAt: null },
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: true,
        user: {
          select: {
            isFlagged: true
          }
        },
        items: {
          include: {
            product: true,
          },
        },
      }
    })
    
    console.log('Orders fetched:', orders.length)
    
    // Filter fake orders manually
    const realOrders = orders.filter(order => !order.isFakeOrder)
    console.log('Real orders after filter:', realOrders.length)
    
    return NextResponse.json({
      success: true,
      debug: {
        session: {
          userId: session.user.id,
          email: session.user.email,
          isAdmin: session.user.isAdmin,
          role: session.user.role,
        },
        database: {
          totalOrders,
          activeOrders,
          fetchedOrders: orders.length,
          realOrders: realOrders.length
        }
      },
      orders: realOrders,
      totalOrders: realOrders.length,
      totalPages: Math.ceil(realOrders.length / 10)
    })
    
  } catch (error) {
    console.error('Debug orders API error:', error)
    return NextResponse.json({ 
      error: 'Internal error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
