import { prisma } from '@/lib/prisma';

async function testMediaAPI() {
  try {
    console.log('Testing media API...');
    
    // Check if any media exists
    const existingMedia = await prisma.media.findMany();
    console.log('Existing media count:', existingMedia.length);
    
    // Check if hero-slider section exists
    const heroSlides = await prisma.media.findMany({
      where: { section: 'hero-slider' },
      orderBy: { position: 'asc' }
    });
    console.log('Hero slider count:', heroSlides.length);
    
    if (heroSlides.length === 0) {
      console.log('No hero slides found. Creating sample entries...');
      
      // Create sample hero slides
      for (let i = 1; i <= 3; i++) {
        await prisma.media.create({
          data: {
            name: `Sample Hero Slide ${i}`,
            url: `/images/hero/slider${i}.jpeg`,
            alt: `Hero slide ${i}`,
            type: 'image/jpeg',
            section: 'hero-slider',
            position: i,
            isActive: true,
            metadata: {
              link: '/shop',
              cta: 'Shop Now'
            }
          }
        });
      }
      console.log('Sample hero slides created');
    }
    
    console.log('Media API test completed successfully');
  } catch (error) {
    console.error('Media API test failed:', error);
  }
}

// Export as default function
export default testMediaAPI;

// Run if called directly
if (require.main === module) {
  testMediaAPI().finally(() => process.exit(0));
}
