import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/auth';


import { generateUniqueOrderNumber } from '@/lib/server/order-number-generator'
import { StockManager } from '@/lib/stock-manager'
import { AuditLogger } from '@/lib/audit-logger'

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

    const response = NextResponse.json(orders)
    
    // Add no-cache headers for real-time updates
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    return response
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

export async function PUT(req: Request) {
  try {
    await connectDB();
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

export async function DELETE(req: Request) {
  try {
    await connectDB();
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
    await connectDB();
    const session = await getServerSession(authOptions);
    const body = await req.json();
    
    console.log('Order API - Received data:', JSON.stringify(body, null, 2));
    
    const {
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
        // 1. Check stock availability using StockManager
        const stockCheck = await StockManager.checkStockAvailability(
          items.map((item: { productId: string; quantity: number }) => ({
            productId: item.productId,
            quantity: item.quantity
          }))
        );

        if (!stockCheck.allAvailable) {
          const unavailableItems = stockCheck.checks
            .filter(check => !check.available)
            .map(check => `${check.productName || check.productId}: ${check.reason}`)
            .join(', ');
          throw new Error(`Stock not available: ${unavailableItems}`);
        }
        
        // 2. Generate unique order number
        const newOrderNumber = await generateUniqueOrderNumber();
        
        // 3. Create the order
        const createdOrder = await tx.order.create({
          data: {
            orderNumber: newOrderNumber,
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
            isFakeOrder: false, // Explicitly set as false for new orders
            items: {
              create: items.map((item: { productId: string; quantity: number; price: number }) => ({
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

        // 4. Reserve stock using StockManager
        try {
          await StockManager.reserveStockForOrder(
            createdOrder.id,
            items.map((item: { productId: string; quantity: number }) => ({
              productId: item.productId,
              quantity: item.quantity
            }))
          );
        } catch (stockError) {
          throw new Error(`Failed to reserve stock: ${stockError instanceof Error ? stockError.message : 'Unknown error'}`);
        }

        return createdOrder;
      });

      // 5. Log order creation to audit log
      if (userId) {
        try {
          await AuditLogger.log({
            model: 'Order',
            recordId: order.id,
            userId: userId,
            action: 'CREATE',
            details: {
              orderNumber: order.orderNumber,
              customerName: order.customer.name,
              customerPhone: order.customer.phone,
              total: order.total,
              createdBy: session?.user?.email || 'guest'
            }
          });
        } catch (auditError) {
          console.error('Failed to log order creation:', auditError);
          // Don't fail the order creation if audit logging fails
        }
      }

      console.log('Order created successfully:', order.orderNumber);

      // Return response with no-cache headers for real-time updates
      const response = NextResponse.json({
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

      // Add aggressive no-cache headers to ensure admin dashboard gets fresh data
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');
      response.headers.set('Surrogate-Control', 'no-store');
      response.headers.set('Vary', '*');

      return response;
    } catch (error) {
      console.error('Order creation failed:', error);
    
      if (error instanceof Error && error.message.includes('Stock not available')) {
        return NextResponse.json({ error: error.message }, { status: 409 }); // 409 Conflict
      }
    
      return NextResponse.json({ error: 'An unexpected error occurred while processing your order.' }, { status: 500 });
    }
  } catch (error) {
    console.error('Failed to create order:', error);
    
    // Provide more specific error messages
    if (error instanceof Error && error.message) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Check if it's a Prisma validation error
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ error: 'Duplicate order number. Please try again.' }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Failed to create order. Please try again.' }, { status: 500 });
  }
}