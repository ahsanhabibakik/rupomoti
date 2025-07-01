// Script to create test orders for debugging
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestOrders() {
  console.log('🧪 Creating test orders...');
  
  try {
    // First, let's get a customer to use
    let customer = await prisma.customer.findFirst();
    
    if (!customer) {
      console.log('📝 Creating test customer...');
      customer = await prisma.customer.create({
        data: {
          name: 'Test Customer',
          phone: '+1234567890',
          address: '123 Test Street, Test City',
          email: 'test@example.com'
        }
      });
    }
    
    console.log('👤 Using customer:', customer.name);
    
    // Create a few test orders
    const orders = [];
    for (let i = 1; i <= 3; i++) {
      const orderNumber = `TEST-${Date.now()}-${i}`;
      const order = await prisma.order.create({
        data: {
          orderNumber,
          customerId: customer.id,
          status: 'PENDING',
          paymentStatus: 'PENDING',
          paymentMethod: 'CASH_ON_DELIVERY',
          subtotal: 100 * i,
          deliveryFee: 10,
          total: 100 * i + 10,
          deliveryZone: 'INSIDE_DHAKA',
          deliveryAddress: `${customer.address} - Order ${i}`,
          isFakeOrder: false, // Make sure it's not fake
          items: {
            create: [
              {
                name: `Test Product ${i}`,
                price: 100 * i,
                quantity: 1,
                productId: null, // We'll handle this being null
              }
            ]
          }
        },
        include: {
          customer: true,
          items: true,
        }
      });
      
      orders.push(order);
      console.log(`✅ Created order ${orderNumber}`);
    }
    
    console.log('🎉 Test orders created successfully!', {
      count: orders.length,
      orderNumbers: orders.map(o => o.orderNumber)
    });
    
    // Verify the orders can be queried like the API does
    const activeOrders = await prisma.order.findMany({
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
      take: 10,
    });
    
    const trulyActiveOrders = activeOrders.filter(order => !order.isFakeOrder);
    
    console.log('🔍 Query verification:', {
      totalActiveOrders: activeOrders.length,
      trulyActiveOrders: trulyActiveOrders.length,
      sampleOrder: trulyActiveOrders[0] ? {
        id: trulyActiveOrders[0].id,
        orderNumber: trulyActiveOrders[0].orderNumber,
        isFakeOrder: trulyActiveOrders[0].isFakeOrder,
        status: trulyActiveOrders[0].status,
        total: trulyActiveOrders[0].total,
        customerName: trulyActiveOrders[0].customer?.name,
        itemsCount: trulyActiveOrders[0].items?.length
      } : null
    });
    
  } catch (error) {
    console.error('❌ Error creating test orders:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestOrders();
