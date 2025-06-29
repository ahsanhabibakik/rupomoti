const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugFakeOrderField() {
  try {
    console.log('Debugging isFakeOrder field values...');
    
    // Get all non-deleted orders and inspect their isFakeOrder values
    const orders = await prisma.order.findMany({
      where: { deletedAt: null },
      take: 10,
    });
    
    console.log(`Found ${orders.length} non-deleted orders`);
    
    orders.forEach((order, index) => {
      console.log(`Order ${index + 1}:`, {
        orderNumber: order.orderNumber,
        isFakeOrder: order.isFakeOrder,
        type: typeof order.isFakeOrder,
        value: JSON.stringify(order.isFakeOrder)
      });
    });
    
    // Count distinct values
    const groupedOrders = {};
    orders.forEach(order => {
      const key = JSON.stringify(order.isFakeOrder);
      if (!groupedOrders[key]) {
        groupedOrders[key] = 0;
      }
      groupedOrders[key]++;
    });
    
    console.log('\nValue distribution:');
    Object.entries(groupedOrders).forEach(([key, count]) => {
      console.log(`${key}: ${count} orders`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugFakeOrderField();
