const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testActiveOrdersSimple() {
  try {
    console.log('Testing active orders with isFakeOrder = false...');
    
    const where = {
      deletedAt: null,
      isFakeOrder: false
    };
    
    console.log('Query where clause:', JSON.stringify(where, null, 2));
    
    const count = await prisma.order.count({ where });
    console.log('Total count:', count);
    
    const orders = await prisma.order.findMany({
      where,
      include: {
        customer: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 3,
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
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testActiveOrdersSimple();
