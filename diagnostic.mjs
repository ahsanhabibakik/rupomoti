#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runDiagnostics() {
  try {
    console.log('🔍 Running comprehensive diagnostics...\n');
    
    // 1. Test database connection
    console.log('1. Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connected successfully\n');
    
    // 2. Check total data counts
    console.log('2. Checking data counts...');
    const totalOrders = await prisma.order.count();
    const totalUsers = await prisma.user.count();
    const totalAuditLogs = await prisma.auditLog.count();
    
    console.log(`📊 Total orders: ${totalOrders}`);
    console.log(`👥 Total users: ${totalUsers}`);
    console.log(`📋 Total audit logs: ${totalAuditLogs}\n`);
    
    // 3. Check orders by status
    console.log('3. Analyzing orders...');
    const orderStats = await prisma.order.groupBy({
      by: ['deletedAt'],
      _count: { _all: true }
    });
    
    console.log('Orders by deletion status:');
    orderStats.forEach(stat => {
      const status = stat.deletedAt ? 'deleted' : 'active';
      console.log(`  ${status}: ${stat._count._all}`);
    });
    
    // 4. Check fake orders manually (avoiding MongoDB boolean issues)
    console.log('\n4. Checking fake orders...');
    const allActiveOrders = await prisma.order.findMany({
      where: { deletedAt: null },
      select: { id: true, isFakeOrder: true }
    });
    
    const realOrders = allActiveOrders.filter(order => !order.isFakeOrder);
    const fakeOrders = allActiveOrders.filter(order => order.isFakeOrder);
    
    console.log(`  Real orders: ${realOrders.length}`);
    console.log(`  Fake orders: ${fakeOrders.length}\n`);
    
    // 5. Check recent orders
    console.log('5. Recent orders sample:');
    const recentOrders = await prisma.order.findMany({
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
    
    recentOrders.forEach((order, index) => {
      console.log(`  ${index + 1}. ${order.orderNumber} - ${order.customer.name} - ${order.status} - Deleted: ${!!order.deletedAt} - Fake: ${!!order.isFakeOrder}`);
    });
    
    // 6. Check admin users
    console.log('\n6. Checking admin users...');
    const adminUsers = await prisma.user.findMany({
      where: {
        OR: [
          { isAdmin: true },
          { role: 'ADMIN' },
          { role: 'MANAGER' }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
        role: true
      }
    });
    
    console.log(`Admin users found: ${adminUsers.length}`);
    adminUsers.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.name} (${user.email}) - Admin: ${user.isAdmin}, Role: ${user.role}`);
    });
    
    // 7. Check audit logs sample
    console.log('\n7. Recent audit logs sample:');
    if (totalAuditLogs > 0) {
      const recentAuditLogs = await prisma.auditLog.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          model: true,
          recordId: true,
          action: true,
          createdAt: true,
          user: {
            select: {
              name: true
            }
          }
        }
      });
      
      recentAuditLogs.forEach((log, index) => {
        console.log(`  ${index + 1}. ${log.action} on ${log.model} by ${log.user.name} at ${log.createdAt}`);
      });
    } else {
      console.log('  No audit logs found - running seeder...');
      // Run audit log seeder
      await seedSampleAuditLogs();
    }
    
    console.log('\n✅ Diagnostics complete!');
    
  } catch (error) {
    console.error('❌ Diagnostics failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function seedSampleAuditLogs() {
  try {
    // Get an admin user
    const adminUser = await prisma.user.findFirst({
      where: {
        OR: [
          { isAdmin: true },
          { role: 'ADMIN' },
          { role: 'MANAGER' }
        ]
      }
    });
    
    if (!adminUser) {
      console.log('❌ No admin user found for seeding audit logs');
      return;
    }
    
    // Get some orders
    const orders = await prisma.order.findMany({
      take: 5,
      select: { id: true, orderNumber: true }
    });
    
    // Create audit logs
    for (const order of orders) {
      await prisma.auditLog.create({
        data: {
          model: 'Order',
          recordId: order.id,
          userId: adminUser.id,
          action: 'ORDER_CREATED',
          details: {
            orderNumber: order.orderNumber,
            createdBy: 'system'
          }
        }
      });
    }
    
    console.log(`✅ Created ${orders.length} sample audit logs`);
    
  } catch (error) {
    console.error('❌ Failed to seed audit logs:', error);
  }
}

runDiagnostics();
