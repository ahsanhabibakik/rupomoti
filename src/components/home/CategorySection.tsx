'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Category } from '@/types/mongoose-types'

interface CategorySectionProps {
  categories: Category[]
}

export default function CategorySection({ categories }: CategorySectionProps) {
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
      container.scrollBy({ left: -250, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    const container = scrollContainerRef.current
    if (container) {
      container.scrollBy({ left: 250, behavior: 'smooth' })
    }
  }

  if (!categories || categories.length === 0) {
    return null
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Shop by Category
          </h2>
          
          {/* Desktop Navigation */}
          {categories.length > 4 && (
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

        {/* Slidable Categories Container */}
        <div className="relative">
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                className="flex-none"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link
                  href={`/category/${category.slug}`}
                  className="block group"
                >
                  <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 w-40 sm:w-48">
                    <div className="relative aspect-square mb-3 overflow-hidden rounded-lg bg-gray-100">
                      {category.image ? (
                        <Image
                          src={category.image}
                          alt={category.name}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="(max-width: 640px) 160px, 192px"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                          <span className="text-orange-600 text-2xl font-bold">
                            {category.name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <h3 className="text-center text-sm font-semibold text-gray-900 group-hover:text-orange-600 transition-colors duration-200">
                      {category.name}
                    </h3>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
