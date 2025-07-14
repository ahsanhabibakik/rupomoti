import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { InventoryManager } from '@/lib/inventory'

// GET /api/inventory/alerts - Get inventory alerts
export async function GET(req: Request) {
  try {
    await connectDB();
    const session = await auth()
    
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const threshold = parseInt(searchParams.get('threshold') || '10')

    const alerts = await InventoryManager.getInventoryAlerts(threshold)

    return NextResponse.json({
      success: true,
      alerts,
      total: alerts.length
    })
  } catch (error) {
    console.error('Inventory alerts error:', error)
    return NextResponse.json({ error: 'Failed to fetch inventory alerts', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
// POST /api/inventory/alerts - Update stock for a product
export async function POST(req: Request) {
  try {
    await connectDB();
    const session = await auth()
    
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { productId, changeAmount, operation, reason } = body

    if (!productId || !changeAmount || !operation || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const result = await InventoryManager.updateStock({
      productId,
      changeAmount: parseInt(changeAmount),
      operation,
      reason,
      userId: session.user.id
    })

    return NextResponse.json({
      success: true,
      ...result
    })
  } catch (error) {
    console.error('Failed to update stock:', error)
    return NextResponse.json(
      { error: 'Failed to update stock' },
      { status: 500 }
    )
  }
}
