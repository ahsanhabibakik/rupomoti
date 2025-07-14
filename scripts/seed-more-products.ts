import { PrismaClient, ProductStatus, ProductDesignType } from '@prisma/client';

const prisma = new PrismaClient();

// All provided image URLs
const allImageUrls = [
  // Piaget URLs (previously added)
  'https://img.piaget.com/mega-menu-panel-1/f39e0c952a51be1dbbfc37a54f9b73d70f9b02f0.jpg',
  'https://img.piaget.com/mega-menu-panel-1/556e3d5f695f7348075ce3e36c32242ebeebf22a.jpg',
  'https://img.piaget.com/mega-menu-panel-1/8a557e1d457dbb082e29f9e7345df070b0437359.jpg',
  'https://img.piaget.com/mega-menu-panel-1/68eea3398d6f86540240991a2f98df63a7d03f67.jpg',
  'https://img.piaget.com/mega-menu-panel-1/5e1ef203aab66d57cab7479d844dc99f0a88274c.jpg',
  
  // BlueStone URLs (newly added)
  'https://kinclimg1.bluestone.com/f_webp,c_scale,w_1024,b_rgb:f0f0f0/giproduct/BIPM0025R22_YAA22XXXXXXXXXXXX_ABCD00-PICS-00001-1024-85126.png',
  'https://kinclimg9.bluestone.com/f_webp,c_scale,w_1024,b_rgb:f0f0f0/giproduct/BIDG0319R180_YAA18DIG6XXXXXXXX_ABCD00-PICS-00001-1024-66194.png',
  'https://kinclimg5.bluestone.com/f_webp,c_scale,w_1024,b_rgb:f0f0f0/giproduct/BIAR0097R13_YAA18DIG6XXXXXXXX_ABCD00-PICS-00001-1024-64527.png',
  'https://kinclimg8.bluestone.com/f_webp,c_scale,w_1024,b_rgb:f0f0f0/giproduct/BISK0368R03_YAA18DIG6XXXXXXXX_ABCD00-PICS-00001-1024-66176.png',
  'https://kinclimg3.bluestone.com/f_webp,c_scale,w_1024,b_rgb:f0f0f0/giproduct/BIAR0097R12_YAA18DIG6XXXXXXXX_ABCD00-PICS-00001-1024-70480.png',
  'https://kinclimg6.bluestone.com/f_webp,c_scale,w_1024,b_rgb:f0f0f0/giproduct/BINK0421R15_YAA18DIG6XXXXXXXX_ABCD00-PICS-00001-1024-90218.png',
  'https://kinclimg2.bluestone.com/f_webp,c_scale,w_1024,b_rgb:f0f0f0/giproduct/BIVT0084R23_YAA18DIG6XXXXXXXX_ABCD00-PICS-00001-1024-65653.png',
  'https://kinclimg1.bluestone.com/f_webp,c_scale,w_1024,b_rgb:f0f0f0/giproduct/BISP0419R21_YAA18DIG6XXXXXXXX_ABCD00-PICS-00001-1024-66188.png',
  'https://kinclimg9.bluestone.com/f_webp,c_scale,w_1024,b_rgb:f0f0f0/giproduct/BIPO0725R02_YAA18DIG6XXXXXXXX_ABCD00-PICS-00001-1024-66181.png',
  'https://kinclimg1.bluestone.com/f_webp,c_scale,w_1024,b_rgb:f0f0f0/giproduct/BICM0339R23_YAA18DIG6XXXXXXXX_ABCD00-PICS-00001-1024-71757.png',
  'https://kinclimg3.bluestone.com/f_webp,c_scale,w_1024,b_rgb:f0f0f0/giproduct/BIVT0084R09_YAA18DIG6XXXXXXXX_ABCD00-PICS-00001-1024-11662.png',
  'https://kinclimg1.bluestone.com/f_webp,c_scale,w_1024,b_rgb:f0f0f0/giproduct/BIPO0778R20_YAA18DIG6XXXXXXXX_ABCD00-PICS-00001-1024-70487.png',
  'https://kinclimg6.bluestone.com/f_webp,c_scale,w_1024,b_rgb:f0f0f0/giproduct/BIJP0630R04_YAA18DIG6XXXXXXXX_ABCD00-PICS-00001-1024-65668.png',
  'https://kinclimg1.bluestone.com/f_webp,c_scale,w_1024,b_rgb:f0f0f0/giproduct/BISS0103R657_YAA18DIG6XXXXXXXX_ABCD00-PICS-00001-1024-85156.png',
  'https://kinclimg0.bluestone.com/f_webp,c_scale,w_1024,b_rgb:f0f0f0/giproduct/BIDG0319R189_YAA18DIG6XXXXXXXX_ABCD00-PICS-00001-1024-68693.png',
  'https://kinclimg9.bluestone.com/f_webp,c_scale,w_1024,b_rgb:f0f0f0/giproduct/BIPO0778R27_YAA18DIG6XXXXXXXX_ABCD00-PICS-00001-1024-72169.png',
  'https://kinclimg1.bluestone.com/f_webp,c_scale,w_1024,b_rgb:f0f0f0/giproduct/BISP0419R11_YAA18DIG6XXXXXXXX_ABCD00-PICS-00001-1024-71101.png',
  'https://kinclimg6.bluestone.com/f_webp,c_scale,w_1024,b_rgb:f0f0f0/giproduct/BIRS0388R01_YAA18DIG6XXXXXXXX_ABCD00-PICS-00001-1024-92611.png',
  'https://kinclimg7.bluestone.com/f_webp,c_scale,w_1024,b_rgb:f0f0f0/giproduct/BISP0359R10_YAA18DIG6XXXXXXXX_ABCD00-PICS-00001-1024-65658.png',
  'https://kinclimg0.bluestone.com/f_webp,c_scale,w_1024,b_rgb:f0f0f0/giproduct/BISP0103R661_YAA18DIG6XXXXXXXX_ABCD00-PICS-00001-1024-85111.png'
];

// Enhanced product templates
const enhancedProductTemplates = [
  { name: 'Diamond Solitaire Ring', desc: 'Classic diamond solitaire ring with brilliant cut stone and platinum setting', basePrice: 45000, category: 'rings' },
  { name: 'Pearl Strand Necklace', desc: 'Elegant cultured pearl necklace with gold clasp', basePrice: 32000, category: 'necklaces' },
  { name: 'Ruby Drop Earrings', desc: 'Stunning ruby drop earrings with diamond accents', basePrice: 28000, category: 'earrings' },
  { name: 'Diamond Tennis Bracelet', desc: 'Sparkling diamond tennis bracelet in white gold', basePrice: 55000, category: 'bracelets' },
  { name: 'Bridal Jewelry Set', desc: 'Complete bridal set with necklace, earrings, and bracelet', basePrice: 85000, category: 'jewelry-sets' },
  { name: 'Emerald Cocktail Ring', desc: 'Bold emerald cocktail ring with vintage design', basePrice: 38000, category: 'rings' },
  { name: 'Gold Chain Necklace', desc: 'Delicate gold chain necklace perfect for layering', basePrice: 22000, category: 'necklaces' },
  { name: 'Diamond Stud Earrings', desc: 'Classic diamond stud earrings in platinum', basePrice: 25000, category: 'earrings' },
  { name: 'Charm Bracelet', desc: 'Customizable charm bracelet with initial charms', basePrice: 18000, category: 'bracelets' },
  { name: 'Wedding Ring Set', desc: 'Matching wedding bands for couples', basePrice: 65000, category: 'wedding-collection' },
  { name: 'Sapphire Pendant', desc: 'Royal blue sapphire pendant with gold chain', basePrice: 35000, category: 'necklaces' },
  { name: 'Rose Gold Hoops', desc: 'Modern rose gold hoop earrings', basePrice: 15000, category: 'earrings' },
  { name: 'Anniversary Band', desc: 'Diamond anniversary band in white gold', basePrice: 42000, category: 'rings' },
  { name: 'Statement Necklace', desc: 'Bold statement necklace for special occasions', basePrice: 48000, category: 'necklaces' },
  { name: 'Bangles Set', desc: 'Set of three matching gold bangles', basePrice: 35000, category: 'bracelets' },
  { name: 'Vintage Brooch', desc: 'Art deco inspired vintage brooch with crystals', basePrice: 12000, category: 'jewelry-sets' },
  { name: 'Tennis Necklace', desc: 'Diamond tennis necklace for elegant occasions', basePrice: 68000, category: 'necklaces' },
  { name: 'Stackable Rings', desc: 'Set of delicate stackable rings', basePrice: 24000, category: 'rings' },
  { name: 'Pearl Earrings', desc: 'Classic pearl earrings with gold posts', basePrice: 16000, category: 'earrings' },
  { name: 'Infinity Bracelet', desc: 'Symbolic infinity bracelet in rose gold', basePrice: 20000, category: 'bracelets' }
];

async function seedMoreProducts() {
  try {
    console.log('🚀 Adding more products with high-quality images...');

    // Get existing categories
    const categories = await prisma.category.findMany();
    const categoryMap = new Map(categories.map(cat => [cat.slug, cat.id]));

    console.log(`📂 Found ${categories.length} categories`);

    let imageIndex = 0;
    let createdCount = 0;

    // Create 50+ products
    for (let i = 0; i < 50; i++) {
      const template = enhancedProductTemplates[i % enhancedProductTemplates.length];
      const categoryId = categoryMap.get(template.category);
      
      if (!categoryId) {
        console.log(`⚠️ Category not found: ${template.category}, skipping...`);
        continue;
      }

      // Get 3-4 images for each product
      const productImages = [];
      for (let j = 0; j < 4; j++) {
        if (imageIndex < allImageUrls.length) {
          productImages.push(allImageUrls[imageIndex]);
          imageIndex++;
        }
      }
      
      // Reset image index if we run out
      if (imageIndex >= allImageUrls.length) {
        imageIndex = 0;
      }

      // Generate unique SKU and slug
      const uniqueId = i + 100; // Start from 100 to avoid conflicts
      const sku = `RJ${String(uniqueId).padStart(4, '0')}`;
      const slug = `${template.name.toLowerCase().replace(/\s+/g, '-')}-${uniqueId}`;

      try {
        const product = await prisma.product.create({
          data: {
            name: `${template.name} ${uniqueId}`,
            slug,
            description: `${template.desc}. Handcrafted with precision and attention to detail. Made with premium materials and guaranteed quality.`,
            sku,
            price: template.basePrice + (Math.random() * 30000 - 15000), // More variation
            salePrice: template.basePrice * 0.9, // 10% discount
            categoryId,
            status: ProductStatus.ACTIVE,
            designType: i % 2 === 0 ? ProductDesignType.REGULAR : ProductDesignType.LANDING_PAGE,
            images: productImages,
            stock: Math.floor(Math.random() * 100) + 20, // 20-120 stock
            isFeatured: i < 12, // First 12 products are featured
            isNewArrival: i >= 40, // Last 10 are new arrivals
            isPopular: i >= 20 && i < 35, // Middle ones are popular
            weight: Math.floor(Math.random() * 100) + 5, // 5-105 grams
            material: ['Gold', 'Silver', 'Platinum', 'Rose Gold'][i % 4],
            care: 'Clean with soft cloth, store in dry place, avoid chemicals',
            metaTitle: `${template.name} - Premium Jewelry | Rupomoti`,
            metaDescription: `Buy ${template.name} online at Rupomoti. ${template.desc}. Premium quality, fast delivery, lifetime warranty.`,
            metaKeywords: `${template.name.toLowerCase()}, jewelry, ${template.category}, rupomoti, premium, luxury`
          }
        });

        createdCount++;
        console.log(`✅ Product ${createdCount}/50: ${product.name}`);
      } catch (error) {
        console.error(`❌ Failed to create product ${template.name} ${uniqueId}:`, error);
      }
    }

    // Update hero slider with banner images
    console.log('🖼️ Updating hero slider with banner images...');
    
    const bannerImages = [
      'https://kinclimg0.bluestone.com/f_webp,c_scale,w_3020,b_rgb:ffffff/product/dynamic_banner/desktop/browse/1720023543708-DesktopbrowsePagetopwidget.jpg',
      'https://kinclimg7.bluestone.com/f_webp,c_scale,w_744,b_rgb:ffffff/product/dynamic_banner/desktop/widget/1741710257514-Barbie_Desktop_widget_banner.jpg',
      'https://kinclimg5.bluestone.com/f_webp,c_scale,w_744,b_rgb:ffffff/product/dynamic_banner/desktop/widget/1738339971356-Desktopbrowse.jpg',
      'https://kinclimg7.bluestone.com/f_webp,c_scale,w_744,b_rgb:ffffff/product/dynamic_banner/desktop/widget/1729779058896-DesktopBrowsePage.jpg',
      'https://kinclimg5.bluestone.com/f_webp,c_scale,w_744,b_rgb:ffffff/product/dynamic_banner/desktop/widget/1723480501191-DesktopWidgetPage.jpg'
    ];

    // Clear existing hero slides
    await prisma.media.deleteMany({
      where: { section: 'hero-slider' }
    });

    // Create new hero slides
    for (let i = 0; i < bannerImages.length; i++) {
      await prisma.media.create({
        data: {
          name: `Hero Banner ${i + 1}`,
          url: bannerImages[i],
          alt: `Rupomoti Jewelry Collection ${i + 1}`,
          type: 'image/jpeg',
          section: 'hero-slider',
          position: i + 1,
          isActive: true,
          metadata: {
            link: '/shop',
            cta: 'Shop Now',
            title: i === 0 ? 'Discover Luxury Jewelry' : `Collection ${i + 1}`,
            subtitle: 'Handcrafted with perfection'
          }
        }
      });
    }

    // Get final stats
    const stats = {
      totalProducts: await prisma.product.count(),
      totalCategories: await prisma.category.count(),
      totalMedia: await prisma.media.count(),
      featuredProducts: await prisma.product.count({ where: { isFeatured: true } }),
      popularProducts: await prisma.product.count({ where: { isPopular: true } }),
      newArrivals: await prisma.product.count({ where: { isNewArrival: true } })
    };

    console.log('📊 Final Statistics:');
    console.log(`- Total Products: ${stats.totalProducts}`);
    console.log(`- Featured Products: ${stats.featuredProducts}`);
    console.log(`- Popular Products: ${stats.popularProducts}`);
    console.log(`- New Arrivals: ${stats.newArrivals}`);
    console.log(`- Categories: ${stats.totalCategories}`);
    console.log(`- Media Items: ${stats.totalMedia}`);

    console.log('🎉 Successfully added more products and updated media!');

  } catch (error) {
    console.error('❌ Error seeding more products:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding
if (require.main === module) {
  seedMoreProducts()
    .then(() => {
      console.log('✨ More products seeding completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ More products seeding failed:', error);
      process.exit(1);
    });
}

export { seedMoreProducts };
