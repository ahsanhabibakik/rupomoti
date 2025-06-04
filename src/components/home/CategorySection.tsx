'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const categories = [
  {
    id: 'pearl-necklaces',
    name: 'Pearl Necklaces',
    image: '/images/categories/necklaces.jpg',
    description: 'Elegant pearl necklaces for every occasion',
    featured: true
  },
  {
    id: 'pearl-earrings',
    name: 'Pearl Earrings',
    image: '/images/categories/earrings.jpg',
    description: 'Beautiful pearl earrings'
  },
  {
    id: 'pearl-bracelets',
    name: 'Pearl Bracelets',
    image: '/images/categories/bracelets.jpg',
    description: 'Stunning pearl bracelets'
  },
  {
    id: 'pearl-rings',
    name: 'Pearl Rings',
    image: '/images/categories/rings.jpg',
    description: 'Exquisite pearl rings'
  },
  {
    id: 'pearl-sets',
    name: 'Pearl Sets',
    image: '/images/categories/sets.jpg',
    description: 'Complete pearl jewelry sets'
  }
]

export function CategorySection() {
  const [scrollPosition, setScrollPosition] = useState(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current
    if (!container) return

    const scrollAmount = 300
    const newPosition = direction === 'left' 
      ? scrollPosition - scrollAmount 
      : scrollPosition + scrollAmount

    container.scrollTo({
      left: newPosition,
      behavior: 'smooth'
    })
    setScrollPosition(newPosition)
  }

  const featuredCategory = categories.find(cat => cat.featured)
  const regularCategories = categories.filter(cat => !cat.featured)

  return (
    <section className="py-12 px-4 md:px-6">
      <div className="container mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
          Browse by Category
        </h2>

        <div className="relative">
          <div className="category-grid">
            {/* Featured Category */}
            {featuredCategory && (
              <Link
                href={`/shop/${featuredCategory.id}`}
                className="relative aspect-[3/4] row-span-2 overflow-hidden rounded-2xl group"
              >
                <Image
                  src={featuredCategory.image}
                  alt={featuredCategory.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-2xl font-bold mb-2">{featuredCategory.name}</h3>
                  <p className="text-white/90 mb-4">{featuredCategory.description}</p>
                  <Button variant="secondary" size="sm">
                    Explore Collection
                  </Button>
                </div>
              </Link>
            )}

            {/* Regular Categories Slider */}
            <div className="col-span-2 relative">
              <div
                ref={scrollContainerRef}
                className="grid grid-flow-col auto-cols-[250px] gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar"
              >
                {regularCategories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/shop/${category.id}`}
                    className="relative aspect-square overflow-hidden rounded-xl group snap-start"
                  >
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <h3 className="text-lg font-semibold mb-1">{category.name}</h3>
                      <p className="text-sm text-white/90">{category.description}</p>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Navigation Buttons */}
              <button
                onClick={() => scroll('left')}
                className={cn(
                  "absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/80 text-gray-800 hover:bg-white transition-all",
                  scrollPosition <= 0 && "opacity-50 cursor-not-allowed"
                )}
                disabled={scrollPosition <= 0}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/80 text-gray-800 hover:bg-white transition-all"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 