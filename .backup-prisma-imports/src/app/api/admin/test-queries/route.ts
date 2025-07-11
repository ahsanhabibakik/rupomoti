import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/auth'
import { withMongoose, parseQueryParams, getPaginationParams } from '@/lib/mongoose-utils';


export const GET = withMongoose(async (req) => {
  try {
    const session = await auth()
    
    if (!session?.user?.isAdmin && session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔧 Testing exact admin orders query...')

    // Test the exact query that the admin page uses
    const testQueries = []

    // 1. Test basic query without any filters
    try {
      const basicOrders = await prisma.order.findMany({
        where: {
          deletedAt: null
        },
        take: 5,
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

      testQueries.push({
        name: 'Basic Orders Query',
        success: true,
        count: basicOrders.length,
        firstOrder: basicOrders[0] ? {
          id: basicOrders[0].id,
          orderNumber: basicOrders[0].orderNumber,
          createdAt: basicOrders[0].createdAt,
          isFakeOrder: basicOrders[0].isFakeOrder,
          customer: basicOrders[0].customer?.name
        } : null
      })
    } catch (error) {
      testQueries.push({
        name: 'Basic Orders Query',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    // 2. Test with active filter (the corrected one)
    try {
      const activeOrders = await prisma.order.findMany({
        where: {
          deletedAt: null,
          isFakeOrder: false // Explicitly match false for MongoDB
        },
        take: 5,
        orderBy: { createdAt: 'desc' }
      })

      testQueries.push({
        name: 'Active Orders Query (with isFakeOrder: false)',
        success: true,
        count: activeOrders.length
      })
    } catch (error) {
      testQueries.push({
        name: 'Active Orders Query (with isFakeOrder: false)',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    // 3. Test post-filtering approach
    try {
      const allOrders = await prisma.order.findMany({
        where: {
          deletedAt: null
        },
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          orderNumber: true,
          isFakeOrder: true,
          createdAt: true
        }
      })

      const filteredOrders = allOrders.filter(order => !order.isFakeOrder)

      testQueries.push({
        name: 'Post-Filter Approach',
        success: true,
        totalCount: allOrders.length,
        filteredCount: filteredOrders.length,
        fakeOrdersFound: allOrders.filter(order => order.isFakeOrder).length
      })
    } catch (error) {
      testQueries.push({
        name: 'Post-Filter Approach',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    // 4. Test audit logs query
    try {
      const auditLogs = await prisma.auditLog.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      })

      testQueries.push({
        name: 'Audit Logs Query',
        success: true,
        count: auditLogs.length,
        sample: auditLogs[0] || null
      })
    } catch (error) {
      testQueries.push({
        name: 'Audit Logs Query',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      testQueries,
      recommendations: [
        'If Basic Orders Query works but Active Orders Query fails, use post-filtering approach',
        'If all queries work but admin page shows no data, check frontend data processing',
        'If Audit Logs Query shows 0 results, run seed-audit-logs script'
      ]
    })

  } catch (error) {
    console.error('❌ Test Query Error:', error)
    return NextResponse.json({ 
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
