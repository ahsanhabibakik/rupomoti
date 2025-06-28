import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/app/auth"
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
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const {
      orderNumber,
      recipientName,
      recipientPhone,
      recipientEmail,
      recipientCity,
      recipientZone,
      recipientArea,
      deliveryAddress,
      orderNote,
      items,
      subtotal,
      deliveryFee,
      total,
      deliveryZone,
      paymentMethod,
      userId: payloadUserId
    } = body;

    // Use session userId if not provided
    const userId = payloadUserId || session?.user?.id || undefined;

    // Validate required fields
    if (!orderNumber) {
      return NextResponse.json({ error: 'Missing required field: orderNumber' }, { status: 400 });
    }
    if (!recipientName) {
      return NextResponse.json({ error: 'Missing required field: recipientName' }, { status: 400 });
    }
    if (!recipientPhone) {
      return NextResponse.json({ error: 'Missing required field: recipientPhone' }, { status: 400 });
    }
    if (!deliveryAddress) {
      return NextResponse.json({ error: 'Missing required field: deliveryAddress' }, { status: 400 });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Missing or empty items array' }, { status: 400 });
    }
    if (!deliveryZone) {
      return NextResponse.json({ error: 'Missing required field: deliveryZone' }, { status: 400 });
    }
    if (subtotal === undefined || subtotal === null) {
      return NextResponse.json({ error: 'Missing required field: subtotal' }, { status: 400 });
    }
    if (deliveryFee === undefined || deliveryFee === null) {
      return NextResponse.json({ error: 'Missing required field: deliveryFee' }, { status: 400 });
    }
    if (total === undefined || total === null) {
      return NextResponse.json({ error: 'Missing required field: total' }, { status: 400 });
    }
    if (!paymentMethod) {
      return NextResponse.json({ error: 'Missing required field: paymentMethod' }, { status: 400 });
    }

    // Optional: recipientCity, recipientZone, recipientArea, recipientEmail, orderNote
    // Defensive: fallback to empty string if not provided
    try {
      // Create or find customer by phone
      let customerRecord = await prisma.customer.findUnique({
        where: { phone: recipientPhone }
      });

      if (!customerRecord) {
        customerRecord = await prisma.customer.create({
          data: {
            name: recipientName,
            phone: recipientPhone,
            email: recipientEmail || '',
            address: deliveryAddress,
            city: recipientCity || '',
            zone: recipientZone || '',
            userId: userId || undefined
          }
        });
      } else {
        // Update existing customer with latest info
        customerRecord = await prisma.customer.update({
          where: { id: customerRecord.id },
          data: {
            name: recipientName,
            email: recipientEmail || '',
            address: deliveryAddress,
            city: recipientCity || '',
            zone: recipientZone || '',
            userId: userId || customerRecord.userId
          }
        });
      }

      // Use a transaction to ensure atomicity
      const order = await prisma.$transaction(async (tx) => {
        // 1. Check stock and create a list of updates
        for (const item of items) {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
          });

          if (!product || product.stock < item.quantity) {
            throw new Error(`Insufficient stock for product: ${product?.name || item.productId}`);
          }
        }
        
        // 2. Create the order
        const createdOrder = await tx.order.create({
          data: {
            orderNumber,
            customerId: customerRecord.id,
            userId: userId || undefined,
            status: 'PENDING',
            paymentStatus: 'PENDING',
            paymentMethod: paymentMethod || 'CASH_ON_DELIVERY',
            subtotal: subtotal || 0,
            deliveryFee: deliveryFee || 0,
            discount: 0,
            total: total || 0,
            deliveryZone,
            deliveryAddress,
            orderNote: orderNote || undefined,
            recipientName,
            recipientPhone,
            recipientEmail: recipientEmail || '',
            recipientCity: recipientCity || '',
            recipientZone: recipientZone || '',
            recipientArea: recipientArea || '',
            items: {
              create: items.map((item: any) => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
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
        });

        // 3. Update stock for each item
        for (const item of items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        }

        return createdOrder;
      });

      console.log('Order created successfully:', order.orderNumber);

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
      });
    } catch (error: any) {
      console.error('Order creation failed:', error);
    
      if (error instanceof Error && error.message.includes('Insufficient stock')) {
        return NextResponse.json({ error: error.message }, { status: 409 }); // 409 Conflict
      }
    
      return NextResponse.json({ error: 'An unexpected error occurred while processing your order.' }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Failed to parse request body or handle session:', error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}