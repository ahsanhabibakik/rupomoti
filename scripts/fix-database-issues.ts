import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixDatabaseIssues() {
  try {
    console.log('🔧 Starting database issues fix...');
    
    // 1. Create default category first
    let defaultCategory = await prisma.category.findFirst({
      where: { slug: 'uncategorized' }
    });
    
    if (!defaultCategory) {
      console.log('Creating default "Uncategorized" category...');
      defaultCategory = await prisma.category.create({
        data: {
          name: 'Uncategorized',
          slug: 'uncategorized',
          description: 'Products without a specific category',
          isActive: true,
          sortOrder: 999
        }
      });
    }
    
    // 2. Clear all existing data to start fresh
    console.log('🗑️ Clearing existing data for fresh start...');
    
    try {
      await prisma.orderItem.deleteMany({});
      console.log('✅ Cleared order items');
    } catch (error) {
      console.log('⚠️ Could not clear order items');
    }
    
    try {
      await prisma.order.deleteMany({});
      console.log('✅ Cleared orders');
    } catch (error) {
      console.log('⚠️ Could not clear orders');
    }
    
    try {
      await prisma.product.deleteMany({});
      console.log('✅ Cleared products');
    } catch (error) {
      console.log('⚠️ Could not clear products');
    }
    
    try {
      await prisma.review.deleteMany({});
      console.log('✅ Cleared reviews');
    } catch (error) {
      console.log('⚠️ Could not clear reviews');
    }
    
    try {
      await prisma.wishlistItem.deleteMany({});
      console.log('✅ Cleared wishlist items');
    } catch (error) {
      console.log('⚠️ Could not clear wishlist items');
    }
    
    // 3. Verify cleanup
    console.log('🔍 Verifying cleanup...');
    
    const productCount = await prisma.product.count();
    const categoryCount = await prisma.category.count();
    const orderCount = await prisma.order.count();
    const orderItemCount = await prisma.orderItem.count();
    
    console.log('📊 Database statistics after cleanup:');
    console.log(`- Products: ${productCount}`);
    console.log(`- Categories: ${categoryCount}`);
    console.log(`- Orders: ${orderCount}`);
    console.log(`- Order Items: ${orderItemCount}`);
    
    console.log('🎉 Database cleanup completed successfully!');
    console.log('📝 Now you can run the seed scripts to populate with fresh data.');
    
  } catch (error) {
    console.error('❌ Error fixing database issues:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
if (require.main === module) {
  fixDatabaseIssues()
    .then(() => {
      console.log('✨ Database fix completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Database fix failed:', error);
      process.exit(1);
    });
}

export { fixDatabaseIssues };
