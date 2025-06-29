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
  products, 
  viewAllLink, 
  className = "",
  maxProducts = 8
}: RegularProductSectionProps) {
  const displayProducts = products.slice(0, maxProducts)

  return (
    <section className={`py-16 ${className}`}>
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-red-500 mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our carefully curated collection of beautiful jewelry pieces
          </p>
        </motion.div>

        {/* Products Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6"
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
            className="text-center mt-12"
          >
            <Button asChild size="lg" className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
              <Link href={viewAllLink} className="flex items-center gap-2">
                View All Products
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  )
}
