'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Star, Sparkles, Heart, Crown } from 'lucide-react'

const banners = [
  {
    id: 1,
    title: "Exquisite Pearl Collection",
    subtitle: "Timeless Elegance Redefined",
    description: "Discover handcrafted jewelry that tells your unique story",
    image: "/images/hero/hero-1.jpg",
    cta: "Shop Collection",
    link: "/shop",
    badge: "New Collection",
    color: "from-purple-600 to-pink-600"
  },
  {
    id: 2,
    title: "Limited Edition Pieces",
    subtitle: "Luxury That Speaks",
    description: "Premium jewelry crafted with the finest materials",
    image: "/images/hero/hero-2.jpg",
    cta: "Explore Limited",
    link: "/shop?filter=featured",
    badge: "Limited Edition",
    color: "from-blue-600 to-purple-600"
  },
  {
    id: 3,
    title: "Bridal Collection",
    subtitle: "Your Perfect Moment",
    description: "Celebrate love with our exclusive bridal jewelry",
    image: "/images/hero/hero-3.jpg",
    cta: "View Bridal",
    link: "/shop?category=bridal",
    badge: "Bridal Special",
    color: "from-rose-600 to-orange-600"
  }
]

export function ModernHeroBanner() {
  const [currentBanner, setCurrentBanner] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="relative h-[70vh] min-h-[500px] overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentBanner}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          <Image
            src={banners[currentBanner].image}
            alt={banners[currentBanner].title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/40" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <motion.div
              key={`badge-${currentBanner}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Badge className={`bg-gradient-to-r ${banners[currentBanner].color} text-white border-0 mb-4 text-sm px-3 py-1`}>
                <Sparkles className="w-3 h-3 mr-1" />
                {banners[currentBanner].badge}
              </Badge>
            </motion.div>

            <motion.h1
              key={`title-${currentBanner}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight"
            >
              {banners[currentBanner].title}
            </motion.h1>

            <motion.p
              key={`subtitle-${currentBanner}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl md:text-2xl text-orange-200 font-medium mb-4"
            >
              {banners[currentBanner].subtitle}
            </motion.p>

            <motion.p
              key={`desc-${currentBanner}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-lg text-gray-200 mb-8 max-w-lg"
            >
              {banners[currentBanner].description}
            </motion.p>

            <motion.div
              key={`cta-${currentBanner}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button asChild size="lg" className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-4 rounded-full text-lg font-semibold shadow-xl">
                <Link href={banners[currentBanner].link} className="flex items-center gap-2">
                  {banners[currentBanner].cta}
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              
              <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 rounded-full text-lg font-semibold">
                <Link href="/about">Learn More</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Banner Indicators */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentBanner(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentBanner ? 'bg-white' : 'bg-white/50'
            }`}
          />
        ))}
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 right-20 hidden lg:block">
        <motion.div
          animate={{ y: [-10, 10, -10] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="text-white/20"
        >
          <Crown className="w-16 h-16" />
        </motion.div>
      </div>
      
      <div className="absolute bottom-32 right-32 hidden lg:block">
        <motion.div
          animate={{ y: [10, -10, 10] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="text-white/20"
        >
          <Heart className="w-12 h-12" />
        </motion.div>
      </div>
    </div>
  )
}
