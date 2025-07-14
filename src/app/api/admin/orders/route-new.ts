export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/lib/auth-node";
import dbConnect from '@/lib/dbConnect';
import { generateUniqueOrderNumber } from "@/lib/server/order-number-generator";
import { StockManager } from "@/lib/stock-manager";
import { AuditLogger } from "@/lib/audit-logger";
// Define OrderStatus enum to replace Prisma import
enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}
// Define Decimal type to replace Prisma.Decimal
type Decimal = number;
// Import Mongoose models to replace Prisma models


// Force dynamic rendering to ensure fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Type for order where clause
type OrderWhereInput = Prisma.OrderWhereInput;

export async function GET(req: Request) {
  console.log('🚀 Optimized Admin Orders API - Starting request...');
  
  try {
    const session = await auth();
    
    // Check authentication
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check admin access
    const hasAdminAccess = session.user.isAdmin || 
                          ['ADMIN', 'MANAGER', 'SUPER_ADMIN'].includes(session.user.role);
    
    if (!hasAdminAccess) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim() || '';
    const status = searchParams.get('status') || 'active'; // active, fake, trashed, all
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const offset = (page - 1) * limit;
    
    console.log('📊 Query params:', { search, status, from, to, page, limit });

    // Build simplified where clause for better performance
    const where: OrderWhereInput = {};
    
    // Use simplified status filtering
    switch (status) {
      case 'active':
        where.deletedAt = null;
        where.isFakeOrder = false;
        break;
      case 'fake':
        where.deletedAt = null;
        where.isFakeOrder = true;
        break;
      case 'trashed':
        where.deletedAt = { not: null };
        break;
      case 'all':
        // No additional filter - show all orders
        break;
      default:
        // If it's an OrderStatus, filter by that
        if (Object.values(OrderStatus).includes(status as OrderStatus)) {
          where.status = status as OrderStatus;
          where.deletedAt = null; // Only show non-deleted orders with specific status
        } else {
          where.deletedAt = null; // Default to non-deleted
          where.isFakeOrder = false;
        }
    }
    
    // Add search conditions (simplified)
    if (search) {
      const searchNumber = search.replace(/\D/g, ''); // Extract numbers for phone search
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { recipientName: { contains: search, mode: 'insensitive' } },
        ...(searchNumber ? [{ recipientPhone: { contains: searchNumber } }] : []),
        { customer: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }
    
    // Add date range
    if (from && to) {
      where.createdAt = {
        gte: new Date(from),
        lte: new Date(to)
      };
    }
    
    console.log('🔍 Final where clause:', JSON.stringify(where, null, 2));

    // Execute optimized parallel queries
    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
        select: {
          id: true,
          orderNumber: true,
          status: true,
          paymentStatus: true,
          paymentMethod: true,
          total: true,
          deliveryAddress: true,
          recipientName: true,
          recipientPhone: true,
          recipientEmail: true,
          courierName: true,
          courierTrackingCode: true,
          isFakeOrder: true,
          deletedAt: true,
          createdAt: true,
          updatedAt: true,
          customer: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true,
              address: true
            }
          },
          user: {
            select: {
              isFlagged: true
            }
          },
          items: {
            select: {
              id: true,
              quantity: true,
              price: true,
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  sku: true
                }
              }
            },
            take: 5 // Limit items for performance
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.order.count({ where })
    ]);

    console.log('📦 Orders fetched:', {
      count: orders.length,
      totalCount,
      firstOrder: orders[0] ? {
        orderNumber: orders[0].orderNumber,
        deletedAt: orders[0].deletedAt,
        isFakeOrder: orders[0].isFakeOrder
      } : null
    });

    // Minimal data processing
    const sanitizedOrders = orders.map(order => ({
      ...order,
      customer: order.customer || {
        id: 'unknown',
        name: 'Unknown Customer',
        phone: 'N/A',
        email: null,
        address: null
      },
      user: order.user || { isFlagged: false },
      items: order.items || [],
      shippingAddress: order.deliveryAddress || 'N/A'
    }));

    const responseData = {
      orders: sanitizedOrders,
      totalOrders: totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      limit
    };

    console.log('📤 Response:', {
      ordersCount: responseData.orders.length,
      totalOrders: responseData.totalOrders,
      totalPages: responseData.totalPages,
      status,
      page
    });

    // Create response with no-cache headers
    const response = NextResponse.json(responseData);
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;

  } catch (error) {
    console.error('❌ Admin Orders API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Optimized order update endpoint
export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, status, isFakeOrder, restore } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
    }

    // Build update data
    const updateData: Prisma.OrderUpdateInput = { 
      updatedAt: new Date() 
    };
    
    if (status !== undefined) {
      updateData.status = status;
    }
    
    if (isFakeOrder !== undefined) {
      updateData.isFakeOrder = isFakeOrder;
    }
    
    if (restore === true) {
      updateData.deletedAt = null;
      updateData.isFakeOrder = false;
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        customer: true,
        items: {
          include: { product: true }
        }
      }
    });

    return NextResponse.json({ success: true, order: updatedOrder });

  } catch (error) {
    console.error('❌ Order update error:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

// Optimized order deletion (soft delete)
export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
    }

    await prisma.order.update({
      where: { id },
      data: {
        deletedAt: new Date()
      }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('❌ Order deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete order' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
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
