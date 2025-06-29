'use client'

import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/products/ProductCard'

interface SlidableProductSectionProps {
  title: string
  products: any[]
  viewAllLink: string
  className?: string
}

export default function SlidableProductSection({ 
  title, 
  products, 
  viewAllLink, 
  className = "" 
}: SlidableProductSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

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
      container.scrollBy({ left: -300, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    const container = scrollContainerRef.current
    if (container) {
      container.scrollBy({ left: 300, behavior: 'smooth' })
    }
  }

  if (!products || products.length === 0) {
    return null
  }

  return (
    <section className={`py-12 ${className}`}>
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            {title}
          </h2>
          
          {/* Desktop Navigation */}
          {products.length > 3 && (
            <div className="hidden md:flex gap-2">
              <button
                onClick={scrollLeft}
                disabled={!canScrollLeft}
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
            className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                className="flex-none w-full sm:w-72 md:w-80"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <ProductCard product={product} />
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
