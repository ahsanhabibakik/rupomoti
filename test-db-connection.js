import { PrismaClient } from '@prisma/client';

async function testDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Testing database connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Count total orders
    const totalOrders = await prisma.order.count();
    console.log(`📊 Total orders in database: ${totalOrders}`);
    
    // Get orders without any filters
    const allOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        orderNumber: true,
        createdAt: true,
        status: true,
        deletedAt: true,
        isFakeOrder: true,
        customer: {
          select: {
            name: true,
            phone: true
          }
        }
      }
    });
    
    console.log('📦 Recent orders (any status):');
    allOrders.forEach((order, index) => {
      console.log(`  ${index + 1}. ${order.orderNumber} - ${order.customer.name} - Status: ${order.status} - Deleted: ${!!order.deletedAt} - Fake: ${!!order.isFakeOrder} - Created: ${order.createdAt}`);
    });
    
    // Test non-deleted orders
    const nonDeletedOrders = await prisma.order.count({
      where: {
        deletedAt: null
      }
    });
    console.log(`📊 Non-deleted orders: ${nonDeletedOrders}`);
    
    // Get some non-deleted orders
    const activeOrdersRaw = await prisma.order.findMany({
      where: {
        deletedAt: null
      },
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        orderNumber: true,
        isFakeOrder: true,
        createdAt: true
      }
    });
    
    console.log('📦 Non-deleted orders:');
    activeOrdersRaw.forEach((order, index) => {
      console.log(`  ${index + 1}. ${order.orderNumber} - Fake: ${!!order.isFakeOrder} - Created: ${order.createdAt}`);
    });
    
    // Filter out fake orders manually
    const realActiveOrders = activeOrdersRaw.filter(order => !order.isFakeOrder);
    console.log(`📊 Real active orders (after filtering fake): ${realActiveOrders.length}`);
    
    // Test audit logs
    const auditLogCount = await prisma.auditLog.count();
    console.log(`📋 Total audit logs: ${auditLogCount}`);
    
    if (auditLogCount > 0) {
      const recentAuditLogs = await prisma.auditLog.findMany({
        take: 3,
        orderBy: { timestamp: 'desc' },
        select: {
          id: true,
          action: true,
          entityType: true,
          entityId: true,
          timestamp: true
        }
      });
      
      console.log('📋 Recent audit logs:');
      recentAuditLogs.forEach((log, index) => {
        console.log(`  ${index + 1}. ${log.action} on ${log.entityType} ${log.entityId} at ${log.timestamp}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
