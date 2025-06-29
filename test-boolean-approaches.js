const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testBooleanQuery() {
  try {
    console.log('Testing different boolean query approaches...');
    
    // Test 1: Direct boolean comparison
    try {
      const count1 = await prisma.order.count({
        where: {
          deletedAt: null,
          isFakeOrder: false
        }
      });
      console.log('Direct false comparison:', count1);
    } catch (error) {
      console.log('Direct false comparison failed:', error.message);
    }
    
    // Test 2: Using $raw MongoDB query
    try {
      const rawResult = await prisma.order.aggregateRaw({
        pipeline: [
          {
            $match: {
              deletedAt: null,
              isFakeOrder: false
            }
          },
          {
            $count: "total"
          }
        ]
      });
      console.log('Raw MongoDB query result:', rawResult);
    } catch (error) {
      console.log('Raw query failed:', error.message);
    }
    
    // Test 3: Get all and filter in JavaScript (just to verify data)
    const allOrders = await prisma.order.findMany({
      where: { deletedAt: null },
      select: { id: true, orderNumber: true, isFakeOrder: true }
    });
    
    const notFakeOrders = allOrders.filter(order => order.isFakeOrder !== true);
    console.log('JS filtered count (not true):', notFakeOrders.length);
    
    const explicitFalseOrders = allOrders.filter(order => order.isFakeOrder === false);
    console.log('JS filtered count (=== false):', explicitFalseOrders.length);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testBooleanQuery();
