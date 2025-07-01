const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testOrderQueries() {
  console.log('🧪 Testing order queries after MongoDB fix...\n');

  try {
    // 1. Test all orders
    const allOrders = await prisma.order.findMany({
      where: {
        deletedAt: null
      },
      select: {
        id: true,
        orderNumber: true,
        isFakeOrder: true,
        deletedAt: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    console.log('1️⃣ All non-deleted orders:', {
      count: allOrders.length,
      orders: allOrders.map(o => ({
        orderNumber: o.orderNumber,
        isFakeOrder: o.isFakeOrder,
        deletedAt: o.deletedAt
      }))
    });

    // 2. Test with isFakeOrder: false (corrected query)
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
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    console.log('\n2️⃣ Active orders (isFakeOrder: false):', {
      count: activeOrders.length,
      orders: activeOrders.map(o => ({
        orderNumber: o.orderNumber,
        isFakeOrder: o.isFakeOrder,
        deletedAt: o.deletedAt
      }))
    });

    // 3. Test with isFakeOrder: true (fake orders)
    const fakeOrders = await prisma.order.findMany({
      where: {
        deletedAt: null,
        isFakeOrder: true
      },
      select: {
        id: true,
        orderNumber: true,
        isFakeOrder: true,
        deletedAt: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    console.log('\n3️⃣ Fake orders (isFakeOrder: true):', {
      count: fakeOrders.length,
      orders: fakeOrders.map(o => ({
        orderNumber: o.orderNumber,
        isFakeOrder: o.isFakeOrder,
        deletedAt: o.deletedAt
      }))
    });

    // 4. Test counts
    const [totalCount, activeCount, fakeCount] = await Promise.all([
      prisma.order.count({ where: { deletedAt: null } }),
      prisma.order.count({ where: { deletedAt: null, isFakeOrder: false } }),
      prisma.order.count({ where: { deletedAt: null, isFakeOrder: true } })
    ]);

    console.log('\n📊 Order counts:', {
      total: totalCount,
      active: activeCount,
      fake: fakeCount,
      calculation: activeCount + fakeCount === totalCount ? '✅ Correct' : '❌ Mismatch'
    });

  } catch (error) {
    console.error('❌ Error testing queries:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testOrderQueries();
