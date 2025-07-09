'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/products/ProductCard'
import { ArrowRight } from 'lucide-react'

import { Product } from '@/types/product'

interface GridProductSectionProps {
  title: string
  products: Product[]
  viewAllLink: string
  className?: string
  mobileColumns?: number
  desktopColumns?: number
  showMoreProducts?: number
}

export default function GridProductSection({
  title,
  products = [], // Add default empty array
  viewAllLink,
  className = '',
  mobileColumns = 2,
  desktopColumns = 4,
  showMoreProducts = 8
}: GridProductSectionProps) {
  // Safely handle products array
  const safeProducts = Array.isArray(products) ? products : []
  const displayProducts = safeProducts.slice(0, showMoreProducts)

  // Don't render if no products
  if (displayProducts.length === 0) {
    return (
      <section className={`py-8 sm:py-12 md:py-16 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-3">
              {title}
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">No products available at the moment.</p>
          </div>
        </div>
      </section>
    )
  }

  // Improved responsive grid classes
  const getGridClasses = () => {
    const mobile = mobileColumns === 1 ? 'grid-cols-1' : 'grid-cols-2'
    const xs = 'xs:grid-cols-2'
    const tablet = desktopColumns <= 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3'
    const desktop = desktopColumns === 5 ? 'lg:grid-cols-5' : 
                   desktopColumns === 6 ? 'lg:grid-cols-6' : 
                   desktopColumns === 3 ? 'lg:grid-cols-3' : 
                   'lg:grid-cols-4'
    return `${mobile} ${xs} ${tablet} ${desktop}`
  }

  return (
    <section className={`py-8 sm:py-12 md:py-16 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 md:mb-12">
          <div className="flex-1">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2 sm:mb-3">
              {title}
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground">
              Surprise Your Loved Ones
            </p>
          </div>
          <Button 
            asChild 
            className="mt-3 sm:mt-0 bg-primary hover:bg-primary/90 text-primary-foreground px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-full font-semibold"
          >
            <Link href={viewAllLink} className="flex items-center gap-2">
              View All
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </Link>
          </Button>
        </div>

        {/* Products Grid */}
        <div className={`grid gap-3 sm:gap-4 lg:gap-6 gap-y-4 sm:gap-y-6 ${getGridClasses()}`}>
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
        <div className="mt-6 sm:mt-8 text-center md:hidden">
          <Button asChild variant="outline" size="sm" className="text-xs sm:text-sm">
            <Link href={viewAllLink} className="flex items-center gap-2">
              Show More Products
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
