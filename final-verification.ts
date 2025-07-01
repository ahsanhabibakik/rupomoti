// Final verification test for the orders API
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function finalVerification() {
  console.log('🔍 Final verification of orders API...');
  
  try {
    // Test the exact same query the API would use
    const status = 'active';
    const page = 1;
    const limit = 10;
    const offset = (page - 1) * limit;
    
    // Build the where clause like the API does
    let where: any = {};
    if (status === 'active') {
      where.deletedAt = null;
    }
    
    console.log('🔄 Testing API query...');
    
    // Execute the exact same query as the API
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

    console.log('✅ Query executed successfully!');
    console.log('📊 Results:', {
      totalFetched: orders.length,
      hasOrders: orders.length > 0,
      firstOrder: orders[0] ? {
        id: orders[0].id,
        orderNumber: orders[0].orderNumber,
        isFakeOrder: orders[0].isFakeOrder,
        status: orders[0].status,
        customer: orders[0].customer?.name,
        hasItems: orders[0].items?.length > 0
      } : null
    });

    // Filter active orders (non-fake)
    const activeOrders = orders.filter(order => !order.isFakeOrder);
    console.log('📋 Active orders after filtering:', {
      activeCount: activeOrders.length,
      fakeCount: orders.length - activeOrders.length
    });

    // Test count query
    const totalActive = await prisma.order.count({
      where: { deletedAt: null }
    });
    const allOrders = await prisma.order.findMany({
      where: { deletedAt: null },
      select: { id: true, isFakeOrder: true }
    });
    const trulyActiveCount = allOrders.filter(order => !order.isFakeOrder).length;
    
    console.log('📈 Count verification:', {
      totalNonDeleted: totalActive,
      trulyActive: trulyActiveCount,
      fake: totalActive - trulyActiveCount
    });

    if (activeOrders.length > 0) {
      console.log('🎉 SUCCESS: Orders API should work correctly!');
      console.log('💡 The order data is available and properly structured.');
    } else {
      console.log('⚠️  WARNING: No active orders found, but the query structure is correct.');
    }

  } catch (error) {
    console.error('❌ ERROR in verification:', error);
    if (error.message.includes('isFakeOrder')) {
      console.log('💡 The isFakeOrder field issue needs to be resolved.');
    }
  } finally {
    await prisma.$disconnect();
  }
}

finalVerification();
