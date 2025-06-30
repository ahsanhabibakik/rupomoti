#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkStockIssue() {
  try {
    console.log('🔍 Investigating stock issue...\n');
    
    // Check stock distribution
    const stockStats = await prisma.product.groupBy({
      by: ['stock'],
      _count: { _all: true },
      orderBy: { stock: 'asc' }
    });
    
    console.log('📊 Stock distribution:');
    stockStats.forEach(stat => {
      console.log(`  Stock ${stat.stock}: ${stat._count._all} products`);
    });
    
    // Check if any products have stock > 0
    const productsWithStock = await prisma.product.count({
      where: {
        stock: { gt: 0 }
      }
    });
    
    console.log(`\n📦 Products with stock > 0: ${productsWithStock}`);
    
    if (productsWithStock > 0) {
      const availableProducts = await prisma.product.findMany({
        where: { stock: { gt: 0 } },
        take: 5,
        select: {
          id: true,
          name: true,
          price: true,
          stock: true
        }
      });
      
      console.log('\n✅ Products with stock available:');
      availableProducts.forEach((product, index) => {
        console.log(`  ${index + 1}. ${product.name} - ৳${product.price} (Stock: ${product.stock})`);
        console.log(`     ID: ${product.id}`);
      });
    } else {
      console.log('\n❌ CRITICAL ISSUE: No products have stock > 0!');
      console.log('This is why orders cannot be placed.');
      console.log('\nSOLUTION: Need to update product stock or disable stock checking.');
    }
    
  } catch (error) {
    console.error('❌ Error checking stock:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkStockIssue();
