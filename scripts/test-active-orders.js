const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testActiveOrders() {
  try {
    console.log('Testing active orders query...');
    
    // Simulate the exact query used for active orders
    const where = {
      deletedAt: null,
      isFakeOrder: { not: true }
    };
    
    console.log('Query where clause:', JSON.stringify(where, null, 2));
    
    const orders = await prisma.order.findMany({
      where,
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5, // Just get first 5
    });
    
    console.log(`Found ${orders.length} active orders`);
    
    if (orders.length > 0) {
      console.log('First order:');
      console.log({
        id: orders[0].id,
        orderNumber: orders[0].orderNumber,
        deletedAt: orders[0].deletedAt,
        isFakeOrder: orders[0].isFakeOrder,
        status: orders[0].status,
        customer: orders[0].customer?.name || 'No customer'
      });
    }
    
    const totalCount = await prisma.order.count({ where });
    console.log('Total count with this query:', totalCount);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testActiveOrders();
