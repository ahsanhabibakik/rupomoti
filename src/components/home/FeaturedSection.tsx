'use client'

import Link from 'next/link'
import { ProductCard } from '@/components/products/ProductCard'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import productsData from '@/data/products.json'

interface FeaturedSectionProps {
  title: string
  description: string
  products: typeof productsData.products
  viewAllLink: string
}

export function FeaturedSection({ title, description, products, viewAllLink }: FeaturedSectionProps) {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">{title}</h2>
            <p className="text-muted-foreground max-w-2xl">{description}</p>
          </div>
          <Link href={viewAllLink}>
            <Button variant="link" className="text-primary">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {products.slice(0, 4).map((product) => (
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
    </section>
  )
} 