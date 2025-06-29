'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ProductCard } from '@/components/products/ProductCard'
import { SectionHeader } from './SectionHeader'
import { Button } from '@/components/ui/button'
import { ArrowRight, Grid3X3, LayoutGrid } from 'lucide-react'
import Link from 'next/link'

interface PremiumProductShowcaseProps {
  icon: 'crown' | 'diamond' | 'sparkles' | 'trendingUp' | 'heart' | 'users' | 'bookOpen' | 'star' | 'gift' | 'award' | 'shoppingBag'
  badge: string
  title: string
  subtitle: string
  products: any[]
  viewAllLink: string
  className?: string
  badgeColor?: string
  iconColor?: string
  layout?: 'grid' | 'featured'
}

export function PremiumProductShowcase({
  icon,
  badge,
  title,
  subtitle,
  products,
  viewAllLink,
  className = "",
  badgeColor = "from-orange-500 to-red-500",
  iconColor = "text-orange-500",
  layout = 'grid'
}: PremiumProductShowcaseProps) {
  const [activeCategory, setActiveCategory] = useState('all')

  if (!products || products.length === 0) {
    return null
  }

  const categories = ['all', 'rings', 'necklaces', 'earrings', 'bracelets']
  
  const filteredProducts = activeCategory === 'all' 
    ? products 
    : products.filter(product => 
        product.category?.slug?.toLowerCase().includes(activeCategory) ||
        product.name?.toLowerCase().includes(activeCategory)
      )

  const displayProducts = filteredProducts.slice(0, layout === 'featured' ? 6 : 8)

  return (
    <section className={`py-16 ${className}`}>
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          icon={icon}
          badge={badge}
          title={title}
          subtitle={subtitle}
          badgeColor={badgeColor}
          iconColor={iconColor}
        />

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                activeCategory === category
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:border-gray-300'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </motion.div>

        {/* Products Layout */}
        {layout === 'featured' ? (
          // Featured Layout - Mix of sizes
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* Large Featured Product */}
            {displayProducts[0] && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="md:col-span-2 lg:row-span-2"
              >
                <div className="relative h-full min-h-[400px] bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-8 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10" />
                  <div className="relative z-10 w-full max-w-sm">
                    <ProductCard product={displayProducts[0]} />
                  </div>
                  <div className="absolute top-4 left-4">
                    <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Featured
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Regular Products */}
            {displayProducts.slice(1, 6).map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        ) : (
          // Grid Layout
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-12"
          >
            {displayProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <Button asChild size="lg" className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
            <Link href={viewAllLink} className="flex items-center gap-2">
              <Grid3X3 className="w-5 h-5" />
              View All Collection
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
