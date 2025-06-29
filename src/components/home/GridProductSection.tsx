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
    <section className={`py-12 md:py-16 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 md:mb-12">
          <div className="flex-1">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-3">
              {title}
            </h2>
            <p className="text-base md:text-lg text-muted-foreground">
              Surprise Your Loved Ones
            </p>
          </div>
          <Button 
            asChild 
            className="mt-4 sm:mt-0 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-full font-semibold"
          >
            <Link href={viewAllLink} className="flex items-center gap-2">
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        {/* Products Grid */}
        <div className={`grid gap-3 md:gap-4 lg:gap-6 ${
          mobileColumns === 1 
            ? 'grid-cols-1' 
            : mobileColumns === 3 
            ? 'grid-cols-3' 
            : 'grid-cols-2'
        } ${
          Math.min(desktopColumns, 3) === 1 
            ? 'md:grid-cols-1' 
            : Math.min(desktopColumns, 3) === 2
            ? 'md:grid-cols-2'
            : 'md:grid-cols-3'
        } ${
          desktopColumns === 1 
            ? 'lg:grid-cols-1' 
            : desktopColumns === 2
            ? 'lg:grid-cols-2'
            : desktopColumns === 3
            ? 'lg:grid-cols-3'
            : desktopColumns === 5
            ? 'lg:grid-cols-5'
            : desktopColumns === 6
            ? 'lg:grid-cols-6'
            : 'lg:grid-cols-4'
        }`}>
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
