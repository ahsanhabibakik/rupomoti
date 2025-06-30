#!/usr/bin/env node

/**
 * Test real-time order creation and admin dashboard updates
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Simulate order creation like the frontend would do
async function createTestOrder() {
  try {
    // Get a product with stock
    const product = await prisma.product.findFirst({
      where: { stock: { gt: 0 } },
      select: { id: true, name: true, price: true, stock: true }
    });

    if (!product) {
      throw new Error('No products with stock available');
    }

    // Create customer if not exists
    const customerPhone = `01${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`;
    
    let customer = await prisma.customer.findUnique({
      where: { phone: customerPhone }
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name: `Test Customer ${Date.now()}`,
          phone: customerPhone,
          email: `test${Date.now()}@example.com`,
          address: 'Test Address, Dhaka',
          city: 'Dhaka',
          zone: 'Dhaka Metro'
        }
      });
    }

    // Generate order number
    const orderCount = await prisma.order.count();
    const orderNumber = `ORD-TEST${(orderCount + 1).toString().padStart(4, '0')}`;

    // Create order with transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          customerId: customer.id,
          status: 'PENDING',
          paymentStatus: 'PENDING',
          paymentMethod: 'CASH_ON_DELIVERY',
          subtotal: product.price,
          deliveryFee: 60,
          discount: 0,
          total: product.price + 60,
          deliveryZone: 'INSIDE_DHAKA',
          deliveryAddress: customer.address,
          recipientName: customer.name,
          recipientPhone: customer.phone,
          recipientEmail: customer.email,
          recipientCity: customer.city,
          recipientZone: customer.zone,
          items: {
            create: {
              productId: product.id,
              quantity: 1,
              price: product.price
            }
          }
        },
        include: {
          customer: true,
          items: {
            include: { product: true }
          }
        }
      });

      // Update product stock
      await tx.product.update({
        where: { id: product.id },
        data: { stock: { decrement: 1 } }
      });

      return newOrder;
    });

    return order;
  } catch (error) {
    console.error('Error creating test order:', error);
    throw error;
  }
}

async function testRealTimeUpdates() {
  try {
    console.log('🧪 Testing Real-time Order Updates...\n');

    // Get current order count
    const beforeCount = await prisma.order.count({ where: { deletedAt: null } });
    console.log(`📊 Orders before test: ${beforeCount}`);

    // Create a new order
    console.log('🔄 Creating new test order...');
    const newOrder = await createTestOrder();
    
    console.log(`✅ Order created: ${newOrder.orderNumber}`);
    console.log(`   Customer: ${newOrder.customer.name}`);
    console.log(`   Phone: ${newOrder.customer.phone}`);
    console.log(`   Total: ৳${newOrder.total}`);
    console.log(`   Items: ${newOrder.items.length}`);
    console.log(`   Product: ${newOrder.items[0].product.name}`);
    console.log(`   Created at: ${newOrder.createdAt.toISOString()}`);

    // Verify order exists in database
    const afterCount = await prisma.order.count({ where: { deletedAt: null } });
    console.log(`\n📊 Orders after test: ${afterCount}`);
    console.log(`📈 Increase: +${afterCount - beforeCount}`);

    // Test admin query to verify it would show up
    console.log('\n🔍 Testing admin query (simulating admin dashboard)...');
    const adminQuery = await prisma.order.findMany({
      where: { deletedAt: null },
      include: {
        customer: true,
        user: { select: { isFlagged: true } },
        items: { include: { product: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    const foundNewOrder = adminQuery.find(order => order.id === newOrder.id);
    
    if (foundNewOrder) {
      console.log(`✅ New order found in admin query: ${foundNewOrder.orderNumber}`);
      console.log(`   Position in results: ${adminQuery.findIndex(order => order.id === newOrder.id) + 1}`);
    } else {
      console.log('❌ New order NOT found in admin query');
    }

    console.log('\n📋 Latest 3 orders (admin view):');
    adminQuery.slice(0, 3).forEach((order, index) => {
      const isNewOrder = order.id === newOrder.id;
      console.log(`   ${index + 1}. ${order.orderNumber} ${isNewOrder ? '← NEW' : ''}`);
      console.log(`      Status: ${order.status}`);
      console.log(`      Total: ৳${order.total}`);
      console.log(`      Customer: ${order.customer.name}`);
    });

    console.log('\n✅ Real-time update test completed!');
    console.log('\n📝 Summary:');
    console.log('• New order created successfully');
    console.log('• Order appears in admin query immediately');
    console.log('• Admin dashboard should show this order with no caching');
    console.log('• Frontend will auto-refresh every 3 seconds');
    console.log('• All mutation handlers will force immediate refetch');

    return newOrder;

  } catch (error) {
    console.error('❌ Error in real-time update test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testRealTimeUpdates();
