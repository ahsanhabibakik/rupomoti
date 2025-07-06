const { PrismaClient } = require('@prisma/client');

async function testPrismaConnection() {
  console.log('🔍 Testing Prisma connection...');
  
  try {
    const prisma = new PrismaClient();
    
    // Test basic connection
    const userCount = await prisma.user.count();
    console.log('✅ Prisma connection successful');
    console.log(`📊 User count: ${userCount}`);
    
    // Test order count
    const orderCount = await prisma.order.count();
    console.log(`📦 Order count: ${orderCount}`);
    
    // Test wishlist items
    const wishlistCount = await prisma.wishlistItem.count();
    console.log(`❤️ Wishlist items count: ${wishlistCount}`);
    
    await prisma.$disconnect();
    console.log('🔌 Prisma disconnected');
    
  } catch (error) {
    console.error('❌ Prisma connection failed:', error);
    process.exit(1);
  }
}

testPrismaConnection();
