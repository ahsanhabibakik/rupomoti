import { prisma } from '@/lib/prisma';

async function createTestOrder() {
  try {
    console.log('Creating test order...');
    
    // First, let's check if we have any users to associate the order with
    const users = await prisma.user.findMany({ take: 1 });
    console.log('Found users:', users.length);
    
    if (users.length === 0) {
      console.log('No users found, creating a test user first...');
      const testUser = await prisma.user.create({
        data: {
          email: 'test@example.com',
          name: 'Test User',
          role: 'USER',
        }
      });
      console.log('Created test user:', testUser.id);
    }
    
    // Create a test order
    const testOrder = await prisma.order.create({
      data: {
        orderNumber: 'ORD-TEST001',
        status: 'PENDING',
        paymentStatus: 'PENDING',
        paymentMethod: 'COD',
        subtotal: 1000,
        deliveryFee: 100,
        discount: 0,
        total: 1100,
        paidAmount: 0,
        remainingAmount: 1100,
        deliveryZone: 'Dhaka',
        deliveryAddress: 'Test Address, Dhaka',
        recipientName: 'Test Customer',
        recipientPhone: '01234567890',
        recipientEmail: 'customer@test.com',
        recipientCity: 'Dhaka',
        recipientZone: 'Dhanmondi',
        recipientArea: 'Dhanmondi 15',
        isFakeOrder: false,
        customer: {
          connectOrCreate: {
            where: { email: 'customer@test.com' },
            create: {
              email: 'customer@test.com',
              name: 'Test Customer',
              phone: '01234567890',
            }
          }
        }
      }
    });
    
    console.log('Created test order:', testOrder.orderNumber);
    
    // Verify the order was created
    const orderCount = await prisma.order.count();
    console.log('Total orders in database:', orderCount);
    
    // Check if the order is visible with our filters
    const activeOrders = await prisma.order.count({
      where: {
        deletedAt: null,
        OR: [
          { isFakeOrder: false },
          { isFakeOrder: null },
        ]
      }
    });
    console.log('Active orders (not fake, not deleted):', activeOrders);
    
  } catch (error) {
    console.error('Error creating test order:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestOrder();
