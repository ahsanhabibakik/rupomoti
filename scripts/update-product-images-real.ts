import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Real product images from the provided URLs
const realImages = [
  'https://cdn.prosystem.com.bd/images/AMISHEE/DSC09650c389a0c9-336b-4891-bba1-204a5dbd5468.jpg',
  'https://cdn.prosystem.com.bd/images/AMISHEE/DSC03441e204e552-583b-4911-b8c2-737eb1fb226c.jpg',
  'https://cdn.prosystem.com.bd/images/AMISHEE/328139417_2486433668188955_6481913195503245309_nd492f979-6080-4abf-97f6-591f1d67bfa1.jpg',
  'https://cdn.prosystem.com.bd/images/AMISHEE/206953360_825027921460071_5244354105098269380_ndcc9bf22-ee26-4c19-bd0e-32c2334c6cea.jpg',
  'https://cdn.prosystem.com.bd/images/AMISHEE/195688853_817006565595540_639150075641872757_n9f31e06d-b85b-4648-b318-ceb7648d6168.jpg',
  'https://cdn.prosystem.com.bd/images/AMISHEE/DSC03319_effect48db33b7-decb-49a2-89b5-241b2c50d2ba.jpg',
  'https://cdn.prosystem.com.bd/images/AMISHEE/DSC03353b7cc6ee7-60b1-4feb-9a25-f5e5452a5583.jpg',
  'https://cdn.prosystem.com.bd/images/AMISHEE/DSC0336903e5ee54-4a1c-4f47-a927-0bb73335eccf.jpg',
  'https://cdn.prosystem.com.bd/images/AMISHEE/DSC033999d58d10e-68b3-461b-ae35-aa2d8ad2c7c5.jpg',
  'https://cdn.prosystem.com.bd/images/AMISHEE/DSC096318f3432df-8c1c-4783-80dc-3c7cfa64d986.jpg',
]

// Jewelry product names and descriptions
const jewelryProducts = [
  { name: 'Diamond Solitaire Ring', description: 'Classic diamond solitaire ring with brilliant cut diamond in 18K white gold setting', category: 'rings', basePrice: 150000 },
  { name: 'Pearl Drop Earrings', description: 'Elegant freshwater pearl drop earrings with sterling silver hooks', category: 'earrings', basePrice: 35000 },
  { name: 'Gold Chain Necklace', description: 'Delicate 18K gold chain necklace, perfect for layering or wearing alone', category: 'necklaces', basePrice: 85000 },
  { name: 'Tennis Bracelet', description: 'Sparkling tennis bracelet with cubic zirconia stones in sterling silver', category: 'bracelets', basePrice: 45000 },
  { name: 'Statement Cocktail Ring', description: 'Bold cocktail ring featuring a large center stone with smaller accent stones', category: 'rings', basePrice: 95000 },
  { name: 'Hoop Earrings', description: 'Classic gold hoop earrings in 14K yellow gold, versatile for any occasion', category: 'earrings', basePrice: 28000 },
  { name: 'Pendant Necklace', description: 'Heart-shaped pendant necklace with diamonds in rose gold setting', category: 'necklaces', basePrice: 65000 },
  { name: 'Charm Bracelet', description: 'Sterling silver charm bracelet with various decorative charms', category: 'bracelets', basePrice: 32000 },
  { name: 'Vintage Style Ring', description: 'Art deco inspired vintage style ring with intricate metalwork', category: 'rings', basePrice: 78000 },
  { name: 'Chandelier Earrings', description: 'Dramatic chandelier earrings with cascading crystals and pearls', category: 'earrings', basePrice: 55000 },
  { name: 'Choker Necklace', description: 'Modern choker necklace with geometric design in sterling silver', category: 'necklaces', basePrice: 42000 },
  { name: 'Bangle Set', description: 'Set of three coordinating bangles in mixed metals', category: 'bracelets', basePrice: 38000 },
  { name: 'Emerald Cut Ring', description: 'Sophisticated emerald cut stone ring in platinum setting', category: 'rings', basePrice: 185000 },
  { name: 'Stud Earrings', description: 'Classic diamond stud earrings in 14K white gold settings', category: 'earrings', basePrice: 125000 },
  { name: 'Layered Necklace', description: 'Multi-strand layered necklace with varying chain lengths', category: 'necklaces', basePrice: 58000 },
  { name: 'Cuff Bracelet', description: 'Wide cuff bracelet with engraved pattern in sterling silver', category: 'bracelets', basePrice: 68000 },
  { name: 'Stackable Rings', description: 'Set of five thin stackable rings in rose gold', category: 'rings', basePrice: 48000 },
  { name: 'Tassel Earrings', description: 'Bohemian style tassel earrings with colorful beads', category: 'earrings', basePrice: 25000 },
  { name: 'Statement Necklace', description: 'Bold statement necklace with large geometric pendants', category: 'necklaces', basePrice: 95000 },
  { name: 'Link Bracelet', description: 'Classic link bracelet in 18K yellow gold', category: 'bracelets', basePrice: 115000 },
  { name: 'Infinity Ring', description: 'Romantic infinity symbol ring with pave diamonds', category: 'rings', basePrice: 72000 },
  { name: 'Feather Earrings', description: 'Delicate feather-shaped earrings in rose gold plating', category: 'earrings', basePrice: 22000 },
  { name: 'Collar Necklace', description: 'Structured collar necklace in gold-tone metal', category: 'necklaces', basePrice: 88000 },
  { name: 'Beaded Bracelet', description: 'Natural stone beaded bracelet with gold accents', category: 'bracelets', basePrice: 18000 },
  { name: 'Signet Ring', description: 'Classic signet ring with personalized engraving option', category: 'rings', basePrice: 65000 },
  { name: 'Cluster Earrings', description: 'Floral cluster earrings with multiple small stones', category: 'earrings', basePrice: 58000 },
  { name: 'Opera Length Necklace', description: 'Long opera length pearl necklace, versatile styling options', category: 'necklaces', basePrice: 135000 },
  { name: 'Wrap Bracelet', description: 'Leather wrap bracelet with metal studs and charms', category: 'bracelets', basePrice: 28000 },
  { name: 'Eternity Band', description: 'Diamond eternity band with continuous stone setting', category: 'rings', basePrice: 165000 },
  { name: 'Drop Earrings', description: 'Elegant teardrop shaped earrings with sapphire stones', category: 'earrings', basePrice: 98000 },
  { name: 'Lariat Necklace', description: 'Adjustable lariat style necklace with chain tassels', category: 'necklaces', basePrice: 52000 },
  { name: 'Mesh Bracelet', description: 'Flexible mesh bracelet in sterling silver with magnetic clasp', category: 'bracelets', basePrice: 75000 },
  { name: 'Promise Ring', description: 'Delicate promise ring with heart-shaped stone', category: 'rings', basePrice: 35000 },
  { name: 'Geometric Earrings', description: 'Modern geometric shaped earrings in brushed gold', category: 'earrings', basePrice: 42000 },
  { name: 'Multi-Strand Necklace', description: 'Layered multi-strand necklace with pearl and bead mix', category: 'necklaces', basePrice: 78000 },
  { name: 'Slider Bracelet', description: 'Adjustable slider bracelet with charm dangles', category: 'bracelets', basePrice: 48000 },
  { name: 'Dome Ring', description: 'Wide dome ring with hammered texture finish', category: 'rings', basePrice: 85000 },
  { name: 'Threader Earrings', description: 'Modern threader earrings that slide through the ear', category: 'earrings', basePrice: 38000 },
  { name: 'Bib Necklace', description: 'Dramatic bib style necklace with multiple connected elements', category: 'necklaces', basePrice: 125000 },
  { name: 'Tennis Bracelet Deluxe', description: 'Premium tennis bracelet with larger stones and secure clasp', category: 'bracelets', basePrice: 185000 },
  { name: 'Bypass Ring', description: 'Contemporary bypass ring design with two-tone metals', category: 'rings', basePrice: 68000 },
]

// Function to get random images for a product
function getRandomImages(): string[] {
  const shuffled = [...realImages].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, 2) // Get 2 random images
}

// Function to randomly assign tags
function getRandomTags() {
  const tags = {
    isFeatured: Math.random() < 0.2, // 20% chance
    isNewArrival: Math.random() < 0.25, // 25% chance
    isPopular: Math.random() < 0.3, // 30% chance
  }
  return tags
}

// Function to generate product variations
function generateProductVariations() {
  const variations = []
  const materials = ['Gold', 'Silver', 'Rose Gold', 'Platinum', 'White Gold']
  const styles = ['Classic', 'Modern', 'Vintage', 'Contemporary', 'Art Deco', 'Minimalist', 'Bohemian', 'Traditional']
  const stones = ['Diamond', 'Pearl', 'Ruby', 'Sapphire', 'Emerald', 'Amethyst', 'Topaz', 'Garnet', 'Opal', 'Citrine']
  
  for (let i = 0; i < 200; i++) {
    const baseProduct = jewelryProducts[i % jewelryProducts.length]
    const material = materials[Math.floor(Math.random() * materials.length)]
    const style = styles[Math.floor(Math.random() * styles.length)]
    const stone = stones[Math.floor(Math.random() * stones.length)]
    
    const priceVariation = 0.7 + Math.random() * 0.6 // 70% to 130% of base price
    const price = Math.round(baseProduct.basePrice * priceVariation)
    const hasSale = Math.random() < 0.3 // 30% chance of sale
    const salePrice = hasSale ? Math.round(price * 0.85) : null // 15% discount
    
    variations.push({
      name: `${style} ${material} ${baseProduct.name.replace(/^(Diamond|Pearl|Gold|Silver|Sterling|Platinum|Rose Gold|White Gold)\s+/i, '')}`,
      description: `${baseProduct.description.replace(/diamond|pearl|gold|silver|sterling|platinum/gi, stone)} Made with premium ${material.toLowerCase()} and featuring ${stone.toLowerCase()} accents.`,
      price,
      salePrice,
      category: baseProduct.category,
      stock: Math.floor(Math.random() * 50) + 5, // 5-54 stock
      sku: `RUP-${String(i + 1).padStart(4, '0')}-${Date.now().toString().slice(-6)}`,
      ...getRandomTags()
    })
  }
  
  return variations
}

async function createAndUpdateProducts() {
  try {
    console.log('🖼️ Starting to update product images and create new products...')

    // Get all existing categories
    const categories = await prisma.category.findMany({
      where: { isActive: true }
    })

    if (categories.length === 0) {
      console.log('❌ No categories found. Please run the initial data seeding first.')
      return
    }

    console.log(`📂 Found ${categories.length} categories`)

    // Update existing products with new images
    const existingProducts = await prisma.product.findMany({
      select: { id: true, name: true }
    })

    console.log(`📦 Found ${existingProducts.length} existing products to update`)

    for (const product of existingProducts) {
      const newImages = getRandomImages()
      const tags = getRandomTags()
      
      await prisma.product.update({
        where: { id: product.id },
        data: { 
          images: newImages,
          ...tags
        }
      })

      console.log(`✅ Updated ${product.name} with images and tags`)
    }

    // Generate 200 new products
    console.log('🏭 Generating 200 new products...')
    const newProducts = generateProductVariations()

    let created = 0
    for (const productData of newProducts) {
      try {
        // Find category by name (case insensitive)
        const category = categories.find(cat => 
          cat.name.toLowerCase().includes(productData.category.toLowerCase()) ||
          cat.slug.toLowerCase().includes(productData.category.toLowerCase())
        ) || categories[Math.floor(Math.random() * categories.length)] // Fallback to random category

        const newImages = getRandomImages()
        
        // Create unique slug
        const baseSlug = productData.name.toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .substring(0, 50)
        
        let slug = baseSlug
        let counter = 1
        
        // Ensure unique slug
        while (await prisma.product.findUnique({ where: { slug } })) {
          slug = `${baseSlug}-${counter}`
          counter++
        }

        // Ensure unique SKU
        let sku = productData.sku
        counter = 1
        while (await prisma.product.findUnique({ where: { sku } })) {
          sku = `${productData.sku}-${counter}`
          counter++
        }

        await prisma.product.create({
          data: {
            name: productData.name,
            slug,
            description: productData.description,
            price: productData.price,
            salePrice: productData.salePrice,
            sku,
            stock: productData.stock,
            images: newImages,
            categoryId: category.id,
            isFeatured: productData.isFeatured,
            isNewArrival: productData.isNewArrival,
            isPopular: productData.isPopular,
            status: 'ACTIVE',
            weight: Math.floor(Math.random() * 50) + 10, // 10-59 grams
            material: productData.name.includes('Gold') ? 'Gold' : 
                     productData.name.includes('Silver') ? 'Silver' : 
                     productData.name.includes('Platinum') ? 'Platinum' : 'Mixed Metal',
            care: 'Clean with soft cloth, avoid water and chemicals, store in jewelry box'
          }
        })

        created++
        if (created % 20 === 0) {
          console.log(`✨ Created ${created} products so far...`)
        }
      } catch (error) {
        console.log(`⚠️ Skipped product ${productData.name}: ${error.message}`)
      }
    }

    console.log('🎉 Product creation and update completed!')
    console.log(`📊 Summary:`)
    console.log(`   - Updated ${existingProducts.length} existing products`)
    console.log(`   - Created ${created} new products`)
    
    // Show tag distribution
    const allProducts = await prisma.product.findMany({
      select: { isFeatured: true, isNewArrival: true, isPopular: true }
    })
    
    const featured = allProducts.filter(p => p.isFeatured).length
    const newArrivals = allProducts.filter(p => p.isNewArrival).length
    const popular = allProducts.filter(p => p.isPopular).length
    
    console.log(`📈 Tag Distribution:`)
    console.log(`   - Featured: ${featured} products`)
    console.log(`   - New Arrivals: ${newArrivals} products`)
    console.log(`   - Popular: ${popular} products`)
    
  } catch (error) {
    console.error('❌ Error creating/updating products:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

createAndUpdateProducts()
