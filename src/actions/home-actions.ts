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

  const [featuredProducts, popularProducts, newArrivals] = await Promise.all([
    prisma.product.findMany({
      where: { 
        ...baseWhere,
        isFeatured: true 
      },
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: { category: true },
    }),
    prisma.product.findMany({
      where: { 
        ...baseWhere,
        isPopular: true 
      },
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: { category: true },
    }),
    prisma.product.findMany({
      where: { 
        ...baseWhere,
        isNewArrival: true 
      },
      take: 4,
      orderBy: { createdAt: 'desc' },
      include: { category: true },
    }),
  ])

  return {
    featuredProducts,
    popularProducts,
    newArrivals,
  }
}
