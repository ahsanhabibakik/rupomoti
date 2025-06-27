'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Category } from '@prisma/client'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { useRef, useState } from 'react'

interface CategorySectionProps {
  categories: Category[]
}

export default function CategorySection({ categories }: CategorySectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  if (!categories || categories.length === 0) {
    return (
      <section className="py-16 bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-700">No categories to display.</h2>
          <p className="text-gray-500 mt-2">Please check back later.</p>
        </div>
      </section>
    )
  }

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
      container.scrollBy({ left: -320, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    const container = scrollContainerRef.current
    if (container) {
      container.scrollBy({ left: 320, behavior: 'smooth' })
    }
  }

  return (
    <section className="py-16 bg-gradient-to-br from-orange-50 to-amber-50 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-orange-100 rounded-full text-orange-800 text-sm font-medium mb-4">
            ✨ Curated Collections
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
            Discover Our Jewelry Categories
          </h2>
          <p className="mt-4 text-lg leading-6 text-gray-600 max-w-2xl mx-auto">
            From elegant necklaces to stunning earrings, explore our handcrafted collections designed for every occasion.
          </p>
        </div>

        {/* Category Carousel */}
        <div className="relative">
          {/* Navigation Buttons */}
          {categories.length > 3 && (
            <>
              <button
                onClick={scrollLeft}
                disabled={!canScrollLeft}
                className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white shadow-lg border transition-all duration-200 ${
                  canScrollLeft 
                    ? 'text-gray-700 hover:text-orange-600 hover:shadow-xl' 
                    : 'text-gray-300 cursor-not-allowed'
                }`}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={scrollRight}
                disabled={!canScrollRight}
                className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white shadow-lg border transition-all duration-200 ${
                  canScrollRight 
                    ? 'text-gray-700 hover:text-orange-600 hover:shadow-xl' 
                    : 'text-gray-300 cursor-not-allowed'
                }`}
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Scrollable Container */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4 px-8"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                className="flex-none w-72 group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
              >
                <Link href={`/shop?category=${category.slug}`} className="block">
                  <div className="relative h-56 bg-white rounded-2xl overflow-hidden shadow-lg group-hover:shadow-2xl transition-all duration-300">
                    <Image
                      src={category.image || '/images/hero/pearl-collection-1.jpg'}
                      alt={category.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                  </div>
                  
                  {/* Category Info */}
                  <div className="mt-4 px-2">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {category.description}
                      </p>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* View All Link */}
        <div className="mt-12 text-center">
          <Link
            href="/shop"
            className="inline-flex items-center px-6 py-3 bg-orange-600 text-white font-semibold rounded-full hover:bg-orange-700 transition-colors shadow-lg hover:shadow-xl"
          >
            Explore All Collections 
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  )
}