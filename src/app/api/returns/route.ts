import { NextRequest, NextResponse } from 'next/server'
const { auth } = await import('@/app/auth');
import { ReturnsManager } from '@/lib/returns'

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const body = await req.json()
    const { action, ...params } = body
    switch (action) {
      case 'create':
        const returnRequest = await ReturnsManager.createReturnRequest(params)
        return NextResponse.json(returnRequest)
      case 'approve':
        if (session.user.role !== 'ADMIN') {
          return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
        }
        const approvedReturn = await ReturnsManager.approveReturn(
          params.returnId,
          params.adminNotes
        )
        return NextResponse.json(approvedReturn)
      case 'process':
        if (session.user.role !== 'ADMIN') {
          return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
        }
        const processedReturn = await ReturnsManager.processReturn(
          params.returnId,
          params.actualCondition
        )
        return NextResponse.json(processedReturn)
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Returns API error:', error)
    return NextResponse.json(
      { error: 'Failed to process return request' },
      { status: 500 }
    )
  }
}
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { searchParams } = new URL(req.url)
    const action = searchParams.get('action')
    const orderId = searchParams.get('orderId')
    const status = searchParams.get('status')
    switch (action) {
      case 'order-returns':
        if (!orderId) {
          return NextResponse.json({ error: 'Order ID required' }, { status: 400 })
        }
        const orderReturns = await ReturnsManager.getOrderReturns(orderId)
        return NextResponse.json(orderReturns)
      case 'all':
        if (session.user.role !== 'ADMIN') {
          return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
        }
        const allReturns = await ReturnsManager.getAllReturns(status || undefined)
        return NextResponse.json(allReturns)
      case 'eligibility':
        if (!orderId) {
          return NextResponse.json({ error: 'Order ID required' }, { status: 400 })
        }
        const eligibility = await ReturnsManager.checkReturnEligibility(orderId)
        return NextResponse.json(eligibility)
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Returns API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch return data' },
      { status: 500 }
    )
  }
}
