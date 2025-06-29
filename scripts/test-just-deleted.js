const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testJustDeleted() {
  try {
    console.log('Testing just deletedAt = null...');
    
    const where = {
      deletedAt: null
    };
    
    console.log('Query where clause:', JSON.stringify(where, null, 2));
    
    const count = await prisma.order.count({ where });
    console.log('Total count with just deletedAt = null:', count);
    
    const orders = await prisma.order.findMany({
      where,
      take: 2,
    });
    
    console.log(`Found ${orders.length} orders`);
    
    if (orders.length > 0) {
      console.log('Sample order fields:');
      console.log(Object.keys(orders[0]));
      console.log({
        id: orders[0].id,
        orderNumber: orders[0].orderNumber,
        deletedAt: orders[0].deletedAt,
        isFakeOrder: orders[0].isFakeOrder,
        status: orders[0].status,
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testJustDeleted();
