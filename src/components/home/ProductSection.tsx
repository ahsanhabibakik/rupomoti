'use client'

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/products/ProductCard'

interface ProductSectionProps {
  title: string
  products: any[]
  viewAllLink: string
  className?: string
  maxProducts?: number
}

export default function ProductSection({ 
  title, 
  products, 
  viewAllLink, 
  className = "",
  maxProducts = 8
}: ProductSectionProps) {
  if (!products || products.length === 0) {
    return null
  }

  return (
    <section className={`py-12 ${className}`}>
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {title}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our carefully curated collection of elegant pieces
          </p>
        </div>

        {/* Products Grid - Mobile-first responsive design */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {products.slice(0, maxProducts).map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-8">
          <Button asChild className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-full shadow-md hover:shadow-lg">
            <Link href={viewAllLink} className="flex items-center gap-2">
              View All Collection
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
