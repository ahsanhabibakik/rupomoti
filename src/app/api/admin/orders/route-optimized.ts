import { NextResponse } from "next/server";
import { auth } from "@/app/auth";
import { prisma } from "@/lib/prisma";
import { OrderStatus, OrderType } from "@prisma/client";

// Force dynamic rendering to ensure fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

    // Build simplified where clause using orderType for efficiency
    const where: any = {};
    
    // Use simplified status filtering with orderType
    switch (status) {
      case 'active':
        where.isActive = true;
        break;
      case 'fake':
        where.orderType = 'FAKE';
        break;
      case 'trashed':
        where.orderType = 'TRASH';
        break;
      case 'all':
        // No additional filter - show all orders
        break;
      default:
        // If it's an OrderStatus, filter by that
        if (Object.values(OrderStatus).includes(status as OrderStatus)) {
          where.status = status;
          where.isActive = true; // Only show active orders with specific status
        } else {
          where.isActive = true; // Default to active
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
          isActive: true,
          orderType: true,
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
        isActive: orders[0].isActive,
        orderType: orders[0].orderType,
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

    // Build update data with computed fields
    const updateData: any = { updatedAt: new Date() };
    
    if (status !== undefined) {
      updateData.status = status;
    }
    
    if (isFakeOrder !== undefined) {
      updateData.isFakeOrder = isFakeOrder;
      updateData.orderType = isFakeOrder ? 'FAKE' : 'NORMAL';
      updateData.isActive = !isFakeOrder;
    }
    
    if (restore === true) {
      updateData.deletedAt = null;
      updateData.orderType = 'NORMAL';
      updateData.isActive = true;
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
        orderType: 'TRASH',
        isActive: false
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

// POST method remains the same as in the original file for order creation
export { POST } from './original-route';
