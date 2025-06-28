'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Sparkles, Gift, Crown } from 'lucide-react'

interface PromoBannerProps {
  variant?: 'sale' | 'collection' | 'gift'
}

export function PromoBanner({ variant = 'sale' }: PromoBannerProps) {
  const bannerConfig = {
    sale: {
      badge: "Limited Time Offer",
      title: "Mega Sale Event",
      subtitle: "Up to 50% Off Selected Items",
      description: "Don't miss out on our biggest sale of the year. Premium jewelry at unbeatable prices.",
      cta: "Shop Sale Now",
      link: "/shop?sale=true",
      image: "/images/banners/sale-banner.jpg",
      bgColor: "from-red-600 to-pink-600",
      icon: Sparkles
    },
    collection: {
      badge: "New Arrival",
      title: "Royal Collection",
      subtitle: "Fit for Royalty",
      description: "Discover our exclusive royal collection featuring diamonds and precious gems.",
      cta: "Explore Collection",
      link: "/shop?collection=royal",
      image: "/images/banners/royal-banner.jpg",
      bgColor: "from-purple-600 to-blue-600",
      icon: Crown
    },
    gift: {
      badge: "Perfect Gifts",
      title: "Gift the Extraordinary",
      subtitle: "Occasions Made Special",
      description: "Find the perfect gift for your loved ones. Elegant jewelry for every special moment.",
      cta: "Shop Gifts",
      link: "/shop?category=gifts",
      image: "/images/banners/gift-banner.jpg",
      bgColor: "from-green-600 to-blue-600",
      icon: Gift
    }
  }

  const config = bannerConfig[variant]
  const IconComponent = config.icon

  return (
    <section className="py-8">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-gray-900 to-gray-800 shadow-2xl"
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src={config.image}
              alt={config.title}
              fill
              className="object-cover opacity-30"
            />
            <div className={`absolute inset-0 bg-gradient-to-r ${config.bgColor} opacity-80`} />
          </div>

          {/* Content */}
          <div className="relative z-10 px-8 py-12 md:px-12 md:py-16">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              {/* Left Content */}
              <div className="flex-1 text-center lg:text-left">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                >
                  <Badge className="bg-white/20 text-white border-white/30 mb-4 text-sm px-4 py-1.5">
                    <IconComponent className="w-4 h-4 mr-2" />
                    {config.badge}
                  </Badge>
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl md:text-5xl font-bold text-white mb-4"
                >
                  {config.title}
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="text-xl md:text-2xl text-orange-200 font-medium mb-4"
                >
                  {config.subtitle}
                </motion.p>

                <motion.p
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                  className="text-lg text-gray-200 mb-8 max-w-lg"
                >
                  {config.description}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 }}
                >
                  <Button asChild size="lg" className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-4 rounded-full text-lg font-semibold shadow-xl">
                    <Link href={config.link} className="flex items-center gap-2">
                      {config.cta}
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </Button>
                </motion.div>
              </div>

              {/* Right Content - Decorative Elements */}
              <div className="hidden lg:block flex-shrink-0">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                  whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
                  className="relative"
                >
                  <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <IconComponent className="w-16 h-16 text-white" />
                  </div>
                  
                  {/* Floating Sparkles */}
                  <motion.div
                    animate={{ y: [-5, 5, -5], rotate: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -top-4 -right-4 text-white/60"
                  >
                    <Sparkles className="w-6 h-6" />
                  </motion.div>
                  
                  <motion.div
                    animate={{ y: [5, -5, 5], rotate: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute -bottom-4 -left-4 text-white/60"
                  >
                    <Sparkles className="w-4 h-4" />
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Decorative Pattern */}
          <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <defs>
                <pattern id="pattern" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                  <circle cx="5" cy="5" r="1" fill="currentColor" />
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#pattern)" />
            </svg>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
