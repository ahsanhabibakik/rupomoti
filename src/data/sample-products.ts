// Sample product data with Cloudinary images for jewelry e-commerce
export const sampleProducts = [
  {
    id: "pearl-necklace-classic",
    name: "Classic Pearl Necklace",
    description: "Elegant classic pearl necklace perfect for formal occasions",
    slug: "classic-pearl-necklace",
    price: 2500,
    salePrice: 2000,
    images: [
      "https://res.cloudinary.com/dotinshdj/image/upload/v1700000000/rupomoti/products/pearl-necklace-1.jpg",
      "https://res.cloudinary.com/dotinshdj/image/upload/v1700000001/rupomoti/products/pearl-necklace-2.jpg"
    ],
    category: "necklaces",
    isFeatured: true,
    isPopular: true,
    isNewArrival: false,
    stock: 15,
    sku: "PN-001"
  },
  {
    id: "gold-pearl-earrings",
    name: "Gold Pearl Earrings",
    description: "Beautiful gold earrings with natural pearls",
    slug: "gold-pearl-earrings",
    price: 1800,
    salePrice: 1500,
    images: [
      "https://res.cloudinary.com/dotinshdj/image/upload/v1700000002/rupomoti/products/gold-earrings-1.jpg",
      "https://res.cloudinary.com/dotinshdj/image/upload/v1700000003/rupomoti/products/gold-earrings-2.jpg"
    ],
    category: "earrings",
    isFeatured: false,
    isPopular: true,
    isNewArrival: true,
    stock: 20,
    sku: "GE-001"
  },
  {
    id: "silver-ring-collection",
    name: "Silver Pearl Ring",
    description: "Elegant silver ring with freshwater pearl",
    slug: "silver-pearl-ring",
    price: 1200,
    images: [
      "https://res.cloudinary.com/dotinshdj/image/upload/v1700000004/rupomoti/products/silver-ring-1.jpg",
      "https://res.cloudinary.com/dotinshdj/image/upload/v1700000005/rupomoti/products/silver-ring-2.jpg"
    ],
    category: "rings",
    isFeatured: true,
    isPopular: false,
    isNewArrival: true,
    stock: 25,
    sku: "SR-001"
  },
  {
    id: "vintage-brooch",
    name: "Vintage Pearl Brooch",
    description: "Antique-style brooch with natural pearls and gold accents",
    slug: "vintage-pearl-brooch",
    price: 3200,
    salePrice: 2800,
    images: [
      "https://res.cloudinary.com/dotinshdj/image/upload/v1700000006/rupomoti/products/vintage-brooch-1.jpg",
      "https://res.cloudinary.com/dotinshdj/image/upload/v1700000007/rupomoti/products/vintage-brooch-2.jpg"
    ],
    category: "brooches",
    isFeatured: true,
    isPopular: true,
    isNewArrival: false,
    stock: 8,
    sku: "VB-001"
  },
  {
    id: "modern-bracelet",
    name: "Modern Pearl Bracelet",
    description: "Contemporary design bracelet with cultured pearls",
    slug: "modern-pearl-bracelet",
    price: 1650,
    images: [
      "https://res.cloudinary.com/dotinshdj/image/upload/v1700000008/rupomoti/products/modern-bracelet-1.jpg",
      "https://res.cloudinary.com/dotinshdj/image/upload/v1700000009/rupomoti/products/modern-bracelet-2.jpg"
    ],
    category: "bracelets",
    isFeatured: false,
    isPopular: false,
    isNewArrival: true,
    stock: 30,
    sku: "MB-001"
  },
  {
    id: "wedding-set",
    name: "Bridal Pearl Set",
    description: "Complete bridal jewelry set with necklace, earrings, and bracelet",
    slug: "bridal-pearl-set",
    price: 8500,
    salePrice: 7200,
    images: [
      "https://res.cloudinary.com/dotinshdj/image/upload/v1700000010/rupomoti/products/bridal-set-1.jpg",
      "https://res.cloudinary.com/dotinshdj/image/upload/v1700000011/rupomoti/products/bridal-set-2.jpg",
      "https://res.cloudinary.com/dotinshdj/image/upload/v1700000012/rupomoti/products/bridal-set-3.jpg"
    ],
    category: "sets",
    isFeatured: true,
    isPopular: true,
    isNewArrival: false,
    stock: 5,
    sku: "BS-001"
  }
]

// Fallback images in case Cloudinary images fail
export const fallbackImages = {
  necklaces: [
    "/images/products/necklace-placeholder-1.jpg",
    "/images/products/necklace-placeholder-2.jpg"
  ],
  earrings: [
    "/images/products/earring-placeholder-1.jpg", 
    "/images/products/earring-placeholder-2.jpg"
  ],
  rings: [
    "/images/products/ring-placeholder-1.jpg",
    "/images/products/ring-placeholder-2.jpg"
  ],
  bracelets: [
    "/images/products/bracelet-placeholder-1.jpg",
    "/images/products/bracelet-placeholder-2.jpg"
  ],
  brooches: [
    "/images/products/brooch-placeholder-1.jpg",
    "/images/products/brooch-placeholder-2.jpg"
  ],
  sets: [
    "/images/products/set-placeholder-1.jpg",
    "/images/products/set-placeholder-2.jpg",
    "/images/products/set-placeholder-3.jpg"
  ]
}
