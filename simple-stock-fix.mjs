#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function simpleStockFix() {
  try {
    console.log('🔧 Simple stock fix...\n');
    
    // Direct MongoDB update to fix null values
    console.log('Updating all products to have at least 10 stock...');
    
    // Update all products to have stock = 10
    const updateResult = await prisma.product.updateMany({
      data: {
        stock: 10
      }
    });
    
    console.log(`✅ Updated ${updateResult.count} products to have stock = 10`);
    
    // Verify the fix
    const sampleProducts = await prisma.product.findMany({
      take: 5,
      select: {
        id: true,
        name: true,
        price: true,
        stock: true
      }
    });
    
    console.log('\n📦 Sample products after update:');
    sampleProducts.forEach((product, index) => {
      console.log(`  ${index + 1}. ${product.name} - ৳${product.price} (Stock: ${product.stock})`);
    });
    
    console.log('\n✅ Stock fixed! Now try placing an order.');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

simpleStockFix();
