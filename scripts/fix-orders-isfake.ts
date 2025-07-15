import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixOrdersIsFakeField() {
  try {
    console.log('🔄 Starting orders isFakeOrder field migration...');
    
    // Check current state
    const totalOrders = await prisma.order.count();
    console.log(`📊 Total orders in database: ${totalOrders}`);
    
    // Get all orders and check their isFakeOrder status
    const allOrders = await prisma.order.findMany({
      select: {
        id: true,
        orderNumber: true,
        isFakeOrder: true,
        createdAt: true,
        customer: {
          select: {
            name: true,
            phone: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`� Found ${allOrders.length} orders total`);
    
    // Count orders by isFakeOrder status
    const ordersWithNull = allOrders.filter((order: any) => order.isFakeOrder === null);
    const ordersWithFalse = allOrders.filter((order: any) => order.isFakeOrder === false);
    const ordersWithTrue = allOrders.filter((order: any) => order.isFakeOrder === true);
    
    console.log(`🔍 Current distribution:`);
    console.log(`- isFakeOrder = null: ${ordersWithNull.length}`);
    console.log(`- isFakeOrder = false: ${ordersWithFalse.length}`);
    console.log(`- isFakeOrder = true: ${ordersWithTrue.length}`);
    
    if (ordersWithNull.length > 0) {
      console.log(`🔧 Updating ${ordersWithNull.length} orders to set isFakeOrder: false...`);
      
      // Update each order individually to avoid TypeScript issues
      let updatedCount = 0;
      for (const order of ordersWithNull) {
        await prisma.order.update({
          where: { id: order.id },
          data: { isFakeOrder: false }
        });
        updatedCount++;
      }
      
      console.log(`✅ Updated ${updatedCount} orders successfully!`);
    } else {
      console.log('ℹ️ No orders need updating - all have isFakeOrder set');
    }
    
    // Final verification
    const finalOrders = await prisma.order.findMany({
      select: {
        id: true,
        orderNumber: true,
        isFakeOrder: true,
        createdAt: true,
        customer: {
          select: {
            name: true,
            phone: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    
    console.log('\n� Final verification - Recent orders:');
    finalOrders.forEach((order: any, index: number) => {
      console.log(`${index + 1}. ${order.orderNumber}: isFakeOrder=${order.isFakeOrder}, customer=${order.customer?.name}`);
    });
    
    console.log('\n✅ Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

fixOrdersIsFakeField();
