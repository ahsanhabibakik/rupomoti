'use server'

interface GetCategoriesParams {
  level?: number
  active?: boolean
  parent?: string | null
}

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

export async function getCategories(params: GetCategoriesParams = {}) {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams()
    if (params.active !== undefined) {
      queryParams.append('active', params.active.toString())
    }
    
    const data = await fetchFromAPI(`/api/categories?${queryParams.toString()}`)
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