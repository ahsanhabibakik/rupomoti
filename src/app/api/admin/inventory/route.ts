import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/auth';
import { InventoryManager } from '@/lib/inventory'

export async function POST(req: Request) {
  try {
    await connectDB();
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, ...params } = body

    switch (action) {
      case 'update':
        const result = await InventoryManager.updateStock({
          ...params,
          userId: session.user.id
        })
        return NextResponse.json(result)

      case 'reserve':
        const reservations = await InventoryManager.reserveStock(
          params.orderItems,
          params.orderId
        )
        return NextResponse.json(reservations)

      case 'release':
        const releases = await InventoryManager.releaseStock(
          params.orderItems,
          params.orderId
        )
        return NextResponse.json(releases)

      case 'bulk-update':
        const bulkResults = await InventoryManager.bulkStockUpdate(
          params.updates.map((update: Record<string, unknown>) => ({
            ...update,
            userId: session.user.id
          }))
        )
        return NextResponse.json(bulkResults)

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Inventory API error:', error)
    return NextResponse.json(
      { error: 'Failed to process inventory request' },
      { status: 500 }
    )
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
}export async function GET(req: Request) {
  try {
    await connectDB();
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const productId = searchParams.get('productId')
    const threshold = searchParams.get('threshold')
    const productIds = searchParams.get('productIds')

    switch (action) {
      case 'history':
        if (!productId) {
          return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
        }
        const history = await InventoryManager.getStockHistory(productId)
        return NextResponse.json(history)

      case 'alerts':
        const alerts = await InventoryManager.getInventoryAlerts(
          threshold ? parseInt(threshold) : undefined
        )
        return NextResponse.json(alerts)

      case 'real-time':
        if (!productIds) {
          return NextResponse.json({ error: 'Product IDs required' }, { status: 400 })
        }
        const stockData = await InventoryManager.getRealTimeStock(
          productIds.split(',')
        )
        return NextResponse.json(stockData)

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Inventory API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch inventory data' },
      { status: 500 }
    )
  }
}
