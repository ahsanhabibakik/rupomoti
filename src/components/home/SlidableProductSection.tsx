'use client'

import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/products/ProductCard'

import { Product } from '@/types/product'

interface SlidableProductSectionProps {
  title: string
  products: Product[]
  viewAllLink: string
  className?: string
}

export default function SlidableProductSection({ 
  title, 
  products = [], // Add default empty array
  viewAllLink, 
  className = "" 
}: SlidableProductSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  // Safely handle products array
  const safeProducts = Array.isArray(products) ? products : []

  const handleScroll = () => {
    const container = scrollContainerRef.current
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0)
      setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth)
    }
  }

  const scrollLeft = () => {
    const container = scrollContainerRef.current
    if (container) {
      const scrollAmount = window.innerWidth < 768 ? 250 : 300
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    const container = scrollContainerRef.current
    if (container) {
      const scrollAmount = window.innerWidth < 768 ? 250 : 300
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  if (safeProducts.length === 0) {
    return (
      <section className={`py-8 sm:py-10 md:py-12 ${className}`}>
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
              {title}
            </h2>
            <p className="text-sm sm:text-base text-gray-600">No products available at the moment.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className={`py-8 sm:py-10 md:py-12 ${className}`}>
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 sm:mb-0">
            {title}
          </h2>
          
          {/* Desktop Navigation */}
          {safeProducts.length > 3 && (
            <div className="hidden md:flex gap-2">
              <button
                onClick={scrollLeft}
                disabled={!canScrollLeft}
                title="Scroll left"
                aria-label="Scroll products left"
                className={`p-2 rounded-full border transition-all duration-200 ${
                  canScrollLeft 
                    ? 'text-gray-700 hover:text-orange-600 hover:shadow-md bg-white' 
                    : 'text-gray-300 cursor-not-allowed bg-gray-50'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={scrollRight}
                disabled={!canScrollRight}
                title="Scroll right"
                aria-label="Scroll products right"
                className={`p-2 rounded-full border transition-all duration-200 ${
                  canScrollRight 
                    ? 'text-gray-700 hover:text-orange-600 hover:shadow-md bg-white' 
                    : 'text-gray-300 cursor-not-allowed bg-gray-50'
                }`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Slidable Products Container */}
        <div className="relative">
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex gap-3 sm:gap-4 md:gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {safeProducts.map((product, index) => (
              <motion.div
                key={product.id}
                className="flex-none w-48 xs:w-52 sm:w-64 md:w-72 lg:w-80"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <ProductCard 
                  product={product} 
                  className="h-full"
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* View All Button */}
        <div className="text-center mt-6">
          <Button asChild className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-full shadow-md hover:shadow-lg text-sm">
            <Link href={viewAllLink} className="flex items-center gap-2">
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
