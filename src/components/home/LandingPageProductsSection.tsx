'use client'

import { Product } from '@/types/product'
import { ProductCard } from '@/components/products/ProductCard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Star, Crown, Sparkles, Target } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface LandingPageProductsSectionProps {
  products: Product[]
  title?: string
  subtitle?: string
  className?: string
}

export function LandingPageProductsSection({ 
  products, 
  title = "Premium Collection", 
  subtitle = "Specially curated products with enhanced shopping experience",
  className = "" 
}: LandingPageProductsSectionProps) {
  if (products.length === 0) return null

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  }

  return (
    <section className={`py-12 md:py-16 lg:py-20 relative overflow-hidden ${className}`}>
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-amber-50">
        <div className="absolute top-10 left-10 opacity-20">
          <Crown className="w-16 h-16 text-orange-400" />
        </div>
        <div className="absolute bottom-10 right-10 opacity-20">
          <Sparkles className="w-12 h-12 text-amber-400" />
        </div>
        <div className="absolute top-1/2 left-1/4 opacity-10">
          <Target className="w-8 h-8 text-orange-500" />
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="text-center mb-8 md:mb-12"
        >
          <motion.div variants={itemVariants} className="flex items-center justify-center gap-2 mb-4">
            <Badge variant="outline" className="px-4 py-2 text-sm font-semibold border-orange-300 text-orange-700 bg-orange-100 flex items-center">
              <Star className="w-4 h-4 mr-2 fill-current" />
              Premium Collection
            </Badge>
          </motion.div>
          
          <motion.h2 
            variants={itemVariants}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4"
          >
            {title}
          </motion.h2>
          
          <motion.p 
            variants={itemVariants}
            className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto"
          >
            {subtitle}
          </motion.p>
          
          {/* Special Landing Page Indicator */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 mt-6 text-sm text-gray-600"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs sm:text-sm">Enhanced Product Pages</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-xs sm:text-sm">Rich Product Information</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <span className="text-xs sm:text-sm">Customer Reviews</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Products Grid */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6 mb-8"
        >
          {products.map((product, index) => (
            <motion.div 
              key={product.id} 
              variants={itemVariants}
              className="relative group"
            >
              {/* Landing Page Badge */}
              <div className="absolute top-2 left-2 z-10">
                <Badge className="bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0 shadow-lg text-xs font-bold flex items-center">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Premium
                </Badge>
              </div>
              
              {/* Sale Badge */}
              {product.salePrice && product.salePrice < product.price && (
                <div className="absolute top-2 right-2 z-10">
                  <Badge variant="destructive" className="text-xs font-bold shadow-lg">
                    {Math.round(((product.price - product.salePrice) / product.price) * 100)}% OFF
                  </Badge>
                </div>
              )}
              
              <div className="relative overflow-hidden rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <ProductCard product={product} />
                
                {/* Enhanced overlay for landing page products */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4">
                  <Button 
                    asChild 
                    size="sm" 
                    className="bg-white text-black hover:bg-gray-100 font-semibold shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300"
                  >
                    <Link href={`/product/${product.slug}`}>
                      View Details
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Call to Action */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="text-center"
        >
          <motion.div variants={itemVariants}>
            <Button 
              asChild 
              size="lg" 
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-6 sm:px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
            >
              <Link href="/shop?filter=landing-page" className="flex items-center justify-center gap-2 text-sm sm:text-base">
                <Crown className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Explore All Premium Products</span>
                <span className="sm:hidden">View All Premium</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
            </Button>
          </motion.div>
          
          <motion.p 
            variants={itemVariants}
            className="text-sm text-gray-500 mt-4"
          >
            Free shipping on all premium collection items
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}