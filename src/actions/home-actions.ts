'use server'

import { prisma, withRetry } from '@/lib/prisma'
import { Product } from '@/types/product'
import { fallbackProducts } from '@/lib/fallback-data'

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
    // Return fallback data when database is unreachable
    return fallbackProducts.slice(0, 4) as Product[]
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
    console.log('🔄 Using fallback data due to database connectivity issues')
    
    // Use fallback data when database is unreachable
    const featured = fallbackProducts.filter(p => p.isFeatured)
    const popular = fallbackProducts.filter(p => p.isPopular)
    const newArrivals = fallbackProducts.slice(0, 2) // Simulate new arrivals
    const regular = fallbackProducts.filter(p => !p.isFeatured && !p.isPopular)
    
    return {
      featuredProducts: featured as Product[],
      popularProducts: popular as Product[],
      newArrivals: newArrivals as Product[],
      regularProducts: regular as Product[],
      counts: {
        featured: featured.length,
        popular: popular.length,
        newArrivals: newArrivals.length,
        regular: regular.length,
      }
    }
  }
}
