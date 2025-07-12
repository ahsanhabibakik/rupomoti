import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/auth';



export async function GET(req: Request) {
  try {
    await connectDB();
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.isAdmin && session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔍 Database Debug - Starting diagnostic...')

    // Test database connection
    const dbTest = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Database connection:', dbTest)

    // Count total orders
    const totalOrders = await prisma.order.count()
    console.log('📊 Total orders in database:', totalOrders)

    // Count by status - using simplified approach for MongoDB compatibility
    const nonDeletedOrders = await prisma.order.count({
      where: {
        deletedAt: null
      }
    })

    const deletedOrders = await prisma.order.count({
      where: {
        deletedAt: { not: null }
      }
    })

    // Get all non-deleted orders and filter fake ones manually
    const allNonDeleted = await prisma.order.findMany({
      where: {
        deletedAt: null
      },
      select: {
        id: true,
        isFakeOrder: true
      }
    })

    const activeOrders = allNonDeleted.filter(order => !order.isFakeOrder).length
    const fakeOrders = allNonDeleted.filter(order => order.isFakeOrder).length

    // Get recent orders with more details
    const recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        orderNumber: true,
        createdAt: true,
        status: true,
        deletedAt: true,
        isFakeOrder: true,
        customer: {
          select: {
            name: true,
            phone: true
          }
        }
      }
    })

    // Test specific query that admin page uses
    const activeOrdersTest = await prisma.order.findMany({
      where: {
        deletedAt: null
      },
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        orderNumber: true,
        isFakeOrder: true,
        createdAt: true
      }
    })

    // Test boolean field values
    const booleanFieldTest = await prisma.order.groupBy({
      by: ['isFakeOrder'],
      _count: {
        _all: true
      },
      where: {
        deletedAt: null
      }
    })

    // Test audit logs
    const auditLogCount = await prisma.auditLog.count()
    console.log('📋 Total audit logs:', auditLogCount)

    const diagnostics = {
      database: {
        connected: true,
        test: dbTest
      },
      orders: {
        total: totalOrders,
        nonDeleted: nonDeletedOrders,
        active: activeOrders,
        deleted: deletedOrders,
        fake: fakeOrders,
        recent: recentOrders,
        activeOrdersTest: activeOrdersTest,
        booleanFieldTest: booleanFieldTest
      },
      auditLogs: {
        total: auditLogCount
      },
      session: {
        userId: session.user.id,
        isAdmin: session.user.isAdmin,
        role: session.user.role
      }
    }

    console.log('🔍 Database Diagnostics Complete:', diagnostics)

    return NextResponse.json(diagnostics)
  } catch (error) {
    console.error('❌ Database Debug Error:', error)
    return NextResponse.json({ 
      error: 'Database diagnostic failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
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