'use server'

import { notFound } from 'next/navigation'

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

export async function getProductBySlug(slug: string) {
  try {
    const data = await fetchFromAPI(`/api/products-mongo?slug=${slug}`)
    const products = data?.data || []
    
    if (products.length === 0) {
      notFound()
    }

    return products[0]
  } catch (error) {
    console.error('Error fetching product by slug:', error)
    notFound()
  }
}

export async function getRelatedProducts(categoryId: string, currentProductId: string) {
  try {
    const data = await fetchFromAPI(`/api/products-mongo?categoryId=${categoryId}&limit=4`)
    const products = data?.data || []
    
    // Filter out the current product
    return products.filter((product: any) => product.id !== currentProductId)
  } catch (error) {
    console.error('Error fetching related products:', error)
    return []
  }
}

export async function getProductReviews(productId: string) {
  try {
    // For now, return empty reviews since we don't have a reviews endpoint yet
    // TODO: Implement reviews endpoint when needed
    return []
  } catch (error) {
    console.error('Error fetching product reviews:', error)
    return []
  }
}
