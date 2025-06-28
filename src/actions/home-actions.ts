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
  const [featuredProducts, popularProducts, newArrivals] = await Promise.all([
    prisma.product.findMany({
      where: { isFeatured: true },
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: { category: true },
    }),
    prisma.product.findMany({
      where: { isPopular: true },
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: { category: true },
    }),
    prisma.product.findMany({
      where: { isNewArrival: true },
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
