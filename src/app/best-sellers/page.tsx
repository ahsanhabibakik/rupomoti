'use client'

import { ProductCard } from '@/components/products/ProductCard'
import { Badge } from '@/components/ui/badge'
import productsData from '@/data/products.json'

export default function BestSellersPage() {
  // In a real app, you would sort by actual sales data
  // Here we'll just take a random selection as an example
  const bestSellers = productsData.products
    .sort(() => Math.random() - 0.5)
    .slice(0, 12)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <Badge className="mb-4">Best Sellers</Badge>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
          Our Most Popular Pieces
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Discover our customers' favorite jewelry pieces. These timeless designs have
          captured hearts and continue to be our most sought-after selections.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {bestSellers.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            description={product.description}
            price={product.price}
            image={product.images[0]}
          />
        ))}
      </div>
    </div>
  )
} 