import { prisma } from '@/lib/prisma';

async function updateExistingOrders() {
  try {
    console.log('Updating existing orders to set isFakeOrder to false...');
    
    // Update all orders where isFakeOrder is null or undefined
    const result = await prisma.order.updateMany({
      where: {
        OR: [
          { isFakeOrder: null },
          { isFakeOrder: { equals: undefined } },
        ]
      },
      data: {
        isFakeOrder: false
      }
    });
    
    console.log(`Updated ${result.count} orders`);
  } catch (error) {
    console.error('Error updating orders:', error);
  }
}

updateExistingOrders();
