'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SectionHeader } from './SectionHeader'

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Fashion Designer",
    image: "/images/testimonials/customer-1.jpg",
    rating: 5,
    text: "The quality of jewelry from Rupomoti is absolutely exceptional. Every piece I've purchased has exceeded my expectations. The craftsmanship is evident in every detail.",
    location: "New York, USA"
  },
  {
    id: 2,
    name: "Priya Sharma", 
    role: "Entrepreneur",
    image: "/images/testimonials/customer-2.jpg",
    rating: 5,
    text: "I've been a loyal customer for over 2 years. The pearl collection is stunning and the customer service is outstanding. Highly recommend to anyone looking for elegant jewelry.",
    location: "Mumbai, India"
  },
  {
    id: 3,
    name: "Emma Wilson",
    role: "Artist",
    image: "/images/testimonials/customer-3.jpg",
    rating: 5,
    text: "Found the perfect engagement ring here! The team was incredibly helpful and the customization options were amazing. My fiancé absolutely loves it.",
    location: "London, UK"
  },
  {
    id: 4,
    name: "Fatima Al-Zahra",
    role: "Doctor",
    image: "/images/testimonials/customer-4.jpg",
    rating: 5,
    text: "The bridal collection is breathtaking. I wore Rupomoti jewelry on my wedding day and received countless compliments. It made me feel like a princess.",
    location: "Dubai, UAE"
  },
  {
    id: 5,
    name: "Lisa Chen",
    role: "Marketing Director",
    image: "/images/testimonials/customer-5.jpg",
    rating: 5,
    text: "Professional quality and beautiful designs. I've bought multiple pieces as gifts and they're always well-received. The packaging is also gorgeous.",
    location: "Singapore"
  }
]

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying) return
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }, 4000)
    
    return () => clearInterval(timer)
  }, [isAutoPlaying])

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    setIsAutoPlaying(false)
  }

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
    setIsAutoPlaying(false)
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
        }`}
      />
    ))
  }

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          icon="users"
          badge="Customer Love"
          title="What Our Customers Say"
          subtitle="Real stories from real customers who trust us with their most precious moments"
          badgeColor="from-purple-500 to-pink-500"
          iconColor="text-purple-500"
        />

        <div className="relative max-w-4xl mx-auto">
          {/* Main Testimonial */}
          <div className="relative overflow-hidden rounded-2xl bg-white shadow-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                className="p-8 md:p-12"
              >
                <div className="flex flex-col md:flex-row items-center gap-8">
                  {/* Customer Image */}
                  <div className="flex-shrink-0">
                    <div className="relative w-24 h-24 md:w-32 md:h-32">
                      <Image
                        src={testimonials[currentIndex].image}
                        alt={testimonials[currentIndex].name}
                        fill
                        className="object-cover rounded-full border-4 border-orange-200"
                      />
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center">
                        <Quote className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 text-center md:text-left">
                    {/* Rating */}
                    <div className="flex justify-center md:justify-start mb-4">
                      {renderStars(testimonials[currentIndex].rating)}
                    </div>

                    {/* Testimonial Text */}
                    <blockquote className="text-lg md:text-xl text-gray-700 mb-6 italic leading-relaxed">
                      &ldquo;{testimonials[currentIndex].text}&rdquo;
                    </blockquote>

                    {/* Customer Info */}
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 mb-1">
                        {testimonials[currentIndex].name}
                      </h4>
                      <p className="text-orange-600 font-medium mb-1">
                        {testimonials[currentIndex].role}
                      </p>
                      <p className="text-gray-500 text-sm">
                        {testimonials[currentIndex].location}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="absolute top-1/2 -translate-y-1/2 left-4 right-4 flex justify-between pointer-events-none">
              <Button
                onClick={prevTestimonial}
                variant="outline"
                size="icon"
                className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm border-gray-200 hover:bg-white hover:shadow-lg pointer-events-auto"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                onClick={nextTestimonial}
                variant="outline"
                size="icon"
                className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm border-gray-200 hover:bg-white hover:shadow-lg pointer-events-auto"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Testimonial Indicators */}
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index)
                  setIsAutoPlaying(false)
                }}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-gradient-to-r from-orange-400 to-red-400'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-12 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-3xl font-bold text-orange-600 mb-2">50K+</div>
              <div className="text-gray-600">Happy Customers</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <div className="text-3xl font-bold text-orange-600 mb-2">4.9★</div>
              <div className="text-gray-600">Average Rating</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <div className="text-3xl font-bold text-orange-600 mb-2">100K+</div>
              <div className="text-gray-600">Orders Delivered</div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
