'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/products/ProductCard'
import { ArrowRight } from 'lucide-react'

interface GridProductSectionProps {
  title: string
  products: any[]
  viewAllLink: string
  className?: string
  mobileColumns?: number
  desktopColumns?: number
  showMoreProducts?: number
}

export default function GridProductSection({
  title,
  products,
  viewAllLink,
  className = '',
  mobileColumns = 2,
  desktopColumns = 4,
  showMoreProducts = 8
}: GridProductSectionProps) {
  // Show more products on mobile for grid layout
  const displayProducts = products.slice(0, showMoreProducts)

  return (
    <section className={`py-8 md:py-12 ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8">
          <div>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-primary mb-2">
              {title}
            </h2>
            <p className="text-sm md:text-base text-muted-foreground">
              Discover our carefully curated selection
            </p>
          </div>
          <Button asChild variant="outline" className="mt-4 sm:mt-0 text-sm">
            <Link href={viewAllLink} className="flex items-center gap-2">
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        {/* Products Grid */}
        <div className={`grid grid-cols-${mobileColumns} md:grid-cols-${Math.min(desktopColumns, 3)} lg:grid-cols-${desktopColumns} gap-3 md:gap-4 lg:gap-6`}>
          {displayProducts.map((product) => (
            <div key={product.id} className="w-full">
              <ProductCard
                product={product}
                compact={true} // Use compact mode for smaller cards
                className="h-full"
              />
            </div>
          ))}
        </div>

        {/* Mobile View All Button */}
        <div className="mt-6 text-center md:hidden">
          <Button asChild variant="outline" size="sm">
            <Link href={viewAllLink} className="flex items-center gap-2">
              Show More Products
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
