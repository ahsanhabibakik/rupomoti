'use client'

import { ProductDetails } from '@/components/products/ProductDetails'
import productsData from '@/data/products.json'
import { Product } from '@/types/product'

export default function Page({ params }: { params: { id: string } }) {
  try {
    const product = productsData.products.find(p => p.id === params.id) as Product | undefined

    if (!product) {
      return (
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
        </div>
      )
    }

    return <ProductDetails product={product} />
  } catch (error) {
    console.error('Error in product page:', error)
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
        <p className="text-gray-600">Please try again later</p>
      </div>
    )
  }
} 