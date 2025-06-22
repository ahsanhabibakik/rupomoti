import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const providers = await prisma.shippingProvider.findMany()
    return NextResponse.json({ providers })
  } catch (error) {
    console.error('Error fetching shipping providers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch shipping providers' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { action, orderId, shippingProviderCode } = await request.json()

    switch (action) {
      case 'assign_shipping_provider': {
        const order = await prisma.order.update({
          where: { id: orderId },
          data: {
            shippingProvider: {
              connect: { code: shippingProviderCode }
            }
          },
          include: {
            shippingProvider: true
          }
        })

        return NextResponse.json({ order })
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error in shipping provider action:', error)
    return NextResponse.json(
      { error: 'Failed to process shipping provider action' },
      { status: 500 }
    )
  }
}
