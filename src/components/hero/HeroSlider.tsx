'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const slides = [
  {
    image: '/images/hero/slider1.jpeg',
    title: 'Discover the Timeless',
    subtitle: 'Beauty of Pearls',
    description: 'Exquisite jewelry pieces that tell your unique story, crafted with the finest pearls'
  },
  {
    image: '/images/hero/slider2.jpeg',
    title: 'Elegant Collection',
    subtitle: 'For Every Occasion',
    description: 'Find the perfect piece to celebrate life's special moments'
  },
  {
    image: '/images/hero/slider3.jpg',
    title: 'Handcrafted',
    subtitle: 'With Love',
    description: 'Each piece is carefully crafted to bring out the natural beauty of pearls'
  }
]

export function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  return (
    <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Image
            src={slide.image}
            alt={slide.title}
            className="object-cover"
            fill
            priority={index === 0}
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/40" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative z-20 text-center text-white px-4 max-w-5xl mx-auto">
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                {slide.title}
                <span className="text-secondary block mt-2">{slide.subtitle}</span>
              </h1>
              <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto text-gray-200">
                {slide.description}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white">
                  Explore Collections
                </Button>
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                  View Catalog
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
      
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentSlide ? 'bg-white w-4' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </section>
  )
} 