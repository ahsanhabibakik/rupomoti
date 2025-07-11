import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { InventoryManager } from '@/lib/inventory'

export const POST = withMongoose(async (req) => {
  try {
    const session = await auth()
    
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { productIds } = body

    if (!productIds || !Array.isArray(productIds)) {
      return NextResponse.json(
        { error: 'Product IDs array is required' },
        { status: 400 }
      )
    }

    const stockData = await InventoryManager.getRealTimeStock(productIds)

    return NextResponse.json({
      success: true,
      stocks: stockData
    })
  } catch (error) {
    console.error('Failed to fetch real-time stock:', error)
    return NextResponse.json(
      { error: 'Failed to fetch real-time stock' },
      { status: 500 }
    )
  }
}
