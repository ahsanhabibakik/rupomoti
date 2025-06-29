const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testOrders() {
  try {
    console.log('Testing order counts...');
    
    // Count all orders
    const totalOrders = await prisma.order.count();
    console.log('Total orders in database:', totalOrders);
    
    // Count non-deleted orders
    const nonDeletedOrders = await prisma.order.count({
      where: { deletedAt: null }
    });
    console.log('Non-deleted orders:', nonDeletedOrders);
    
    // Count orders with isFakeOrder = false
    const falseOrders = await prisma.order.count({
      where: { 
        deletedAt: null,
        isFakeOrder: false
      }
    });
    console.log('Orders with isFakeOrder = false:', falseOrders);
    
    // Count orders with isFakeOrder = true
    const trueOrders = await prisma.order.count({
      where: { 
        deletedAt: null,
        isFakeOrder: true
      }
    });
    console.log('Orders with isFakeOrder = true:', trueOrders);
    
    // Count orders with isFakeOrder = null
    const nullOrders = await prisma.order.count({
      where: { 
        deletedAt: null,
        isFakeOrder: null
      }
    });
    console.log('Orders with isFakeOrder = null:', nullOrders);
    
    // Get a sample order to inspect
    const sampleOrder = await prisma.order.findFirst({
      where: { deletedAt: null },
      include: { customer: true }
    });
    
    if (sampleOrder) {
      console.log('Sample order structure:');
      console.log({
        id: sampleOrder.id,
        orderNumber: sampleOrder.orderNumber,
        deletedAt: sampleOrder.deletedAt,
        isFakeOrder: sampleOrder.isFakeOrder,
        status: sampleOrder.status,
        customer: sampleOrder.customer ? sampleOrder.customer.name : 'No customer'
      });
    } else {
      console.log('No orders found');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testOrders();
