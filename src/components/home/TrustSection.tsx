'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Shield, Award, Truck, RefreshCw, Heart, Star } from 'lucide-react'

const trustFeatures = [
  {
    icon: Shield,
    title: "Lifetime Warranty",
    description: "Every piece comes with our comprehensive lifetime warranty"
  },
  {
    icon: Award,
    title: "Certified Quality",
    description: "All jewelry is certified by international quality standards"
  },
  {
    icon: Truck,
    title: "Free Shipping",
    description: "Complimentary shipping on all orders above $50"
  },
  {
    icon: RefreshCw,
    title: "Easy Returns",
    description: "30-day hassle-free return policy on all purchases"
  }
]

const partnerLogos = [
  { name: "GIA", logo: "/images/partners/gia-logo.png" },
  { name: "Tiffany & Co", logo: "/images/partners/tiffany-logo.png" },
  { name: "Cartier", logo: "/images/partners/cartier-logo.png" },
  { name: "Bulgari", logo: "/images/partners/bulgari-logo.png" },
  { name: "Pandora", logo: "/images/partners/pandora-logo.png" },
  { name: "Swarovski", logo: "/images/partners/swarovski-logo.png" }
]

export function TrustSection() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Trust Features */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16"
        >
          {trustFeatures.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center group"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-50 to-red-50 rounded-full mb-4 group-hover:from-orange-100 group-hover:to-red-100 transition-all duration-300">
                  <IconComponent className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {feature.description}
                </p>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Partner Logos */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="border-t border-gray-200 pt-12"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Trusted by Leading Brands
            </h3>
            <p className="text-gray-600">
              We partner with the world&apos;s most prestigious jewelry brands
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
            {partnerLogos.map((partner, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex items-center justify-center"
              >
                <div className="relative w-24 h-12 grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100">
                  <Image
                    src={partner.logo}
                    alt={partner.name}
                    fill
                    className="object-contain"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-orange-50 to-red-50 rounded-3xl p-8 md:p-12 mt-16"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-center mb-3">
                <Heart className="w-6 h-6 text-red-500 mr-2" />
                <span className="text-3xl md:text-4xl font-bold text-gray-900">50K+</span>
              </div>
              <p className="text-gray-600 font-medium">Happy Customers</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-center mb-3">
                <Star className="w-6 h-6 text-yellow-500 mr-2" />
                <span className="text-3xl md:text-4xl font-bold text-gray-900">4.9</span>
              </div>
              <p className="text-gray-600 font-medium">Average Rating</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center justify-center mb-3">
                <Award className="w-6 h-6 text-blue-500 mr-2" />
                <span className="text-3xl md:text-4xl font-bold text-gray-900">15</span>
              </div>
              <p className="text-gray-600 font-medium">Years Experience</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center justify-center mb-3">
                <Truck className="w-6 h-6 text-green-500 mr-2" />
                <span className="text-3xl md:text-4xl font-bold text-gray-900">100K+</span>
              </div>
              <p className="text-gray-600 font-medium">Orders Delivered</p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
