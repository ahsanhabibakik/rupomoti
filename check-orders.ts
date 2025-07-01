// Script to check orders in the database
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkOrders() {
  console.log('🔍 Checking orders in database...');
  
  try {
    // First, let's see how many orders exist total
    const totalCount = await prisma.order.count();
    console.log('📊 Total orders in database:', totalCount);
    
    // Check how many are deleted
    const deletedCount = await prisma.order.count({
      where: { deletedAt: { not: null } }
    });
    console.log('🗑️ Deleted orders:', deletedCount);
    
    // Check how many are fake
    const fakeCount = await prisma.order.count({
      where: { isFakeOrder: true }
    });
    console.log('👻 Fake orders:', fakeCount);
    
    // Check active orders (not deleted, not fake)
    const activeCount = await prisma.order.count({
      where: { 
        deletedAt: null,
        isFakeOrder: false
      }
    });
    console.log('✅ Active orders:', activeCount);
    
    // Get a sample of orders with their basic info
    const sampleOrders = await prisma.order.findMany({
      take: 5,
      select: {
        id: true,
        orderNumber: true,
        createdAt: true,
        deletedAt: true,
        isFakeOrder: true,
        status: true,
        total: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log('📦 Sample orders:', sampleOrders);
    
    // Test the exact query that the API uses for active orders
    const apiActiveOrders = await prisma.order.findMany({
      where: { deletedAt: null },
      include: {
        customer: true,
        user: {
          select: {
            isFlagged: true
          }
        },
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });
    
    console.log('🔬 API-style query result:', {
      count: apiActiveOrders.length,
      orders: apiActiveOrders.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        isFakeOrder: order.isFakeOrder,
        hasCustomer: !!order.customer,
        itemsCount: order.items.length
      }))
    });
    
    // Filter for truly active orders (excluding fake ones)
    const trulyActiveOrders = apiActiveOrders.filter(order => !order.isFakeOrder);
    console.log('✅ Truly active orders after filtering:', trulyActiveOrders.length);
    
  } catch (error) {
    console.error('❌ Error checking orders:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkOrders();
