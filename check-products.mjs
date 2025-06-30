#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkProducts() {
  try {
    console.log('🔍 Checking products...\n');
    
    // Get total products count
    const totalProducts = await prisma.product.count();
    console.log(`📊 Total products: ${totalProducts}`);
    
    if (totalProducts === 0) {
      console.log('❌ No products found! This could be why orders are failing.');
      return;
    }
    
    // Get a few products to use for testing
    const products = await prisma.product.findMany({
      take: 5,
      select: {
        id: true,
        name: true,
        price: true,
        stock: true
      }
    });
    
    console.log('\n📦 Sample products for testing:');
    products.forEach((product, index) => {
      console.log(`  ${index + 1}. ${product.name} - ৳${product.price} (Stock: ${product.stock})`);
      console.log(`     ID: ${product.id}`);
    });
    
    if (products.length > 0) {
      console.log('\n✅ Products exist! You can use these IDs for testing orders.');
      console.log(`\nTest order JSON with real product:`);
      console.log(JSON.stringify({
        recipientName: "Test Customer",
        recipientPhone: "01712345678",
        recipientEmail: "test@example.com",
        recipientCity: "Dhaka",
        recipientZone: "Dhanmondi",
        recipientArea: "",
        deliveryAddress: "123 Test Street, Dhanmondi, Dhaka",
        orderNote: "Test order",
        deliveryZone: "INSIDE_DHAKA",
        items: [{
          productId: products[0].id,
          name: products[0].name,
          price: products[0].price,
          quantity: 1,
          image: "/placeholder.jpg"
        }],
        subtotal: products[0].price,
        deliveryFee: 60,
        total: products[0].price + 60,
        paymentMethod: "CASH_ON_DELIVERY",
        userId: null
      }, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error checking products:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProducts();
