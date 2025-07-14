// Fallback data for when database is unreachable
export const fallbackCategories = [
  {
    id: "fallback-1",
    name: "Earrings",
    slug: "earrings",
    isActive: true,
    sortOrder: 1,
    parentId: null,
    level: 0,
    _count: { products: 15 }
  },
  {
    id: "fallback-2", 
    name: "Necklaces",
    slug: "necklaces",
    isActive: true,
    sortOrder: 2,
    parentId: null,
    level: 0,
    _count: { products: 12 }
  },
  {
    id: "fallback-3",
    name: "Bracelets", 
    slug: "bracelets",
    isActive: true,
    sortOrder: 3,
    parentId: null,
    level: 0,
    _count: { products: 8 }
  },
  {
    id: "fallback-4",
    name: "Rings",
    slug: "rings", 
    isActive: true,
    sortOrder: 4,
    parentId: null,
    level: 0,
    _count: { products: 20 }
  }
];

export const fallbackProducts = [
  {
    id: "fallback-product-1",
    name: "Diamond Stud Earrings",
    slug: "diamond-stud-earrings",
    description: "Elegant diamond stud earrings perfect for any occasion",
    price: 15999,
    basePrice: 12999,
    images: ["https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80"],
    stock: 10,
    status: "ACTIVE",
    isPopular: true,
    isFeatured: true,
    categoryId: "fallback-1",
    category: { name: "Earrings", slug: "earrings" },
    tags: ["diamond", "elegant", "classic"],
    features: ["18K Gold", "Natural Diamonds", "Hypoallergenic"],
    discount: 20,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "fallback-product-2", 
    name: "Pearl Tennis Bracelet",
    slug: "pearl-tennis-bracelet",
    description: "Classic pearl tennis bracelet with premium cultured pearls",
    price: 28999,
    basePrice: 24999,
    images: ["https://img.piaget.com/mega-menu-panel-1/e484344f99703aed30ec5d4453b17be786f8234a.jpg"],
    stock: 5,
    status: "ACTIVE", 
    isPopular: true,
    isFeatured: false,
    categoryId: "fallback-3",
    category: { name: "Bracelets", slug: "bracelets" },
    tags: ["pearl", "tennis", "luxury"],
    features: ["Cultured Pearls", "Sterling Silver", "Secure Clasp"],
    discount: 15,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "fallback-product-3",
    name: "Emerald Drop Necklace", 
    slug: "emerald-drop-necklace",
    description: "Stunning emerald drop necklace with intricate gold detailing",
    price: 45999,
    basePrice: 39999,
    images: ["https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80"],
    stock: 3,
    status: "ACTIVE",
    isPopular: true,
    isFeatured: true,
    categoryId: "fallback-2",
    category: { name: "Necklaces", slug: "necklaces" },
    tags: ["emerald", "gold", "luxury"],
    features: ["Natural Emerald", "18K Gold", "Handcrafted"],
    discount: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "fallback-product-4",
    name: "Sapphire Cocktail Ring",
    slug: "sapphire-cocktail-ring", 
    description: "Bold sapphire cocktail ring perfect for special occasions",
    price: 32999,
    basePrice: 29999,
    images: ["https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80"],
    stock: 7,
    status: "ACTIVE",
    isPopular: false,
    isFeatured: true, 
    categoryId: "fallback-4",
    category: { name: "Rings", slug: "rings" },
    tags: ["sapphire", "cocktail", "statement"],
    features: ["Blue Sapphire", "White Gold", "Size Adjustable"],
    discount: 10,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "fallback-product-5",
    name: "Crystal Chandelier Earrings",
    slug: "crystal-chandelier-earrings",
    description: "Glamorous crystal chandelier earrings for evening wear",
    price: 18999,
    basePrice: 15999,
    images: ["https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80"],
    stock: 12,
    status: "ACTIVE",
    isPopular: true,
    isFeatured: false,
    categoryId: "fallback-1", 
    category: { name: "Earrings", slug: "earrings" },
    tags: ["crystal", "chandelier", "evening"],
    features: ["Austrian Crystal", "Rose Gold Plated", "Lightweight"],
    discount: 18,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export const fallbackHeroSlides = [
  {
    id: "fallback-hero-1",
    url: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&q=80",
    alt: "Luxury Jewelry Collection",
    isActive: true,
    sortOrder: 1
  },
  {
    id: "fallback-hero-2", 
    url: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=1200&q=80",
    alt: "Diamond Jewelry",
    isActive: true,
    sortOrder: 2
  }
];

export const fallbackLogo = {
  id: "fallback-logo",
  url: "/images/logo.png",
  alt: "Rupomoti Logo",
  section: "logo",
  isActive: true
};
