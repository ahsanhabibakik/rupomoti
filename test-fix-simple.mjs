import { prisma } from './src/lib/prisma.js'

async function testOrderQueries() {
  console.log('🧪 Testing order queries after MongoDB fix...\n');

  try {
    // Test with isFakeOrder: false (corrected query)
    const activeOrders = await prisma.order.findMany({
      where: {
        deletedAt: null,
        isFakeOrder: false
      },
      select: {
        id: true,
        orderNumber: true,
        isFakeOrder: true,
        deletedAt: true,
        createdAt: true,
        recipientName: true,
        total: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    console.log('✅ Active orders (isFakeOrder: false):', {
      count: activeOrders.length,
      orders: activeOrders.map(o => ({
        orderNumber: o.orderNumber,
        isFakeOrder: o.isFakeOrder,
        recipientName: o.recipientName,
        total: o.total,
        createdAt: o.createdAt.toISOString()
      }))
    });

    // Test counts
    const activeCount = await prisma.order.count({ 
      where: { 
        deletedAt: null, 
        isFakeOrder: false 
      } 
    });

    console.log('\n📊 Active order count:', activeCount);

  } catch (error) {
    console.error('❌ Error testing queries:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testOrderQueries();
