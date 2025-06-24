import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function assignUniqueSkus() {
  try {
    const allProducts = await prisma.product.findMany();
    const productsToUpdate = allProducts.filter(p => !p.sku);

    if (productsToUpdate.length === 0) {
      console.log('No products found without an SKU. Nothing to do.');
      return;
    }

    console.log(`Found ${productsToUpdate.length} products without an SKU. Assigning unique SKUs...`);

    for (const product of productsToUpdate) {
      const uniqueSku = `SKU-${product.id.slice(-6).toUpperCase()}`;
      await prisma.product.update({
        where: { id: product.id },
        data: { sku: uniqueSku },
      });
      console.log(`Assigned SKU ${uniqueSku} to product ${product.name} (ID: ${product.id})`);
    }

    console.log('Successfully assigned unique SKUs to all products without an SKU.');
  } catch (error) {
    console.error('Error assigning unique SKUs:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

assignUniqueSkus(); 