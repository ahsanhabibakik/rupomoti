'use server'

import { Product } from '@/types/product'

async function fetchFromAPI(endpoint: string) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  const response = await fetch(`${baseUrl}${endpoint}`, {
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
    }
  })
  
  if (!response.ok) {
    console.error(`Failed to fetch ${endpoint}:`, response.status, response.statusText)
    return null
  }
  
  return response.json()
}

export async function getProducts(filter: { [key: string]: boolean }): Promise<Product[]> {
  try {
    // Build query parameters from filter
    const params = new URLSearchParams()
    Object.entries(filter).forEach(([key, value]) => {
      if (value) params.append(key, 'true')
    })
    params.append('limit', '4')
    
    const data = await fetchFromAPI(`/api/products-mongo?${params.toString()}`)
    return data?.data || []
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

export async function getHomePageData() {
  try {
    // Fetch different product types using MongoDB endpoints
    const [featuredData, popularData, newArrivalsData, regularData] = await Promise.all([
      fetchFromAPI('/api/products-mongo?isFeatured=true&limit=12&sort=newest'),
      fetchFromAPI('/api/products-mongo?isPopular=true&limit=12&sort=newest'),
      fetchFromAPI('/api/products-mongo?limit=12&sort=newest'),
      fetchFromAPI('/api/products-mongo?limit=8&sort=oldest')
    ])

    const featuredProducts = featuredData?.data || []
    const popularProducts = popularData?.data || []
    const newArrivals = newArrivalsData?.data || []
    const regularProducts = regularData?.data || []

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