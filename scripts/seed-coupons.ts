import { PrismaClient, CouponType } from '@prisma/client';

const prisma = new PrismaClient();

async function seedCoupons() {
  console.log('🎟️ Seeding coupons...');

  const coupons = [
    {
      code: 'WELCOME10',
      type: CouponType.PERCENTAGE,
      value: 10,
      description: 'Welcome 10% discount for new customers',
      minimumAmount: 50,
      isActive: true,
      usageLimit: 1000,
      usedCount: 0,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
    {
      code: 'SAVE20',
      type: CouponType.PERCENTAGE,
      value: 20,
      description: '20% off on orders above $100',
      minimumAmount: 100,
      isActive: true,
      usageLimit: 500,
      usedCount: 0,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
    },
    {
      code: 'FIXED50',
      type: CouponType.FIXED_AMOUNT,
      value: 50,
      description: '$50 off on orders above $200',
      minimumAmount: 200,
      isActive: true,
      usageLimit: 100,
      usedCount: 0,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
    },
    {
      code: 'EXPIRED10',
      type: CouponType.PERCENTAGE,
      value: 10,
      description: 'Expired test coupon',
      minimumAmount: 30,
      isActive: false,
      usageLimit: 100,
      usedCount: 50,
      validFrom: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
      validUntil: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    },
    {
      code: 'BIGDEAL',
      type: CouponType.PERCENTAGE,
      value: 25,
      description: 'Big deal 25% off for premium customers',
      minimumAmount: 150,
      isActive: true,
      usageLimit: 50,
      usedCount: 0,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
    }
  ];

  for (const coupon of coupons) {
    try {
      const existingCoupon = await prisma.coupon.findUnique({
        where: { code: coupon.code }
      });

      if (existingCoupon) {
        console.log(`⏭️  Coupon "${coupon.code}" already exists, skipping...`);
        continue;
      }

      await prisma.coupon.create({
        data: coupon
      });

      console.log(`✅ Created coupon: ${coupon.code}`);
    } catch (error) {
      console.error(`❌ Error creating coupon ${coupon.code}:`, error);
    }
  }

  console.log('🎉 Coupons seeding completed!');
}

seedCoupons()
  .catch((error) => {
    console.error('❌ Error seeding coupons:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('✨ Coupons seed script completed successfully!');
  });
