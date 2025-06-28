// Run this script with: node scripts/fix-orders-deletedAt.js
// It will set deletedAt: null for all orders where deletedAt is missing.

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Find all orders where deletedAt is missing (undefined)
  const orders = await prisma.order.findMany({
    where: {
      deletedAt: { equals: undefined },
    },
    select: { id: true },
  });

  console.log(`Found ${orders.length} orders with missing deletedAt field.`);

  for (const order of orders) {
    await prisma.order.update({
      where: { id: order.id },
      data: { deletedAt: null },
    });
    console.log(`Updated order ${order.id}`);
  }

  console.log('All orders updated.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
