import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/auth";
import { prisma } from "@/lib/prisma";
import { OrderStatus, Prisma } from "@prisma/client";
import { AuditLogger } from "@/lib/audit-logger";

export async function GET(req: Request) {
  console.log('🚀 Admin Orders API - Starting request...');
  
  const session = await auth();
  
  // Enhanced authentication check with detailed logging
  console.log('🔐 Admin Orders API - Session check:', {
    hasSession: !!session,
    userId: session?.user?.id,
    isAdmin: session?.user?.isAdmin,
    role: session?.user?.role,
    email: session?.user?.email,
  });
  
  // Check authentication - simplified
  if (!session?.user?.id) {
    console.log('❌ No authenticated user');
    return NextResponse.json({ error: 'Unauthorized - No session' }, { status: 401 });
  }
  
  // Check admin access - allow any admin user or specific roles
  const hasAdminAccess = session?.user?.isAdmin || 
                        session?.user?.role === 'ADMIN' || 
                        session?.user?.role === 'MANAGER' ||
                        session?.user?.role === 'SUPER_ADMIN';
  
  if (!hasAdminAccess) {
    console.log('❌ User does not have admin access:', {
      isAdmin: session?.user?.isAdmin,
      role: session?.user?.role
    });
    return NextResponse.json({ error: 'Unauthorized - Insufficient permissions' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status'); // e.g., 'all', 'trashed', or specific order statuses
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const offset = (page - 1) * limit;

  console.log('📊 Admin Orders API - Query parameters:', {
    search, status, from, to, page, limit, offset
  });

  try {
    // Simplified approach - start with basic query and add complexity gradually
    console.log('🔄 Building query...');
    
    let where: Prisma.OrderWhereInput = {};
    
    // Handle different status filters
    if (status === 'trashed') {
      where.deletedAt = { not: null };
      console.log('📋 Query: Getting trashed orders');
    } else if (status === 'fake') {
      where.deletedAt = null;
      where.isFakeOrder = true;
      console.log('📋 Query: Getting fake orders');
    } else {
      // For all other statuses (active, all), just show non-deleted orders
      where.deletedAt = null;
      console.log('📋 Query: Getting non-deleted orders');
    }

    console.log('🔍 Admin Orders API - Basic where clause:', JSON.stringify(where, null, 2));

    // Handle search - keep it simple for now
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
    
    // Handle specific order status - keep it simple
    if (status && status !== 'all' && status !== 'trashed' && status !== 'active' && status !== 'fake') {
      console.log('🏷️ Adding status filter:', status);
      where.status = status as OrderStatus;
    }

    // Handle date range - keep it simple
    if (from && to) {
      console.log('📅 Adding date range filter:', { from, to });
      where.createdAt = {
        gte: new Date(from),
        lte: new Date(to),
      };
    }

    console.log('🔍 Admin Orders API - Final where clause:', JSON.stringify(where, null, 2));

    // Direct test - get total count first to verify database connection
    const totalOrdersInDb = await prisma.order.count();
    console.log('📊 Total orders in database:', totalOrdersInDb);

    // Check for very recent orders (last 10 minutes)
    const recentOrdersCount = await prisma.order.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 10 * 60 * 1000) // 10 minutes ago
        }
      }
    });
    console.log('📊 Orders created in last 10 minutes:', recentOrdersCount);

    // Direct test - get a few orders without filters to verify data exists
    const testOrders = await prisma.order.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        orderNumber: true,
        deletedAt: true,
        isFakeOrder: true,
        createdAt: true
      }
    });
    console.log('🧪 Test orders (no filters):', testOrders);

    console.log('🔄 Executing main query...');
    const orders = await prisma.order.findMany({
      where,
      include: {
        customer: true,
        user: {
          select: {
            isFlagged: true
          }
        },
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
    });

    console.log('📦 Admin Orders API - Orders fetched:', {
      queryWhere: where,
      count: orders.length,
      firstOrderId: orders[0]?.id,
      firstOrderNumber: orders[0]?.orderNumber,
      firstOrderCreated: orders[0]?.createdAt,
      orderIds: orders.map(o => o.id).slice(0, 5), // First 5 IDs
    });

    // Post-query filtering for active orders (workaround for MongoDB boolean issues)
    let filteredOrders = orders;
    if (status === 'active') {
      // Filter out fake orders after fetching
      filteredOrders = orders.filter(order => !order.isFakeOrder);
      console.log('📦 Admin Orders API - After fake filter:', {
        originalCount: orders.length,
        filteredCount: filteredOrders.length,
      });
    }

    // Get the total count - need to handle fake filtering manually
    let totalOrders;
    if (status === 'active') {
      // Get all non-deleted orders and filter fake ones
      const allOrders = await prisma.order.findMany({
        where: { deletedAt: null },
        select: { id: true, isFakeOrder: true }
      });
      totalOrders = allOrders.filter(order => !order.isFakeOrder).length;
    } else {
      totalOrders = await prisma.order.count({ where });
    }
    
    console.log('📊 Admin Orders API - Total count:', totalOrders);

    const responseData = {
      orders: filteredOrders,
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

    // Create response with no-cache headers for real-time updates
    const response = NextResponse.json(responseData);
    
    // Add aggressive no-cache headers to ensure real-time data
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');
    response.headers.set('Vary', '*');
    
    return response;
  } catch (error) {
    console.error(error);
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