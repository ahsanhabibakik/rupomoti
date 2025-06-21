'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'

const categories = [
  {
    id: 1,
    name: 'Necklaces',
    image: '/images/categories/necklaces.jpg',
    href: '/categories/necklaces',
    description: 'Elegant necklaces for every occasion',
  },
  {
    id: 2,
    name: 'Earrings',
    image: '/images/categories/earrings.jpg',
    href: '/categories/earrings',
    description: 'Stunning earrings to complement your style',
  },
  {
    id: 3,
    name: 'Rings',
    image: '/images/categories/rings.jpg',
    href: '/categories/rings',
    description: 'Beautiful rings that make a statement',
  },
  {
    id: 4,
    name: 'Bracelets',
    image: '/images/categories/bracelets.jpg',
    href: '/categories/bracelets',
    description: 'Charming bracelets for your wrist',
  },
  {
    id: 5,
    name: 'Pearl Sets',
    image: '/images/categories/sets.jpg',
    href: '/categories/sets',
    description: 'Complete pearl jewelry sets',
  },
  {
    id: 6,
    name: 'Gifts',
    image: '/images/categories/gifts.jpg',
    href: '/categories/gifts',
    description: 'Perfect gifts for your loved ones',
  },
]

export default function CategorySection() {
  const [hoveredId, setHoveredId] = useState<number | null>(null)

  return (
    <section className="py-16 bg-gradient-to-b from-orange-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Explore Our Collections
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our exquisite range of pearl jewelry, crafted with precision
            and passion
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => (
            <motion.div
              key={category.id}
              className="group relative overflow-hidden rounded-2xl shadow-lg"
              onHoverStart={() => setHoveredId(category.id)}
              onHoverEnd={() => setHoveredId(null)}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <Link href={category.href}>
                <div className="relative aspect-[4/3]">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-2xl font-semibold mb-2">{category.name}</h3>
                  <p className="text-sm text-white/80 mb-4">
                    {category.description}
                  </p>
                  <motion.div
                    className="flex items-center text-orange-300"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{
                      opacity: hoveredId === category.id ? 1 : 0,
                      x: hoveredId === category.id ? 0 : -20,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <span className="text-sm font-medium">Shop Now</span>
                    <svg
                      className="w-4 h-4 ml-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </motion.div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/categories"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 transition-colors"
          >
            View All Categories
            <svg
              className="ml-2 -mr-1 w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
} 