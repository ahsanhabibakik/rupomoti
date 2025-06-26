'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Category } from '@prisma/client'
import { ArrowRight } from 'lucide-react'

interface CategorySectionProps {
  categories: Category[]
}

export default function CategorySection({ categories }: CategorySectionProps) {
  if (!categories || categories.length === 0) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-700">No categories to display.</h2>
          <p className="text-gray-500 mt-2">Please check back later.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-white sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Shop by Category
          </h2>
          <p className="mt-4 text-lg leading-6 text-gray-500">
            Find the perfect piece from our curated collections.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 sm:gap-x-6 lg:gap-x-8">
          {categories.map((category) => (
            <motion.div
              key={category.id}
              className="group relative"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <div className="relative w-full h-80 bg-white rounded-lg overflow-hidden group-hover:opacity-75 sm:aspect-w-2 sm:aspect-h-1 sm:h-64 lg:aspect-w-1 lg:aspect-h-1 shadow-lg hover:shadow-2xl transition-shadow">
                <Image
                  src={category.image || '/placeholder.png'}
                  alt={category.name}
                  fill
                  className="w-full h-full object-center object-cover"
                />
              </div>
              <h3 className="mt-6 text-base font-semibold text-gray-900">
                <Link href={`/shop?category=${category.slug}`}>
                  <span className="absolute inset-0" />
                  {category.name}
                </Link>
              </h3>
              <p className="text-sm text-gray-500 line-clamp-2">
                {category.description}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/shop"
            className="inline-flex items-center text-orange-600 font-semibold hover:text-orange-500"
          >
            See all categories <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
} 