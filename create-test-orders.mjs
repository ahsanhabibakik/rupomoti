#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Sample data for generating realistic test orders
const CUSTOMER_NAMES = [
  'Ahmed Hassan', 'Fatima Khan', 'Mohammad Ali', 'Ayesha Rahman', 'Omar Faruq',
  'Nadia Ahmed', 'Rashid Islam', 'Sadia Begum', 'Karim Uddin', 'Ruma Khatun',
  'Habib Ullah', 'Nasreen Sultana', 'Ibrahim Hossain', 'Salma Akter', 'Rafiq Ahmed',
  'Tahmina Begum', 'Abdur Rahman', 'Shahana Parvin', 'Mizanur Rahman', 'Rohima Khatun'
];

const PHONE_NUMBERS = [
  '01712345678', '01812345679', '01912345680', '01612345681', '01512345682',
  '01712345683', '01812345684', '01912345685', '01612345686', '01512345687',
  '01712345688', '01812345689', '01912345690', '01612345691', '01512345692',
  '01712345693', '01812345694', '01912345695', '01612345696', '01512345697'
];

const ADDRESSES = [
  'House 10, Road 5, Dhanmondi, Dhaka',
  'Flat 3B, Building 15, Gulshan 2, Dhaka',
  'House 25, Block C, Bashundhara RA, Dhaka',
  'Apartment 4A, Green Road, Dhaka',
  'House 8, Lane 3, Uttara Sector 7, Dhaka',
  'Villa 12, Road 11, Banani, Dhaka',
  'Flat 2C, House 18, Mohammadpur, Dhaka',
  'House 33, Road 7, Wari, Dhaka',
  'Apartment 5D, Elephant Road, Dhaka',
  'House 22, Block D, Mirpur DOHS, Dhaka'
];

const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
const PAYMENT_STATUSES = ['PENDING', 'PAID', 'FAILED'];
const DELIVERY_ZONES = ['INSIDE_DHAKA', 'OUTSIDE_DHAKA', 'PERIPHERAL_DHAKA'];
const PAYMENT_METHODS = ['CASH_ON_DELIVERY', 'BANK_TRANSFER'];

// Generate unique order number
function generateOrderNumber() {
  return `ORD-${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

// Generate random date in the last 30 days
function generateRandomDate() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
  const randomTime = thirtyDaysAgo.getTime() + Math.random() * (now.getTime() - thirtyDaysAgo.getTime());
  return new Date(randomTime);
}

async function createTestOrders() {
  try {
    console.log('🏗️ Creating 100 test orders...\n');
    
    // Get some products to use in orders
    const products = await prisma.product.findMany({
      take: 20,
      select: {
        id: true,
        name: true,
        price: true,
        stock: true
      }
    });
    
    if (products.length === 0) {
      console.log('❌ No products found! Cannot create orders without products.');
      return;
    }
    
    console.log(`📦 Found ${products.length} products to use in orders`);
    
    // Get or create an admin user for audit logs
    let adminUser = await prisma.user.findFirst({
      where: {
        OR: [
          { isAdmin: true },
          { role: 'ADMIN' },
          { role: 'SUPER_ADMIN' }
        ]
      }
    });
    
    if (!adminUser) {
      console.log('⚠️ No admin user found for audit logs');
    }
    
    const createdOrders = [];
    
    for (let i = 1; i <= 100; i++) {
      try {
        // Generate random order data
        const customerName = CUSTOMER_NAMES[Math.floor(Math.random() * CUSTOMER_NAMES.length)];
        const customerPhone = PHONE_NUMBERS[Math.floor(Math.random() * PHONE_NUMBERS.length)];
        const deliveryAddress = ADDRESSES[Math.floor(Math.random() * ADDRESSES.length)];
        const deliveryZone = DELIVERY_ZONES[Math.floor(Math.random() * DELIVERY_ZONES.length)];
        const orderStatus = ORDER_STATUSES[Math.floor(Math.random() * ORDER_STATUSES.length)];
        const paymentStatus = PAYMENT_STATUSES[Math.floor(Math.random() * PAYMENT_STATUSES.length)];
        const paymentMethod = PAYMENT_METHODS[Math.floor(Math.random() * PAYMENT_METHODS.length)];
        const createdAt = generateRandomDate();
        
        // Generate random items (1-3 items per order)
        const itemCount = Math.floor(Math.random() * 3) + 1;
        const orderItems = [];
        let subtotal = 0;
        
        for (let j = 0; j < itemCount; j++) {
          const product = products[Math.floor(Math.random() * products.length)];
          const quantity = Math.floor(Math.random() * 3) + 1;
          const itemTotal = product.price * quantity;
          
          orderItems.push({
            productId: product.id,
            quantity: quantity,
            price: product.price
          });
          
          subtotal += itemTotal;
        }
        
        // Calculate delivery fee based on zone
        const deliveryFee = deliveryZone === 'INSIDE_DHAKA' ? 60 : 
                           deliveryZone === 'OUTSIDE_DHAKA' ? 90 : 120;
        const total = subtotal + deliveryFee;
        
        // Create or find customer
        let customer = await prisma.customer.findUnique({
          where: { phone: customerPhone }
        });
        
        if (!customer) {
          customer = await prisma.customer.create({
            data: {
              name: customerName,
              phone: customerPhone,
              email: `${customerName.toLowerCase().replace(' ', '.')}@example.com`,
              address: deliveryAddress,
              city: 'Dhaka'
            }
          });
        }
        
        // Create order
        const order = await prisma.order.create({
          data: {
            orderNumber: generateOrderNumber(),
            customerId: customer.id,
            status: orderStatus,
            paymentStatus: paymentStatus,
            paymentMethod: paymentMethod,
            subtotal: subtotal,
            deliveryFee: deliveryFee,
            discount: 0,
            total: total,
            deliveryZone: deliveryZone,
            deliveryAddress: deliveryAddress,
            recipientName: customerName,
            recipientPhone: customerPhone,
            recipientEmail: customer.email,
            recipientCity: 'Dhaka',
            createdAt: createdAt,
            updatedAt: createdAt,
            items: {
              create: orderItems
            }
          },
          include: {
            customer: true,
            items: {
              include: {
                product: true
              }
            }
          }
        });
        
        // Create audit log if admin user exists
        if (adminUser) {
          await prisma.auditLog.create({
            data: {
              model: 'Order',
              recordId: order.id,
              userId: adminUser.id,
              action: 'CREATE',
              details: {
                orderNumber: order.orderNumber,
                customerName: customerName,
                total: total,
                createdBy: 'test-script'
              },
              createdAt: createdAt
            }
          });
        }
        
        createdOrders.push(order);
        
        if (i % 10 === 0) {
          console.log(`✅ Created ${i}/100 orders...`);
        }
        
      } catch (error) {
        console.error(`❌ Error creating order ${i}:`, error.message);
      }
    }
    
    console.log(`\n🎉 Successfully created ${createdOrders.length}/100 test orders!`);
    
    // Show summary
    const statusCounts = {};
    createdOrders.forEach(order => {
      statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
    });
    
    console.log('\n📊 Order Status Summary:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`  ${status}: ${count} orders`);
    });
    
    const totalValue = createdOrders.reduce((sum, order) => sum + order.total, 0);
    console.log(`\n💰 Total order value: ৳${totalValue.toLocaleString()}`);
    
    console.log('\n✅ Test orders created successfully!');
    console.log('🔄 Check your admin dashboard - orders should appear immediately.');
    
  } catch (error) {
    console.error('❌ Error creating test orders:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestOrders();
