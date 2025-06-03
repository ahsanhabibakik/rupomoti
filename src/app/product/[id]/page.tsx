'use client'

import { ProductDetails } from '@/components/products/ProductDetails'
import productsData from '@/data/products.json'

export default function Page({ params }: { params: { id: string } }) {
  const product = productsData.products.find(p => p.id === params.id)

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Product not found</h1>
      </div>
    )
  }

  return <ProductDetails product={product} />
} 