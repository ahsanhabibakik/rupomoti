'use server'

import { prisma, withRetry } from '@/lib/prisma'
import { Product } from '@/types/product'

export async function getProducts(filter: { [key: string]: boolean }): Promise<Product[]> {
  try {
    return await withRetry(async () => {
      const products = await prisma.product.findMany({
        where: filter,
        take: 4,
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
        },
      })
      return products as Product[]
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

export async function getHomePageData() {
  try {
    // Common filter to exclude out-of-stock products for regular users
    const baseWhere = {
      status: 'ACTIVE' as const,
      stock: { gt: 0 }
    }    // Enhanced query to remove landing page products completely
    const [featuredProducts, popularProducts, newArrivals, regularProducts] = await withRetry(async () => {
      return await Promise.all([
        prisma.product.findMany({
          where: { 
            ...baseWhere,
            isFeatured: true
          },
          take: 12,
          orderBy: [
            { createdAt: 'desc' }
          ],
          include: { category: true },
        }),
        prisma.product.findMany({
          where: { 
            ...baseWhere,
            isPopular: true
          },
          take: 12,
          orderBy: [
            { createdAt: 'desc' }
          ],
          include: { category: true },
        }),
        prisma.product.findMany({
          where: { 
            ...baseWhere,
            isNewArrival: true
          },
          take: 12,
          orderBy: [
            { createdAt: 'desc' }
          ],
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
          orderBy: [
            { createdAt: 'desc' }
          ],
          include: { category: true },
        }),
      ])
    })

  // Smart product count logic
  const getOptimalProductCount = (products: Product[]) => {
    const count = products.length
    if (count >= 8) return 8
    if (count >= 4) return 4
    if (count >= 3) return count
    return 0 // Hide section if less than 3 products
  }

    return {
      featuredProducts: featuredProducts.slice(0, getOptimalProductCount(featuredProducts)) as Product[],
      popularProducts: popularProducts.slice(0, getOptimalProductCount(popularProducts)) as Product[],
      newArrivals: newArrivals.slice(0, getOptimalProductCount(newArrivals)) as Product[],
      regularProducts: regularProducts.slice(0, getOptimalProductCount(regularProducts)) as Product[],
      counts: {
        featured: featuredProducts.length,
        popular: popularProducts.length,
        newArrivals: newArrivals.length,
        regular: regularProducts.length,
      }
    }
  } catch (error) {
    console.error('Error fetching home page data:', error)
    // Return empty arrays in case of error
    return {
      featuredProducts: [],
      popularProducts: [],
      newArrivals: [],
      regularProducts: [],
      counts: {
        featured: 0,
        popular: 0,
        newArrivals: 0,
        regular: 0,
      }
    }
  }
}
