import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

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
    const {
      orderNumber,
      recipientName,
      recipientPhone,
      recipientEmail,
      recipientCity,
      recipientZone,
      recipientArea,
      items,
      subtotal,
      deliveryFee,
      total,
      deliveryZone,
      deliveryAddress,
      orderNote,
      paymentMethod,
      userId
    } = await req.json()

    // Validate required fields
    if (!orderNumber || !recipientName || !recipientPhone || !recipientCity || !recipientZone || !recipientArea || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ 
        error: 'Missing required fields: orderNumber, recipientName, recipientPhone, recipientCity, recipientZone, recipientArea, or items' 
      }, { status: 400 })
    }

    if (!deliveryZone || !deliveryAddress) {
      return NextResponse.json({ 
        error: 'Delivery zone and address are required' 
      }, { status: 400 })
    }

    try {
      // Create or find customer by phone
      let customerRecord = await prisma.customer.findUnique({
        where: { phone: recipientPhone }
      })

      if (!customerRecord) {
        customerRecord = await prisma.customer.create({
          data: {
            name: recipientName,
            phone: recipientPhone,
            email: recipientEmail,
            address: deliveryAddress,
            city: recipientCity,
            zone: recipientZone,
            userId: userId || undefined
          }
        })
      } else {
        // Update existing customer with latest info
        customerRecord = await prisma.customer.update({
          where: { id: customerRecord.id },
          data: {
            name: recipientName,
            email: recipientEmail,
            address: deliveryAddress,
            city: recipientCity,
            zone: recipientZone,
            userId: userId || customerRecord.userId
          }
        })
      }

      // Create the order
      const order = await prisma.order.create({
        data: {
          orderNumber,
          customerId: customerRecord.id,
          userId: userId || undefined,
          status: 'PENDING',
          paymentStatus: 'PENDING',
          paymentMethod: paymentMethod || 'CASH_ON_DELIVERY',
          subtotal,
          deliveryFee,
          discount: 0,
          total,
          deliveryZone,
          deliveryAddress,
          orderNote: orderNote || undefined,
          recipientName,
          recipientPhone,
          recipientEmail,
          recipientCity,
          recipientZone,
          recipientArea,
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              image: item.image,
            })),
          },
        },
        include: { 
          customer: true,
          items: {
            include: {
              product: true
            }
          }
        },
      })

      console.log('Order created successfully:', order.orderNumber)

      return NextResponse.json({
        success: true,
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          total: order.total,
          customer: {
            name: order.customer.name,
            phone: order.customer.phone,
            email: order.customer.email
          },
          createdAt: order.createdAt
        }
      })
    } catch (dbError: any) {
      console.error('Database error:', dbError)
      if (dbError.code === 'P2002') {
        return NextResponse.json({ 
          error: 'Order number already exists. Please try again.' 
        }, { status: 400 })
      }
      throw dbError
    }
  } catch (error: any) {
    console.error('Error creating order:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to create order' 
    }, { status: 500 })
  }
} 