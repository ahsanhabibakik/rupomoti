'use client'

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/products/ProductCard'
import { Product } from '@/types/product'

interface RegularProductSectionProps {
  title: string
  products: Product[]
  viewAllLink: string
  className?: string
  maxProducts?: number
}

export default function RegularProductSection({ 
  title, 
  products = [], // Add default empty array
  viewAllLink, 
  className = "",
  maxProducts = 8
}: RegularProductSectionProps) {
  // Safely handle products array
  const safeProducts = Array.isArray(products) ? products : []
  const displayProducts = safeProducts.slice(0, maxProducts)

  // Don't render if no products
  if (displayProducts.length === 0) {
    return (
      <section className={`py-8 sm:py-12 md:py-16 ${className}`}>
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {title}
            </h2>
            <p className="text-sm sm:text-base text-gray-600">No products available at the moment.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className={`py-8 sm:py-12 md:py-16 ${className}`}>
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-10 md:mb-12"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            {title}
          </h2>
          <div className="w-16 sm:w-20 md:w-24 h-1 bg-gradient-to-r from-orange-500 to-red-500 mx-auto mb-4 sm:mb-5 md:mb-6"></div>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            Discover our carefully curated collection of beautiful jewelry pieces
          </p>
        </motion.div>

        {/* Products Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 gap-y-4 sm:gap-y-6"
        >
          {displayProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <ProductCard 
                product={product} 
                compact={false}
                className="h-full"
              />
            </motion.div>
          ))}
        </motion.div>

        {/* View All Button */}
        {products.length > maxProducts && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mt-8 sm:mt-10 md:mt-12"
          >
            <Button asChild size="lg" className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
              <Link href={viewAllLink} className="flex items-center gap-2">
                View All Products
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  )
}
