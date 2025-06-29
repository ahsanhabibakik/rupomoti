'use server'

import { prisma } from '@/lib/prisma'

export async function getProducts(filter: { [key: string]: boolean }) {
  return await prisma.product.findMany({
    where: filter,
    take: 4,
    orderBy: { createdAt: 'desc' },
    include: {
      category: true,
    },
  })
}

export async function getHomePageData() {
  // Common filter to exclude out-of-stock products for regular users
  const baseWhere = {
    status: 'ACTIVE',
    stock: { gt: 0 }
  }

  const [featuredProducts, popularProducts, newArrivals, regularProducts] = await Promise.all([
    prisma.product.findMany({
      where: { 
        ...baseWhere,
        isFeatured: true 
      },
      take: 12,
      orderBy: { createdAt: 'desc' },
      include: { category: true },
    }),
    prisma.product.findMany({
      where: { 
        ...baseWhere,
        isPopular: true 
      },
      take: 12,
      orderBy: { createdAt: 'desc' },
      include: { category: true },
    }),
    prisma.product.findMany({
      where: { 
        ...baseWhere,
        isNewArrival: true 
      },
      take: 12,
      orderBy: { createdAt: 'desc' },
      include: { category: true },
    }),
    // Get regular products (not featured, not popular, not new arrivals)
    prisma.product.findMany({
      where: { 
        ...baseWhere,
        isFeatured: false,
        isPopular: false,
        isNewArrival: false
      },
      take: 12,
      orderBy: { createdAt: 'desc' },
      include: { category: true },
    }),
  ])

  // Smart product count logic
  const getOptimalProductCount = (products: any[]) => {
    const count = products.length
    if (count >= 8) return 8
    if (count >= 4) return 4
    if (count >= 3) return count
    return 0 // Hide section if less than 3 products
  }

  return {
    featuredProducts: featuredProducts.slice(0, getOptimalProductCount(featuredProducts)),
    popularProducts: popularProducts.slice(0, getOptimalProductCount(popularProducts)),
    newArrivals: newArrivals.slice(0, getOptimalProductCount(newArrivals)),
    regularProducts: regularProducts.slice(0, getOptimalProductCount(regularProducts)),
    counts: {
      featured: featuredProducts.length,
      popular: popularProducts.length,
      newArrivals: newArrivals.length,
      regular: regularProducts.length,
    }
  }
}
