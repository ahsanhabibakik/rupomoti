#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixStockIssue() {
  try {
    console.log('🔧 Fixing stock issue...\n');
    
    // First, check how many products have null stock
    const productsWithNullStock = await prisma.product.count({
      where: {
        stock: null
      }
    });
    
    console.log(`📊 Products with null stock: ${productsWithNullStock}`);
    
    // Update all products with null stock to have stock = 10
    const updateResult = await prisma.product.updateMany({
      where: {
        stock: null
      },
      data: {
        stock: 10
      }
    });
    
    console.log(`✅ Updated ${updateResult.count} products to have stock = 10`);
    
    // Also update products with 0 stock to have some stock
    const updateZeroStock = await prisma.product.updateMany({
      where: {
        stock: 0
      },
      data: {
        stock: 5
      }
    });
    
    console.log(`✅ Updated ${updateZeroStock.count} products from 0 stock to 5 stock`);
    
    // Verify the fix
    const productsWithStock = await prisma.product.count({
      where: {
        stock: { gt: 0 }
      }
    });
    
    console.log(`\n📦 Products with stock > 0 after fix: ${productsWithStock}`);
    
    // Get a sample of updated products
    const sampleProducts = await prisma.product.findMany({
      take: 5,
      where: { stock: { gt: 0 } },
      select: {
        id: true,
        name: true,
        price: true,
        stock: true
      }
    });
    
    console.log('\n📦 Sample products with stock:');
    sampleProducts.forEach((product, index) => {
      console.log(`  ${index + 1}. ${product.name} - ৳${product.price} (Stock: ${product.stock})`);
    });
    
    console.log('\n✅ Stock issue fixed! Orders should now work.');
    
  } catch (error) {
    console.error('❌ Error fixing stock:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixStockIssue();
