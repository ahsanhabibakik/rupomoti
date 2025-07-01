// Direct test of the orders API logic without server
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testOrdersAPILogic() {
  console.log('🧪 Testing Orders API logic directly...');
  
  try {
    // Simulate the API query parameters
    const status = 'active';
    const page = 1;
    const limit = 10;
    const offset = (page - 1) * limit;
    
    console.log('🔄 Building query...');
    
    let where: any = {};
    
    if (status === 'active') {
      // For active status, show non-deleted orders (we'll filter fake ones post-query)
      where.deletedAt = null;
      console.log('📋 Query: Getting active (non-fake) orders - will filter fake ones after query');
    }
    
    console.log('🔍 Where clause:', JSON.stringify(where, null, 2));
    
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

    console.log('📦 Orders fetched:', {
      queryWhere: where,
      count: orders.length,
      firstOrderId: orders[0]?.id,
      firstOrderNumber: orders[0]?.orderNumber,
      firstOrderCreated: orders[0]?.createdAt,
      firstOrderIsFake: orders[0]?.isFakeOrder,
      orderIds: orders.map(o => o.id).slice(0, 5),
      sampleOrderStructure: orders[0] ? Object.keys(orders[0]) : [],
    });

    // Post-query filtering for active orders
    let filteredOrders = orders;
    if (status === 'active') {
      // Filter out fake orders after fetching
      filteredOrders = orders.filter(order => !order.isFakeOrder);
      console.log('📦 After fake filter:', {
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
    
    console.log('📊 Total count:', totalOrders);

    const responseData = {
      orders: filteredOrders,
      totalOrders,
      totalPages: Math.ceil(totalOrders / limit),
    };

    console.log('📤 API Response simulation:', {
      ordersCount: responseData.orders.length,
      totalOrders: responseData.totalOrders,
      totalPages: responseData.totalPages,
      status,
      page,
      limit,
      hasOrders: responseData.orders.length > 0,
      firstOrderSample: responseData.orders[0] ? {
        id: responseData.orders[0].id,
        orderNumber: responseData.orders[0].orderNumber,
        status: responseData.orders[0].status,
        total: responseData.orders[0].total,
        isFakeOrder: responseData.orders[0].isFakeOrder,
        customer: responseData.orders[0].customer?.name,
        itemsCount: responseData.orders[0].items?.length
      } : null
    });
    
    // Return the same structure as the real API
    return responseData;
    
  } catch (error) {
    console.error('❌ Error in API logic test:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

testOrdersAPILogic();
