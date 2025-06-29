const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testNotTrueQuery() {
  try {
    console.log('Testing isFakeOrder: { not: true } query...');
    
    const where = {
      deletedAt: null,
      isFakeOrder: { not: true }
    };
    
    console.log('Query where clause:', JSON.stringify(where, null, 2));
    
    const count = await prisma.order.count({ where });
    console.log('Total count with { not: true }:', count);
    
    if (count > 0) {
      const orders = await prisma.order.findMany({
        where,
        take: 3,
      });
      
      console.log(`Found ${orders.length} active orders`);
      console.log('Sample order:', {
        orderNumber: orders[0].orderNumber,
        isFakeOrder: orders[0].isFakeOrder,
        status: orders[0].status
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testNotTrueQuery();
