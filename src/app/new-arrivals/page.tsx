'use client'

import { ProductCard } from '@/components/products/ProductCard'
import { Badge } from '@/components/ui/badge'
import productsData from '@/data/products.json'

export default function NewArrivalsPage() {
  // In a real app, you would sort by createdAt date
  // Here we'll just take the first 12 products as an example
  const newArrivals = productsData.products.slice(0, 12)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <Badge className="mb-4">New Arrivals</Badge>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
          Latest Additions to Our Collection
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Discover our newest jewelry pieces, featuring exquisite designs and timeless elegance.
          Be the first to explore our latest arrivals.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {newArrivals.map((product) => (
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