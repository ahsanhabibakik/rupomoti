import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedReviews() {
  console.log('⭐ Seeding reviews...');

  // First, let's get some products and users to create reviews for
  const products = await prisma.product.findMany({
    take: 5,
    select: { id: true, name: true }
  });

  const users = await prisma.user.findMany({
    take: 5,
    select: { id: true, name: true }
  });

  if (products.length === 0) {
    console.log('❌ No products found. Please seed products first.');
    return;
  }

  if (users.length === 0) {
    console.log('❌ No users found. Please seed users first.');
    return;
  }

  const reviewTexts = [
    'Excellent product! Really happy with the quality and craftsmanship.',
    'Beautiful design and fast shipping. Highly recommend!',
    'Good value for money. The product looks exactly as described.',
    'Amazing quality! This exceeded my expectations.',
    'The product is okay but could be better. Average quality.',
    'Outstanding! This is exactly what I was looking for.',
    'Very disappointed with the quality. Not worth the price.',
    'Perfect gift for my wife. She absolutely loved it!',
    'Great customer service and beautiful product.',
    'This product is amazing! Would definitely buy again.',
    'Good quality but took longer to deliver than expected.',
    'Beautiful craftsmanship and attention to detail.',
    'Not satisfied with the product. Quality could be better.',
    'Excellent purchase! Highly recommended.',
    'The product is fine but nothing special.',
  ];

  const reviews = [];

  for (let i = 0; i < 15; i++) {
    const product = products[Math.floor(Math.random() * products.length)];
    const user = users[Math.floor(Math.random() * users.length)];
    const rating = Math.floor(Math.random() * 5) + 1; // 1-5 stars
    const reviewText = reviewTexts[i];
    
    // Create different statuses
    let status;
    if (i < 5) {
      status = 'PENDING';
    } else if (i < 12) {
      status = 'APPROVED';
    } else {
      status = 'REJECTED';
    }

    reviews.push({
      rating,
      comment: reviewText,
      status,
      productId: product.id,
      userId: user.id,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date in last 30 days
    });
  }

  for (const review of reviews) {
    try {
      await prisma.review.create({
        data: review
      });
      console.log(`✅ Created review: ${review.rating} stars - ${review.status}`);
    } catch (error) {
      console.error('❌ Error creating review:', error);
    }
  }

  console.log('🎉 Reviews seeding completed!');
}

seedReviews()
  .catch((error) => {
    console.error('❌ Error seeding reviews:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('✨ Reviews seed script completed successfully!');
  });
