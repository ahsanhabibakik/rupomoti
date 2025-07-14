import { PrismaClient, Role, ProductStatus, ProductDesignType } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

// Provided image URLs
const imageUrls = [
  'https://img.piaget.com/mega-menu-panel-1/f39e0c952a51be1dbbfc37a54f9b73d70f9b02f0.jpg',
  'https://img.piaget.com/mega-menu-panel-1/556e3d5f695f7348075ce3e36c32242ebeebf22a.jpg',
  'https://img.piaget.com/mega-menu-panel-1/8a557e1d457dbb082e29f9e7345df070b0437359.jpg',
  'https://img.piaget.com/mega-menu-panel-1/68eea3398d6f86540240991a2f98df63a7d03f67.jpg',
  'https://img.piaget.com/mega-menu-panel-1/5e1ef203aab66d57cab7479d844dc99f0a88274c.jpg',
  'https://img.piaget.com/mega-menu-panel-1/d28c9db7aa85bb2bb45be1c03d9f3e9811f37df2.jpg',
  'https://img.piaget.com/mega-menu-panel-1/15287e5f40f456e3a546d431287a556cea96dd0e.jpg',
  'https://img.piaget.com/mega-menu-panel-1/1745945d0e91748307d1d93d8cccb8a1c03571fa.jpg',
  'https://img.piaget.com/mega-menu-panel-1/d89181eca028bc7a49d3b037dadc3f8ce7d0448a.jpg',
  'https://img.piaget.com/mega-menu-panel-1/e484344f99703aed30ec5d4453b17be786f8234a.jpg',
  'https://img.piaget.com/mega-menu-panel-1/fff1d8b54db165b7da45e892953beed7b4054159.jpg',
  'https://img.piaget.com/mega-menu-panel-1/ca30e0250d5ca17746a950070d51783bbb424e37.jpg',
  'https://img.piaget.com/mega-menu-panel-1/deb56d22b1bac9da569e80a415c68261ddced519.jpg',
  'https://img.piaget.com/mega-menu-panel-1/7896d59b5527e2c4c4b1ef8f59df9189e15cada1.jpg',
  'https://img.piaget.com/mega-menu-panel-1/a769cd1c00ecf5f0d9dd447ec15ecfd60bcbcc86.jpg',
  'https://img.piaget.com/mega-menu-panel-1/92f067a2a9e505f73527fd4dd95ab4a64f559fc7.jpg',
  'https://img.piaget.com/mega-menu-panel-1/8cabefb06ed69f706c3ca5fdffa186e0db9cedbb.jpg',
  'https://img.piaget.com/mega-menu-panel-1/af802b91b7871297e858eea3a24497e65fe05b5d.jpg',
  'https://img.piaget.com/mega-menu-panel-1/47e4b9f5631c382c15acd1775f77904c08edeb7d.jpg',
  'https://img.piaget.com/mega-menu-panel-1/1ff194f3d05ddc81c1ea31c95e496996ad76ef2a.jpg',
  'https://img.piaget.com/mega-menu-panel-1/7f6bb2ea676409193270ca5d55a5fca52ba1e87e.jpg',
  'https://img.piaget.com/mega-menu-panel-1/b0ce176004c183f49d27337002def5be394cd1dc.jpg',
  'https://img.piaget.com/mega-menu-panel-1/ef920e01adb9d8d4b5ad6fd9b5264d79320a1f4c.jpg',
  'https://img.piaget.com/mega-menu-panel-1/22461523df18b3fe385c502dbbb228272e4b8cef.jpg',
  'https://img.piaget.com/mega-menu-panel-1/dab1133eebea6c1be874224e72bc525f46129415.jpg',
  'https://img.piaget.com/mega-menu-panel-1/b606517713f48b85e44a2772088ee441d0d37041.jpg',
  'https://img.piaget.com/mega-menu-panel-1/5723470f99c003f7b76b6e1fb648df0692fe45cc.jpg',
  'https://img.piaget.com/mega-menu-panel-1/1e521d7dc57cbaeb6a70bb298d024573f25cc7bc.jpg',
  'https://img.piaget.com/mega-menu-panel-1/98ce3ce86477d1ead57923b4c61c187addcbcbe4.jpg',
  'https://img.piaget.com/mega-menu-panel-1/66db2b06dae29aba09041a8e9bd336ab069db109.jpg',
  'https://img.piaget.com/mega-menu-panel-1/d75ca8d956b4397744d7cf79eef8036e3b9a13ef.jpg',
  'https://img.piaget.com/mega-menu-panel-1/260f907761475103bbf72c23b90fa5bb4e746d2a.jpg',
  'https://img.piaget.com/mega-menu-panel-1/13a0fa85a5ab98a4f6c9db108cf5b3ba76fd2ab7.jpg',
  'https://img.piaget.com/mega-menu-panel-1/13932c8efc6d75ca53a29341e3f815a82efd34ca.jpg',
  'https://img.piaget.com/mega-menu-panel-1/df019c5d815f244baf3bd3b0e72b7e9436c09a0f.jpg',
  'https://img.piaget.com/mega-menu-panel-1/c39134a248216332f53faa3c64d148e57c17a64b.jpg',
  'https://img.piaget.com/mega-menu-panel-1/54091e0acf7949a520e73513c6749c9647c47077.jpg',
  'https://img.piaget.com/mega-menu-panel-1/49ff49ced1107ec69e4067ddbbdf3df86083264e.jpg',
  'https://img.piaget.com/mega-menu-panel-1/0c0b7a97d026d79690bf082f78ea1fba0d50df92.jpg',
  'https://img.piaget.com/mega-menu-panel-1/f2174d52ff19a71cec6a0c4dd0285258cb7eb8bb.jpg',
  'https://img.piaget.com/mega-menu-panel-1/32b7bf16d10dc755b30b6f6fec18c15c1bdd9bf3.jpg',
  'https://img.piaget.com/mega-menu-panel-1/1e3fdf67af5d0616e3278e534d5405a528d55daf.jpg',
  'https://img.piaget.com/mega-menu-panel-1/384d2dcb55b9833116f06d2b748fe864bde3b162.jpg',
  'https://img.piaget.com/mega-menu-panel-1/2b2099b4a47fa253cb3cf4076f35c464c6b27aa5.jpg',
  'https://img.piaget.com/mega-menu-panel-1/6f68d6645c8f7540b0e0bdd6abffd22a512f8eca.jpg',
  'https://img.piaget.com/mega-menu-panel-1/ff85e1bf92a5b55cec3be04853e54cc18036c088.jpg'
];

// Categories data
const categories = [
  {
    name: 'Rings',
    slug: 'rings',
    description: 'Elegant and stunning ring collection for every occasion',
    isActive: true,
    sortOrder: 1,
    metaTitle: 'Ring Collection - Rupomoti Jewelry',
    metaDescription: 'Discover our beautiful collection of rings. From engagement rings to fashion rings, find the perfect piece.'
  },
  {
    name: 'Necklaces',
    slug: 'necklaces',
    description: 'Beautiful necklaces to complement any outfit',
    isActive: true,
    sortOrder: 2,
    metaTitle: 'Necklace Collection - Rupomoti Jewelry',
    metaDescription: 'Explore our exquisite necklace collection. From delicate chains to statement pieces.'
  },
  {
    name: 'Earrings',
    slug: 'earrings',
    description: 'Stunning earring designs for every style',
    isActive: true,
    sortOrder: 3,
    metaTitle: 'Earring Collection - Rupomoti Jewelry',
    metaDescription: 'Browse our diverse earring collection. From subtle studs to dramatic drops.'
  },
  {
    name: 'Bracelets',
    slug: 'bracelets',
    description: 'Elegant bracelet designs to adorn your wrists',
    isActive: true,
    sortOrder: 4,
    metaTitle: 'Bracelet Collection - Rupomoti Jewelry',
    metaDescription: 'Discover our bracelet collection. From tennis bracelets to charm bracelets.'
  },
  {
    name: 'Jewelry Sets',
    slug: 'jewelry-sets',
    description: 'Complete jewelry sets for a coordinated look',
    isActive: true,
    sortOrder: 5,
    metaTitle: 'Jewelry Sets - Rupomoti Jewelry',
    metaDescription: 'Shop our jewelry sets for a perfectly coordinated look. Complete sets for every occasion.'
  },
  {
    name: 'Wedding Collection',
    slug: 'wedding-collection',
    description: 'Special pieces for your most important day',
    isActive: true,
    sortOrder: 6,
    metaTitle: 'Wedding Jewelry - Rupomoti Jewelry',
    metaDescription: 'Celebrate your special day with our wedding jewelry collection.'
  }
];

// Product names and descriptions
const productTemplates = [
  { name: 'Diamond Solitaire Ring', desc: 'Classic diamond solitaire ring with brilliant cut', basePrice: 35000 },
  { name: 'Gold Pearl Necklace', desc: 'Elegant pearl necklace with gold accents', basePrice: 28000 },
  { name: 'Rose Gold Earrings', desc: 'Beautiful rose gold drop earrings', basePrice: 15000 },
  { name: 'Tennis Bracelet', desc: 'Sparkling diamond tennis bracelet', basePrice: 42000 },
  { name: 'Wedding Ring Set', desc: 'Matching wedding ring set for couples', basePrice: 65000 },
  { name: 'Emerald Pendant', desc: 'Stunning emerald pendant with gold chain', basePrice: 32000 },
  { name: 'Sapphire Ring', desc: 'Royal blue sapphire ring with diamond halo', basePrice: 38000 },
  { name: 'Pearl Stud Earrings', desc: 'Classic pearl stud earrings', basePrice: 12000 },
  { name: 'Gold Chain Bracelet', desc: 'Delicate gold chain bracelet', basePrice: 18000 },
  { name: 'Bridal Jewelry Set', desc: 'Complete bridal set with necklace and earrings', basePrice: 55000 },
  { name: 'Ruby Ring', desc: 'Passionate ruby ring with gold band', basePrice: 30000 },
  { name: 'Diamond Necklace', desc: 'Luxurious diamond necklace', basePrice: 75000 },
  { name: 'Hoop Earrings', desc: 'Modern gold hoop earrings', basePrice: 14000 },
  { name: 'Charm Bracelet', desc: 'Customizable charm bracelet', basePrice: 22000 },
  { name: 'Anniversary Ring', desc: 'Special anniversary diamond ring', basePrice: 45000 }
];

async function seedCompleteData() {
  try {
    console.log('🌱 Starting complete data seeding...');

    // 1. Create admin user
    console.log('👤 Creating admin user...');
    const hashedPassword = await hash('admin123', 12);
    
    const admin = await prisma.user.upsert({
      where: { email: 'admin@rupomoti.com' },
      update: {
        role: Role.ADMIN,
        isAdmin: true,
      },
      create: {
        email: 'admin@rupomoti.com',
        name: 'Admin',
        password: hashedPassword,
        role: Role.ADMIN,
        isAdmin: true,
        emailVerified: new Date(),
      },
    });

    console.log('✅ Admin user created:', admin.email);

    // 2. Create categories
    console.log('📂 Creating categories...');
    const createdCategories = [];
    
    for (const categoryData of categories) {
      const category = await prisma.category.upsert({
        where: { slug: categoryData.slug },
        update: categoryData,
        create: categoryData,
      });
      createdCategories.push(category);
      console.log(`✅ Category created: ${category.name}`);
    }

    // 3. Create products with images
    console.log('🛍️ Creating products...');
    
    let imageIndex = 0;
    const products = [];
    
    for (let i = 0; i < 30; i++) { // Create 30 products
      const template = productTemplates[i % productTemplates.length];
      const category = createdCategories[i % createdCategories.length];
      
      // Get 2-3 images for each product
      const productImages = [];
      for (let j = 0; j < 3; j++) {
        if (imageIndex < imageUrls.length) {
          productImages.push(imageUrls[imageIndex]);
          imageIndex++;
        }
      }
      
      // Reset image index if we run out
      if (imageIndex >= imageUrls.length) {
        imageIndex = 0;
      }
      
      const product = await prisma.product.create({
        data: {
          name: `${template.name} ${i + 1}`,
          slug: `${template.name.toLowerCase().replace(/\s+/g, '-')}-${i + 1}`,
          description: `${template.desc}. Premium quality jewelry piece crafted with attention to detail.`,
          sku: `RJ${String(i + 1).padStart(4, '0')}`,
          price: template.basePrice + (Math.random() * 20000 - 10000), // Random variation
          salePrice: template.basePrice - 5000, // Sale price
          categoryId: category.id,
          status: ProductStatus.ACTIVE,
          designType: i % 2 === 0 ? ProductDesignType.REGULAR : ProductDesignType.LANDING_PAGE,
          images: productImages,
          stock: Math.floor(Math.random() * 50) + 10, // 10-60 stock
          isFeatured: i < 6, // First 6 products are featured
          weight: Math.floor(Math.random() * 50) + 10, // 10-60 grams
          material: 'Gold',
          care: 'Clean with soft cloth and store in dry place',
          metaTitle: `${template.name} - Rupomoti Jewelry`,
          metaDescription: `Buy ${template.name} online. ${template.desc}. Premium quality guaranteed.`,
          metaKeywords: 'jewelry, luxury, gold, diamond, rupomoti'
        }
      });
      
      products.push(product);
      console.log(`✅ Product created: ${product.name}`);
    }

    // 4. Create media for hero slider
    console.log('🖼️ Creating media for hero slider...');
    
    // Ensure hero-slider section exists
    await prisma.mediaSection.upsert({
      where: { name: 'hero-slider' },
      update: {},
      create: {
        name: 'hero-slider',
        title: 'Hero Slider',
        description: 'Main banner images for the homepage',
        maxItems: 10,
        isActive: true,
        settings: {
          formats: ['image/jpeg', 'image/png', 'image/webp'],
          maxWidth: 1920,
          maxHeight: 800
        }
      }
    });
    
    // Create hero slider images using some of the provided images
    for (let i = 0; i < 5; i++) {
      await prisma.media.create({
        data: {
          name: `Hero Slide ${i + 1}`,
          url: imageUrls[i + 10], // Use images 10-14 for hero slider
          alt: `Hero slide ${i + 1}`,
          type: 'image/jpeg',
          section: 'hero-slider',
          position: i + 1,
          isActive: true,
          metadata: {
            link: '/shop',
            cta: 'Shop Now',
            title: 'Discover Luxury Jewelry',
            subtitle: 'Handcrafted with perfection'
          }
        }
      });
    }

    // 5. Create logo media
    console.log('🏷️ Creating logo media...');
    
    await prisma.mediaSection.upsert({
      where: { name: 'logo' },
      update: {},
      create: {
        name: 'logo',
        title: 'Logo',
        description: 'Website logo and branding',
        maxItems: 1,
        isActive: true,
        settings: {
          formats: ['image/png', 'image/svg+xml'],
          maxWidth: 300,
          maxHeight: 100
        }
      }
    });

    await prisma.media.create({
      data: {
        name: 'Rupomoti Logo',
        url: '/images/branding/logo.png',
        alt: 'Rupomoti Jewelry',
        type: 'image/png',
        section: 'logo',
        position: 1,
        isActive: true,
        metadata: {
          isDefault: true,
          width: 300,
          height: 100,
        }
      }
    });

    // 6. Create sample orders (optional)
    console.log('📦 Creating sample orders...');
    
    // Create a sample customer
    const customer = await prisma.customer.create({
      data: {
        name: 'John Doe',
        phone: '01712345678',
        email: 'john@example.com',
        address: 'Dhaka, Bangladesh'
      }
    });

    // Create a sample order
    const order = await prisma.order.create({
      data: {
        orderNumber: 'ORD001',
        customerId: customer.id,
        recipientName: customer.name,
        recipientPhone: customer.phone,
        recipientEmail: customer.email,
        deliveryAddress: customer.address,
        subtotal: 50000,
        deliveryFee: 100,
        total: 50100,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        paymentMethod: 'CASH_ON_DELIVERY',
        deliveryZone: 'INSIDE_DHAKA',
        isFakeOrder: false,
        items: {
          create: [
            {
              productId: products[0].id,
              quantity: 1,
              price: products[0].price
            },
            {
              productId: products[1].id,
              quantity: 2,
              price: products[1].price
            }
          ]
        }
      }
    });

    console.log('✅ Sample order created:', order.orderNumber);

    // Final statistics
    const stats = {
      categories: await prisma.category.count(),
      products: await prisma.product.count(),
      orders: await prisma.order.count(),
      media: await prisma.media.count(),
      users: await prisma.user.count()
    };

    console.log('📊 Final statistics:');
    console.log(`- Categories: ${stats.categories}`);
    console.log(`- Products: ${stats.products}`);
    console.log(`- Orders: ${stats.orders}`);
    console.log(`- Media: ${stats.media}`);
    console.log(`- Users: ${stats.users}`);

    console.log('🎉 Complete data seeding finished successfully!');
    console.log('');
    console.log('🔑 Admin Login Details:');
    console.log('Email: admin@rupomoti.com');
    console.log('Password: admin123');
    console.log('');
    console.log('🌐 You can now start the application with: pnpm dev');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
if (require.main === module) {
  seedCompleteData()
    .then(() => {
      console.log('✨ Seeding completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

export { seedCompleteData };
