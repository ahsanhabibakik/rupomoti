'use client'

import { useState, useEffect } from 'react'
import { ProductCard } from '@/components/products/ProductCard'
import { ProductCardSkeleton } from '@/components/products/ProductCardSkeleton'

interface ProductGridProps {
  title: string
  apiEndpoint: string
  fallbackEndpoint?: string
  maxProducts?: number
}

export function ProductGrid({ 
  title, 
  apiEndpoint, 
  fallbackEndpoint,
  maxProducts = 8 
}: ProductGridProps) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true)
        setError(null)
        
        // Try primary endpoint
        let response = await fetch(apiEndpoint)
        
        // If primary fails, try fallback
        if (!response.ok && fallbackEndpoint) {
          console.warn(`Primary endpoint failed (${response.status}), trying fallback...`)
          response = await fetch(fallbackEndpoint)
        }
        
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`)
        }
        
        const data = await response.json()
        const productList = data.products || data.data || []
        
        setProducts(productList.slice(0, maxProducts))
      } catch (err) {
        console.error('Product fetch error:', err)
        setError(err instanceof Error ? err.message : 'Failed to load products')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [apiEndpoint, fallbackEndpoint, maxProducts])

  if (loading) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">{title}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">{title}</h2>
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500 mb-4">⚠️ {error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    )
  }

  if (products.length === 0) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">{title}</h2>
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No products available at the moment.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-8">{title}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
