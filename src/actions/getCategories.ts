'use server'

interface GetCategoriesParams {
  level?: number
  active?: boolean
  parent?: string | null
}

async function fetchFromAPI(endpoint: string) {
  // Server-side needs absolute URLs, client-side can use relative
  const baseUrl = typeof window === 'undefined'
    ? `http://localhost:${process.env.PORT || 3005}`
    : ''
  
  const url = baseUrl + endpoint
  console.log('Fetching categories from:', url)
  
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
  
  return response.json()
}

export async function getCategories(params: GetCategoriesParams = {}) {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams()
    if (params.active !== undefined) {
      queryParams.append('active', params.active.toString())
    }
    
    const data = await fetchFromAPI(`/api/categories-mongo?${queryParams.toString()}`)
    const categories = data?.data || []
    
    // Filter for top-level categories if requested
    if (params.level === 0 || params.parent === null) {
      return categories.filter((cat: any) => !cat.parentId)
    }
    
    return categories
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
} 