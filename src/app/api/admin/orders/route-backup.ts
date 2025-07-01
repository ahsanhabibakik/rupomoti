import { NextResponse } from "next/server";
import { auth } from "@/app/auth";
import { prisma } from "@/lib/prisma";
import { generateUniqueOrderNumber } from "@/lib/server/order-number-generator";
import { StockManager } from "@/lib/stock-manager";
import { AuditLogger } from "@/lib/audit-logger";
import { OrderStatus, Prisma } from "@prisma/client";

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
      { error: 'Failed to fetch orders', details: error.message },
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
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const offset = (page - 1) * limit;

  console.log('📊 Admin Orders API - Query parameters:', {
    search, status, from, to, page, limit, offset
  });

  try {
    // Optimized approach - build efficient query
    console.log('🔄 Building optimized query...');
    
    interface WhereClause {
      deletedAt?: { not: null } | null;
      isFakeOrder?: boolean;
      OR?: Array<{
        orderNumber?: { contains: string; mode: 'insensitive' };
        customer?: { name?: { contains: string; mode: 'insensitive' } };
        recipientName?: { contains: string; mode: 'insensitive' };
        recipientPhone?: { contains: string; mode: 'insensitive' };
      }>;
      status?: OrderStatus;
      createdAt?: {
        gte?: Date;
        lte?: Date;
      };
    }
    
    let where: WhereClause = {};
    
    // Handle different status filters efficiently
    if (status === 'trashed') {
      where.deletedAt = { not: null };
      console.log('📋 Query: Getting trashed orders');
    } else if (status === 'fake') {
      where.deletedAt = null;
      where.isFakeOrder = true;
      console.log('📋 Query: Getting fake orders');
    } else if (status === 'active') {
      where.deletedAt = null;
      // For active orders, show all non-deleted orders that are not explicitly marked as fake
      // This handles cases where isFakeOrder might be null/undefined
      where.NOT = {
        isFakeOrder: true
      };
      console.log('📋 Query: Getting active (non-fake) orders');
    } else {
      // For 'all' status, show all non-deleted orders
      where.deletedAt = null;
      console.log('📋 Query: Getting all non-deleted orders');
    }

    // Handle search efficiently
    if (search) {
      console.log('🔍 Adding search filter:', search);
      const searchConditions = [
        { orderNumber: { contains: search, mode: 'insensitive' as const } },
        { customer: { name: { contains: search, mode: 'insensitive' as const } } },
        { recipientName: { contains: search, mode: 'insensitive' as const } },
        { recipientPhone: { contains: search, mode: 'insensitive' as const } },
      ];

      where = {
        ...where,
        OR: searchConditions
      };
    }
    
    // Handle specific order status
    if (status && status !== 'all' && status !== 'trashed' && status !== 'active' && status !== 'fake') {
      console.log('🏷️ Adding status filter:', status);
      where.status = status as OrderStatus;
    }

    // Handle date range
    if (from && to) {
      console.log('📅 Adding date range filter:', { from, to });
      where.createdAt = {
        gte: new Date(from),
        lte: new Date(to),
      };
    }

    console.log('🔍 Admin Orders API - Final where clause:', JSON.stringify(where, null, 2));

    // Optimized parallel queries for better performance
    const [orders, totalOrders] = await Promise.all([
      // Get orders with optimized includes - only essential fields for list view
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
              address: true,
              createdAt: true,
              updatedAt: true
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
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      // Get total count efficiently
      prisma.order.count({ where })
    ]);

    console.log('📦 Admin Orders API - Orders fetched:', {
      queryWhere: where,
      count: orders.length,
      totalCount: totalOrders,
      firstOrderId: orders[0]?.id,
      firstOrderNumber: orders[0]?.orderNumber,
      firstOrderCreated: orders[0]?.createdAt,
      firstOrderIsFake: orders[0]?.isFakeOrder,
    });

    // Sanitize orders data efficiently
    const sanitizedOrders = orders.map(order => ({
      ...order,
      customer: order.customer || {
        id: 'unknown',
        name: 'Unknown Customer',
        phone: 'N/A',
        email: null,
        address: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      user: order.user || { isFlagged: false },
      items: order.items || [],
      shippingAddress: order.deliveryAddress || 'N/A'
    }));

    console.log('🧼 Sanitized orders:', {
      originalCount: orders.length,
      sanitizedCount: sanitizedOrders.length,
      hasCustomerIssues: orders.filter(o => !o.customer).length,
      hasItemsIssues: orders.filter(o => !o.items || o.items.length === 0).length,
    });

    const responseData = {
      orders: sanitizedOrders,
      totalOrders,
      totalPages: Math.ceil(totalOrders / limit),
    };

    console.log('📤 Sending response:', {
      ordersCount: responseData.orders.length,
      totalOrders: responseData.totalOrders,
      totalPages: responseData.totalPages,
      status,
      page,
      limit
    });

    // Create response with aggressive no-cache headers for real-time updates
    const response = NextResponse.json(responseData);
    
    // Add comprehensive no-cache headers to ensure real-time data
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');
    response.headers.set('CDN-Cache-Control', 'no-store');
    response.headers.set('Vercel-CDN-Cache-Control', 'no-store');
    response.headers.set('Vary', '*');
    response.headers.set('Last-Modified', new Date().toUTCString());
    
    return response;
  } catch (error) {
    console.error('❌ Admin Orders API Error:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user?.isAdmin && user?.role !== 'MANAGER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId, action, status } = await request.json();

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    switch (action) {
      case 'confirm_order': {
        if (order.status !== 'PENDING') {
          return NextResponse.json(
            { error: 'Order cannot be confirmed' },
            { status: 400 }
          );
        }

        await prisma.order.update({
          where: { id: orderId },
          data: { status: 'CONFIRMED' },
        });

        return NextResponse.json({ message: 'Order confirmed successfully' });
      }

      case 'create_shipment': {
        if (order.status !== 'CONFIRMED') {
          return NextResponse.json(
            { error: 'Order must be confirmed before creating shipment' },
            { status: 400 }
          );
        }

        if (order.courierConsignmentId) {
          return NextResponse.json(
            { error: 'Shipment already exists' },
            { status: 400 }
          );
        }
        
        // This whole case is now handled by /api/admin/shipments
        // I will remove it.
        return NextResponse.json({error: "This action is deprecated. Use /api/admin/shipments"}, {status: 400});
      }

      case 'update_status': {
        if (!status) {
          return NextResponse.json(
            { error: 'Status is required' },
            { status: 400 }
          );
        }

        const validStatuses = [
          'PENDING',
          'PROCESSING',
          'CONFIRMED',
          'SHIPPED',
          'DELIVERED',
          'CANCELLED',
        ];

        if (!validStatuses.includes(status)) {
          return NextResponse.json(
            { error: 'Invalid status' },
            { status: 400 }
          );
        }

        // If order is being marked as delivered, update Steadfast status
        if (status === 'DELIVERED' && order.courierTrackingCode) {
          // This might need to be updated to be generic for all couriers
          // For now, I'll leave it as it might be part of another feature
          try {
            // TODO: Import and implement steadfast courier integration
            // await steadfast.getDeliveryStatus(
            //   order.courierTrackingCode,
            //   'tracking'
            // );
            console.log('Order marked as delivered:', order.courierTrackingCode);
          } catch (error) {
            console.error('Error updating Steadfast status:', error);
          }
        }

        await prisma.order.update({
          where: { id: orderId },
          data: { status },
        });

        // Log the status change
        await AuditLogger.logOrderStatusChange(
          orderId,
          user.id,
          order.status,
          status
        );

        return NextResponse.json({ message: 'Order status updated successfully' });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to process order action' },
      { status: 500 }
    );
  }
}