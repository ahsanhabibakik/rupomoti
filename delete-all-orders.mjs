#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteAllOrders() {
  try {
    console.log('🗑️ Deleting all orders and related data...\n');
    
    // Get count before deletion
    const orderCount = await prisma.order.count();
    console.log(`📊 Found ${orderCount} orders to delete`);
    
    // Delete in correct order to avoid foreign key issues
    console.log('1. Deleting order items...');
    const deletedItems = await prisma.orderItem.deleteMany({});
    console.log(`   ✅ Deleted ${deletedItems.count} order items`);
    
    console.log('2. Deleting audit logs...');
    const deletedAuditLogs = await prisma.auditLog.deleteMany({
      where: {
        model: 'Order'
      }
    });
    console.log(`   ✅ Deleted ${deletedAuditLogs.count} audit logs`);
    
    console.log('3. Deleting stock logs...');
    const deletedStockLogs = await prisma.stockLog.deleteMany({});
    console.log(`   ✅ Deleted ${deletedStockLogs.count} stock logs`);
    
    console.log('4. Deleting orders...');
    const deletedOrders = await prisma.order.deleteMany({});
    console.log(`   ✅ Deleted ${deletedOrders.count} orders`);
    
    console.log('5. Cleaning up customers (optional - keeping for now)');
    // Note: Not deleting customers as they might be reused
    
    console.log('\n✅ All orders and related data deleted successfully!');
    console.log('📊 Database is now clean and ready for new test orders.');
    
  } catch (error) {
    console.error('❌ Error deleting orders:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteAllOrders();
