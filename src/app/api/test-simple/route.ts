import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/auth';
import { connectDB } from '@/lib/db';


export async function GET() {
  try {
    console.log('🧪 Simple Test API called')
    
    const session = await getServerSession(authOptions)
    
    console.log('Session data:', {
      hasSession: !!session,
      userId: session?.user?.id,
      email: session?.user?.email,
      isAdmin: session?.user?.isAdmin,
      role: session?.user?.role,
    })
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        error: 'No session',
        hasSession: false 
      }, { status: 401 })
    }
    
    // Get total orders without any filters
    const totalOrders = await prisma.order.count()
    const activeOrders = await prisma.order.count({ where: { deletedAt: null } })
    
    // Get first 3 orders
    const orders = await prisma.order.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        deletedAt: true,
        isFakeOrder: true,
        createdAt: true
      }
    })
    
    return NextResponse.json({
      success: true,
      session: {
        userId: session.user.id,
        email: session.user.email,
        isAdmin: session.user.isAdmin,
        role: session.user.role,
      },
      database: {
        totalOrders,
        activeOrders,
        sampleOrders: orders
      }
    })
    
  } catch (error) {
    console.error('Simple test API error:', error)
    return NextResponse.json({ 
      error: 'Internal error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
