'use client'

import { useEffect, useState } from 'react'
import { ProductCard } from '@/components/products/ProductCard'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { Product } from '@/types'

export function FeaturedProducts() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products?featured=true&limit=4')
        if (!response.ok) throw new Error('Failed to fetch products')
        const data = await response.json()
        setProducts(data)
      } catch (error) {
        console.error('Error fetching featured products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  if (loading) {
    return (
      <section className="py-16">
        <div className="container">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-[400px] animate-pulse rounded-lg bg-gray-200"
              />
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16">
      <div className="container">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Featured Collection
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Discover our most popular and trending pieces
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button
            size="lg"
            onClick={() => router.push('/shop')}
            className="bg-primary hover:bg-primary/90"
          >
            View All Products
          </Button>
        </div>
      </div>
    </section>
  )
} 