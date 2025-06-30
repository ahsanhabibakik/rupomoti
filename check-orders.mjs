#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkOrderStatus() {
  try {
    console.log('📊 Checking order creation status...\n');
    
    const totalOrders = await prisma.order.count();
    console.log(`📦 Total orders in database: ${totalOrders}`);
    
    if (totalOrders > 0) {
      // Get recent orders
      const recentOrders = await prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          orderNumber: true,
          recipientName: true,
          total: true,
          status: true,
          createdAt: true
        }
      });
      
      console.log('\n📋 Most recent orders:');
      recentOrders.forEach((order, index) => {
        console.log(`  ${index + 1}. ${order.orderNumber} - ${order.recipientName} - ৳${order.total} - ${order.status}`);
      });
      
      // Check order status distribution
      const statusCounts = await prisma.order.groupBy({
        by: ['status'],
        _count: { _all: true }
      });
      
      console.log('\n📊 Order status distribution:');
      statusCounts.forEach(stat => {
        console.log(`  ${stat.status}: ${stat._count._all} orders`);
      });
    }
    
    console.log('\n✅ Order check complete!');
    
  } catch (error) {
    console.error('❌ Error checking orders:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkOrderStatus();
