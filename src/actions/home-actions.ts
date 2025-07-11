'use server'

import { Product } from '@/types/product'

async function fetchFromAPI(endpoint: string) {
  try {
    // Use different URLs for server vs client
    const baseUrl = typeof window === 'undefined' 
      ? (process.env.NEXTAUTH_URL || 'http://localhost:3005') 
      : ''
    
    const url = baseUrl + endpoint
    console.log('Fetching from:', url)
    
    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add timeout
      signal: AbortSignal.timeout(10000)
    })
    
    if (!response.ok) {
      console.error(`Failed to fetch ${endpoint}:`, response.status, response.statusText)
      return null
    }
    
    const data = await response.json()
    console.log(`Successfully fetched ${endpoint}:`, data?.data?.length || 0, 'items')
    return data
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error)
    return null
  }
}

export async function getProducts(filter: { [key: string]: boolean }): Promise<Product[]> {
  try {
    // Build query parameters from filter
    const params = new URLSearchParams()
    Object.entries(filter).forEach(([key, value]) => {
      if (value) params.append(key, 'true')
    })
    params.append('limit', '4')
    
    // Use the new Mongoose-based products endpoint
    const data = await fetchFromAPI(`/api/products?${params.toString()}`)
    return data?.data || []
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

export async function getHomePageData() {
  try {
    console.log('Starting home page data fetch...')
    
    // Use the new Mongoose-based products endpoint
    const [featuredData, popularData, newArrivalsData, saleData] = await Promise.allSettled([
      fetchFromAPI('/api/products?featured=true&limit=12'),
      fetchFromAPI('/api/products?popular=true&limit=12'),
      fetchFromAPI('/api/products?sort=newest&limit=12'),
      fetchFromAPI('/api/products?limit=8')
    ])

    const getFulfilledData = (result: PromiseSettledResult<{ data?: Product[] } | null>) => {
      if (result.status === 'fulfilled' && result.value?.data) {
        return result.value.data
      }
      console.warn('Promise failed or returned no data:', result)
      return []
    }

    const featuredProducts = getFulfilledData(featuredData)
    const popularProducts = getFulfilledData(popularData)
    const newArrivals = getFulfilledData(newArrivalsData)
    const saleProducts = getFulfilledData(saleData)

    console.log('Home page data fetched:', {
      featured: featuredProducts.length,
      popular: popularProducts.length,
      newArrivals: newArrivals.length,
      sale: saleProducts.length
    })

    // Smart product count logic with enhanced data
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
      saleProducts: saleProducts.slice(0, getOptimalProductCount(saleProducts)) as Product[],
      regularProducts: newArrivals.slice(0, getOptimalProductCount(newArrivals)) as Product[], // Add regularProducts for compatibility
      counts: {
        featured: featuredProducts.length,
        popular: popularProducts.length,
        newArrivals: newArrivals.length,
        sale: saleProducts.length,
      }
    }
  } catch (error) {
    console.error('Error fetching home page data:', error)
    // Return empty arrays in case of error
    return {
      featuredProducts: [],
      popularProducts: [],
      newArrivals: [],
      saleProducts: [],
      regularProducts: [], // Add regularProducts for compatibility
      counts: {
        featured: 0,
        popular: 0,
        newArrivals: 0,
        sale: 0,
      }
    }
  }
}

// 🚀 NEW: Advanced search using enhanced endpoints
export async function searchProducts(query: string, filters?: {
  category?: string
  minPrice?: number
  maxPrice?: number
  limit?: number
}) {
  try {
    const params = new URLSearchParams()
    params.append('search', query)
    
    if (filters?.category) params.append('category', filters.category)
    if (filters?.minPrice) params.append('minPrice', filters.minPrice.toString())
    if (filters?.maxPrice) params.append('maxPrice', filters.maxPrice.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())
    
    const data = await fetchFromAPI(`/api/products-mongo?${params.toString()}`)
    return data?.data || []
  } catch (error) {
    console.error('Error searching products:', error)
    return []
  }
}

// 🚀 NEW: Get products on sale with computed discount info
export async function getSaleProducts(limit = 12) {
  try {
    const data = await fetchFromAPI(`/api/products-mongo?type=sale&limit=${limit}`)
    return data?.data || []
  } catch (error) {
    console.error('Error fetching sale products:', error)
    return []
  }
}

// 🚀 NEW: Get products by price range with enhanced filtering
export async function getProductsByPriceRange(minPrice: number, maxPrice: number) {
  try {
    const data = await fetchFromAPI(`/api/products-mongo?minPrice=${minPrice}&maxPrice=${maxPrice}`)
    return data?.data || []
  } catch (error) {
    console.error('Error fetching products by price range:', error)
    return []
  }
}

// 🚀 NEW: Get category analytics
export async function getCategoryAnalytics() {
  try {
    const data = await fetchFromAPI('/api/categories-mongo?type=analytics')
    return data?.data || []
  } catch (error) {
    console.error('Error fetching category analytics:', error)
    return []
  }
}

// 🚀 NEW: Get categories with product counts
export async function getCategoriesWithCounts() {
  try {
    const data = await fetchFromAPI('/api/categories-mongo?type=with_counts')
    return data?.data || []
  } catch (error) {
    console.error('Error fetching categories with counts:', error)
    return []
  }
}