import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const landingPageProducts = [
  {
    name: 'Elegant Pearl Necklace Collection',
    slug: 'elegant-pearl-necklace-collection',
    description: 'Transform your style with our exquisite pearl necklace collection. Each piece is carefully crafted with premium freshwater pearls and 18K gold plating.',
    price: 12500,
    salePrice: 9999,
    stock: 25,
    sku: 'PEARL-NK-001',
    categorySlug: 'necklaces',
    isFeatured: true,
    isNewArrival: true,
    isPopular: true,
    designType: 'LANDING_PAGE',
    images: [
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80',
      'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=800&q=80',
      'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&q=80'
    ],
    landingPageData: {
      heroTitle: 'Timeless Elegance, Modern Style',
      heroSubtitle: 'Discover our premium pearl necklace collection that combines classic beauty with contemporary design',
      callToAction: 'Shop Now & Get FREE Shipping',
      guarantee: '30-Day Money Back Guarantee + Lifetime Warranty',
      features: [
        'Premium Freshwater Pearls',
        '18K Gold Plated Chain',
        'Hypoallergenic Materials',
        'Adjustable Length (16-18 inches)',
        'Elegant Gift Box Included'
      ],
      benefits: [
        'Perfect for formal occasions and daily wear',
        'Complements any outfit effortlessly',
        'Makes an ideal gift for loved ones',
        'Durable and long-lasting quality',
        'Enhances natural beauty and confidence'
      ],
      testimonials: [
        {
          name: 'Sarah Ahmed',
          comment: 'Absolutely stunning! The quality exceeded my expectations. I get compliments every time I wear it.',
          rating: 5
        },
        {
          name: 'Fatima Khan',
          comment: 'Beautiful craftsmanship and fast delivery. Will definitely order again!',
          rating: 5
        }
      ]
    }
  },
  {
    name: 'Royal Diamond Ring Set',
    slug: 'royal-diamond-ring-set',
    description: 'Make every moment special with our exclusive diamond ring collection. Features brilliant cut diamonds set in premium white gold.',
    price: 45000,
    salePrice: 35999,
    stock: 15,
    sku: 'DIAMOND-RG-002',
    categorySlug: 'rings',
    isFeatured: true,
    isPopular: true,
    designType: 'LANDING_PAGE',
    images: [
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80',
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80',
      'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&q=80'
    ],
    landingPageData: {
      heroTitle: 'Sparkle with Confidence',
      heroSubtitle: 'Premium diamond rings that symbolize your unique style and precious moments',
      callToAction: 'Order Now - Limited Stock!',
      guarantee: 'Certified Diamonds + Lifetime Warranty',
      features: [
        'Brilliant Cut Diamonds',
        '14K White Gold Setting',
        'Certified Authenticity',
        'Professional Polish',
        'Luxury Ring Box'
      ],
      benefits: [
        'Symbol of eternal love and commitment',
        'Investment in timeless beauty',
        'Perfect for engagements and anniversaries',
        'Increases in value over time',
        'Creates unforgettable memories'
      ],
      testimonials: [
        {
          name: 'Ayesha Rahman',
          comment: 'The most beautiful ring I have ever owned. The sparkle is incredible!',
          rating: 5
        },
        {
          name: 'Nadia Islam',
          comment: 'Excellent quality and service. Highly recommended for special occasions.',
          rating: 5
        }
      ]
    }
  },
  {
    name: 'Golden Lotus Earrings',
    slug: 'golden-lotus-earrings',
    description: 'Embrace elegance with our handcrafted golden lotus earrings. Inspired by nature, designed for modern women.',
    price: 8500,
    salePrice: 6999,
    stock: 30,
    sku: 'GOLD-ER-003',
    categorySlug: 'earrings',
    isFeatured: true,
    isNewArrival: true,
    designType: 'LANDING_PAGE',
    images: [
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80',
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80',
      'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&q=80'
    ],
    landingPageData: {
      heroTitle: 'Bloom with Beauty',
      heroSubtitle: 'Handcrafted golden lotus earrings that celebrate your inner goddess',
      callToAction: 'Add to Cart - Free Gift Wrapping',
      guarantee: '100% Satisfaction Guarantee',
      features: [
        'Hand-carved Lotus Design',
        '22K Gold Plated',
        'Lightweight Construction',
        'Secure Hook Closure',
        'Eco-friendly Materials'
      ],
      benefits: [
        'Comfortable for all-day wear',
        'Suitable for sensitive ears',
        'Adds instant glamour to any outfit',
        'Perfect conversation starter',
        'Symbol of purity and enlightenment'
      ],
      testimonials: [
        {
          name: 'Rabia Sheikh',
          comment: 'These earrings are gorgeous! So comfortable and I love the lotus design.',
          rating: 5
        }
      ]
    }
  },
  {
    name: 'Vintage Charm Bracelet',
    slug: 'vintage-charm-bracelet',
    description: 'Tell your story with our vintage charm bracelet collection. Each charm represents a special memory or milestone.',
    price: 15000,
    salePrice: 12500,
    stock: 20,
    sku: 'VINTAGE-BR-004',
    categorySlug: 'bracelets',
    isFeatured: true,
    designType: 'LANDING_PAGE',
    images: [
      'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=800&q=80',
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80',
      'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&q=80'
    ],
    landingPageData: {
      heroTitle: 'Wear Your Story',
      heroSubtitle: 'Create a personalized charm bracelet that tells your unique journey',
      callToAction: 'Customize Your Bracelet',
      guarantee: 'Free Charm Addition for Life',
      features: [
        'Sterling Silver Base',
        'Interchangeable Charms',
        'Adjustable Size (6-8 inches)',
        'Tarnish Resistant',
        'Custom Engraving Available'
      ],
      benefits: [
        'Personalize with meaningful charms',
        'Perfect gift for any occasion',
        'Grows with your life story',
        'High-quality craftsmanship',
        'Timeless vintage appeal'
      ],
      testimonials: [
        {
          name: 'Sadia Malik',
          comment: 'I love adding new charms! Each one holds a special memory for me.',
          rating: 5
        }
      ]
    }
  },
  {
    name: 'Celestial Star Pendant',
    slug: 'celestial-star-pendant',
    description: 'Reach for the stars with our celestial-inspired pendant. Features genuine crystals and gold-plated finish.',
    price: 7500,
    salePrice: 5999,
    stock: 35,
    sku: 'STAR-PD-005',
    categorySlug: 'necklaces',
    isNewArrival: true,
    isPopular: true,
    designType: 'LANDING_PAGE',
    images: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80',
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80',
      'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&q=80'
    ],
    landingPageData: {
      heroTitle: 'Shine Like a Star',
      heroSubtitle: 'Illuminate your style with our celestial star pendant collection',
      callToAction: 'Order Your Star Today',
      guarantee: 'Crystal Clear Quality Promise',
      features: [
        'Genuine Crystal Stones',
        '18K Gold Plated',
        '18-inch Chain Included',
        'Star-shaped Design',
        'Sparkles in Light'
      ],
      benefits: [
        'Catches light beautifully',
        'Symbolizes hopes and dreams',
        'Perfect for layering',
        'Suitable for day and night wear',
        'Affordable luxury'
      ],
      testimonials: [
        {
          name: 'Mahira Begum',
          comment: 'The pendant is even more beautiful in person. Love how it sparkles!',
          rating: 5
        }
      ]
    }
  },
  {
    name: 'Heritage Kundan Set',
    slug: 'heritage-kundan-set',
    description: 'Celebrate tradition with our exquisite Kundan jewelry set. Perfect for weddings and special occasions.',
    price: 28000,
    salePrice: 24999,
    stock: 12,
    sku: 'KUNDAN-ST-006',
    categorySlug: 'sets',
    isFeatured: true,
    isPopular: true,
    designType: 'LANDING_PAGE',
    images: [
      'https://images.unsplash.com/photo-1630019852942-f89202989652?w=800&q=80',
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80',
      'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&q=80'
    ],
    landingPageData: {
      heroTitle: 'Royal Heritage Collection',
      heroSubtitle: 'Embrace your cultural roots with authentic Kundan jewelry sets',
      callToAction: 'Reserve Your Set Now',
      guarantee: 'Authentic Craftsmanship Guarantee',
      features: [
        'Traditional Kundan Stones',
        'Gold-plated Setting',
        'Complete Necklace & Earring Set',
        'Handcrafted Details',
        'Secure Clasps'
      ],
      benefits: [
        'Perfect for weddings and festivals',
        'Timeless traditional design',
        'Completes any ethnic outfit',
        'Family heirloom quality',
        'Cultural significance and beauty'
      ],
      testimonials: [
        {
          name: 'Rubina Khatun',
          comment: 'Stunning set! Wore it to my sister\'s wedding and got so many compliments.',
          rating: 5
        }
      ]
    }
  },
  {
    name: 'Modern Minimalist Ring',
    slug: 'modern-minimalist-ring',
    description: 'Less is more with our minimalist ring collection. Clean lines and contemporary design for the modern woman.',
    price: 5500,
    salePrice: 4499,
    stock: 40,
    sku: 'MIN-RG-007',
    categorySlug: 'rings',
    isNewArrival: true,
    designType: 'LANDING_PAGE',
    images: [
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80',
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80',
      'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&q=80'
    ],
    landingPageData: {
      heroTitle: 'Minimalist Elegance',
      heroSubtitle: 'Discover the beauty of simplicity with our modern minimalist rings',
      callToAction: 'Get Yours Today',
      guarantee: 'Simple Beauty, Lifetime Quality',
      features: [
        'Clean Geometric Design',
        'Sterling Silver',
        'Comfortable Fit',
        'Available in Multiple Sizes',
        'Stackable Design'
      ],
      benefits: [
        'Versatile for any style',
        'Perfect for everyday wear',
        'Great for stacking',
        'Affordable luxury',
        'Timeless design'
      ],
      testimonials: [
        {
          name: 'Zara Ahmed',
          comment: 'Perfect minimalist ring! Exactly what I was looking for.',
          rating: 5
        }
      ]
    }
  },
  {
    name: 'Floral Motif Bangles',
    slug: 'floral-motif-bangles',
    description: 'Bloom with style wearing our floral motif bangles. Intricate flower patterns with colorful enamel work.',
    price: 11000,
    salePrice: 8999,
    stock: 25,
    sku: 'FLORAL-BG-008',
    categorySlug: 'bracelets',
    isPopular: true,
    designType: 'LANDING_PAGE',
    images: [
      'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=800&q=80',
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80',
      'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&q=80'
    ],
    landingPageData: {
      heroTitle: 'Garden of Beauty',
      heroSubtitle: 'Wear the beauty of nature with our handcrafted floral bangles',
      callToAction: 'Bloom with Style',
      guarantee: 'Handcrafted Quality Promise',
      features: [
        'Intricate Floral Patterns',
        'Colorful Enamel Work',
        'Set of 2 Bangles',
        'Brass Base with Gold Plating',
        'Comfortable Interior Finish'
      ],
      benefits: [
        'Adds color to any outfit',
        'Perfect for spring and summer',
        'Great for stacking',
        'Celebrates nature\'s beauty',
        'Artisan craftsmanship'
      ],
      testimonials: [
        {
          name: 'Farah Sultana',
          comment: 'Beautiful bangles with amazing detail work. Love the floral design!',
          rating: 5
        }
      ]
    }
  },
  {
    name: 'Crystal Chandelier Earrings',
    slug: 'crystal-chandelier-earrings',
    description: 'Make a statement with our stunning crystal chandelier earrings. Perfect for special events and formal occasions.',
    price: 13500,
    salePrice: 10999,
    stock: 18,
    sku: 'CRYSTAL-CH-009',
    categorySlug: 'earrings',
    isFeatured: true,
    designType: 'LANDING_PAGE',
    images: [
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80',
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80',
      'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&q=80'
    ],
    landingPageData: {
      heroTitle: 'Dazzle & Shine',
      heroSubtitle: 'Turn heads with our glamorous crystal chandelier earrings',
      callToAction: 'Shine Bright Tonight',
      guarantee: 'Red Carpet Ready Quality',
      features: [
        'Multi-tier Crystal Design',
        'Austrian Crystal Stones',
        'Silver-tone Setting',
        '3-inch Drop Length',
        'Secure Post Backs'
      ],
      benefits: [
        'Perfect for formal events',
        'Catches light beautifully',
        'Statement piece impact',
        'Professional quality',
        'Unforgettable glamour'
      ],
      testimonials: [
        {
          name: 'Samina Akter',
          comment: 'These earrings made me feel like a queen! Perfect for my wedding reception.',
          rating: 5
        }
      ]
    }
  },
  {
    name: 'Infinity Love Pendant',
    slug: 'infinity-love-pendant',
    description: 'Express eternal love with our infinity pendant. Features intertwined hearts and sparkling crystals.',
    price: 9500,
    salePrice: 7999,
    stock: 28,
    sku: 'INFINITY-PD-010',
    categorySlug: 'necklaces',
    isNewArrival: true,
    isPopular: true,
    designType: 'LANDING_PAGE',
    images: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80',
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80',
      'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&q=80'
    ],
    landingPageData: {
      heroTitle: 'Love Without Limits',
      heroSubtitle: 'Celebrate endless love with our beautiful infinity pendant collection',
      callToAction: 'Express Your Love',
      guarantee: 'Forever Quality Promise',
      features: [
        'Infinity Symbol Design',
        'Intertwined Heart Detail',
        'Crystal Accents',
        'Adjustable Chain',
        '925 Sterling Silver'
      ],
      benefits: [
        'Symbol of eternal love',
        'Perfect romantic gift',
        'Suitable for daily wear',
        'Meaningful jewelry piece',
        'High-quality materials'
      ],
      testimonials: [
        {
          name: 'Nasreen Begum',
          comment: 'Bought this for my anniversary. My husband loved the meaning behind it!',
          rating: 5
        }
      ]
    }
  }
]

async function main() {
  console.log('🌟 Starting to seed landing page products...')
  
  try {
    // First ensure categories exist
    const categoryData = [
      { name: 'Necklaces', slug: 'necklaces', description: 'Beautiful necklaces for every occasion' },
      { name: 'Rings', slug: 'rings', description: 'Stunning rings collection' },
      { name: 'Earrings', slug: 'earrings', description: 'Elegant earrings collection' },
      { name: 'Bracelets', slug: 'bracelets', description: 'Charming bracelets collection' },
      { name: 'Sets', slug: 'sets', description: 'Complete jewelry sets' }
    ]

    for (const cat of categoryData) {
      await prisma.category.upsert({
        where: { slug: cat.slug },
        update: cat,
        create: { ...cat, isActive: true }
      })
    }

    console.log('✅ Categories ensured')

    // Create landing page products
    for (const product of landingPageProducts) {
      const { categorySlug, landingPageData, ...productData } = product
      
      // Find category
      const category = await prisma.category.findUnique({
        where: { slug: categorySlug }
      })

      if (!category) {
        console.error(`❌ Category ${categorySlug} not found for product ${product.name}`)
        continue
      }

      // Check if product already exists
      const existingProduct = await prisma.product.findUnique({
        where: { slug: product.slug }
      })

      if (existingProduct) {
        console.log(`⚠️ Product ${product.name} already exists, skipping...`)
        continue
      }

      // Create product with landing page data
      await prisma.product.create({
        data: {
          ...productData,
          categoryId: category.id,
          landingPageData: landingPageData,
          useCustomLandingPage: true,
          landingPagePublished: true,
          landingPageSections: [
            {
              type: 'hero',
              data: {
                title: landingPageData.heroTitle,
                subtitle: landingPageData.heroSubtitle,
                image: productData.images[0]
              }
            },
            {
              type: 'features',
              data: {
                title: 'Why Choose This Product?',
                features: landingPageData.features
              }
            },
            {
              type: 'benefits',
              data: {
                title: 'Amazing Benefits',
                benefits: landingPageData.benefits
              }
            },
            {
              type: 'testimonials',
              data: {
                title: 'What Our Customers Say',
                testimonials: landingPageData.testimonials
              }
            },
            {
              type: 'guarantee',
              data: {
                title: 'Our Promise to You',
                guarantee: landingPageData.guarantee
              }
            }
          ]
        }
      })

      console.log(`✅ Created landing page product: ${product.name}`)
    }

    console.log('🎉 All landing page products seeded successfully!')
    
  } catch (error) {
    console.error('❌ Error seeding landing page products:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })