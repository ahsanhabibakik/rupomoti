import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        customer: true,
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const json = await request.json()
    const { id, ...data } = json

    const order = await prisma.order.update({
      where: { id },
      data: {
        status: data.status
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true
          }
        }
      }
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    await prisma.order.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting order:', error)
    return NextResponse.json(
      { error: 'Failed to delete order' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const { items, user } = await req.json()
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No items in order' }, { status: 400 })
    }
    const order = await prisma.order.create({
      data: {
        userEmail: user?.email || null,
        userMobile: user?.mobile || null,
        items: {
          create: items.map((item: any) => ({
            productId: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          })),
        },
      },
      include: { items: true },
    })
    return NextResponse.json(order)
  } catch (error) {
    return NextResponse.json({ error: 'Error creating order' }, { status: 500 })
  }
} 