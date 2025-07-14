import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/app/auth";
import { prisma } from "@/lib/prisma";
import { AuditLogger } from "@/lib/audit-logger";
import { OptimizedStockManager } from "@/lib/optimized-stock-manager";
import { OrderStatus } from "@prisma/client";

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
    
    // Use simplified status filtering (MongoDB-compatible)
    switch (status) {
      case 'active':
        // For MongoDB, use undefined instead of null
        where.deletedAt = undefined;
        where.isFakeOrder = false;
        break;
      case 'fake':
        where.deletedAt = undefined;
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
          where.deletedAt = undefined; // Only show non-deleted orders with specific status
        } else {
          where.deletedAt = undefined; // Default to non-deleted
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

    // Execute optimized parallel queries with reduced complexity
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
              email: true
            }
          },
          // Remove user relation to reduce query complexity
          // user: {
          //   select: {
          //     isFlagged: true
          //   }
          // },
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
            take: 3, // Reduced from 5 to 3 for better performance
            where: {
              productId: {
                not: undefined
              }
            }
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
        email: null
      },
      user: { isFlagged: false }, // Default since we removed user relation
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
      // For MongoDB, set to undefined to properly "unset" the field
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
        deletedAt: new Date(),
        isActive: false,      // Mark as inactive
        orderType: 'TRASH'    // Set order type to TRASH
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

// Optimized order creation
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

    // 🚀 ULTRA-OPTIMIZED ORDER CREATION FLOW
    // Single transaction with maximum performance optimizations
    const result = await prisma.$transaction(async (tx) => {
      // 1. Fast customer operations using optimized helper
      const customer = await OptimizedStockManager.getOrCreateCustomerFast({
        recipientName,
        recipientPhone,
        recipientEmail,
        deliveryAddress,
        recipientCity,
        recipientZone,
        userId
      }, tx);

      // 2. Generate fast order number (avoids DB lookup)
      const orderNumber = OptimizedStockManager.generateFastOrderNumber();

      // 3. Create order first (to get ID for stock reservation)
      const orderData = {
        orderNumber,
        customerId: customer.id,
        userId: userId || undefined,
        status: 'PENDING' as const,
        paymentStatus: 'PENDING' as const,
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
        isFakeOrder: false,
        isActive: true,
        orderType: 'NORMAL' as const,
      };

      // Create order with items in one operation
      const createdOrder = await tx.order.create({
        data: {
          ...orderData,
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

      // 4. Ultra-fast stock reservation with combined check and update
      await OptimizedStockManager.reserveStockForOrderFast(
        createdOrder.id,
        items.map((item: { productId: string; quantity: number; price: number }) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        })),
        tx
      );

      return createdOrder;
    }, {
      maxWait: 5000,  // Reduced wait time for faster response
      timeout: 20000, // Reduced timeout for faster failure detection
    });

    // 5. Fire-and-forget audit logging (completely non-blocking)
    if (userId) {
      // Use setImmediate to ensure it runs after response is sent
      setImmediate(() => {
        AuditLogger.log({
          model: 'Order',
          recordId: result.id,
          userId: userId,
          action: 'CREATE',
          details: {
            orderNumber: result.orderNumber,
            customerName: result.customer.name,
            customerPhone: result.customer.phone,
            total: result.total,
            createdBy: session?.user?.email || 'guest'
          }
        }).catch(auditError => {
          console.error('Audit logging failed (non-critical):', auditError);
        });
      });
    }

    console.log('Ultra-fast order created:', result.orderNumber);

    // Return optimized response with minimal data
    const response = NextResponse.json({
      success: true,
      order: {
        id: result.id,
        orderNumber: result.orderNumber,
        status: result.status,
        paymentStatus: result.paymentStatus,
        total: result.total,
        customer: {
          id: result.customer.id,
          name: result.customer.name,
          phone: result.customer.phone
        },
        itemCount: result.items.length,
        createdAt: result.createdAt
      }
    });

    // Aggressive no-cache headers for real-time updates
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;

  } catch (error) {
    console.error('Ultra-fast order creation error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { error: `Failed to create order: ${errorMessage}` },
      { status: 500 }
    );
  }
}
