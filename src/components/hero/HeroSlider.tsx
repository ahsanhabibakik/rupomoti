'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const slides = [
  {
    id: 1,
    title: 'Elegant Pearl Collection',
    description: 'Discover our exquisite collection of pearl jewelry',
    image: '/images/pearl/jewelery1.jpeg',
    link: '/shop?category=necklaces',
    buttonText: 'Shop Now'
  },
  {
    id: 2,
    title: 'Timeless Beauty',
    description: 'Classic designs that never go out of style',
    image: '/images/pearl/jewelery2.jpeg',
    link: '/shop?category=rings',
    buttonText: 'Explore Collection'
  },
  {
    id: 3,
    title: 'Modern Elegance',
    description: 'Contemporary pieces for the modern woman',
    image: '/images/pearl/jewelery3.jpeg',
    link: '/shop?category=earrings',
    buttonText: 'View Collection'
  }
]

export function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length)
        setIsTransitioning(false)
      }, 500)
    }, 5000)

    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
      setIsTransitioning(false)
    }, 500)
  }

  const prevSlide = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
      setIsTransitioning(false)
    }, 500)
  }

  return (
    <div className="relative h-[50vh] sm:h-[60vh] lg:h-[70vh] overflow-hidden">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-all duration-500 ${
            index === currentSlide 
              ? 'opacity-100 translate-x-0' 
              : index < currentSlide 
                ? '-translate-x-full opacity-0' 
                : 'translate-x-full opacity-0'
          }`}
        >
          <div className="relative w-full h-full">
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              className="object-cover"
              priority={index === 0}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-black/30" />
            <div className="absolute inset-0 flex items-center">
              <div className="container mx-auto px-4">
                <div className="max-w-2xl text-white">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 text-pearl-50">
                    {slide.title}
                  </h1>
                  <p className="text-lg sm:text-xl mb-8 text-pearl-100">
                    {slide.description}
                  </p>
                  <Button 
                    asChild 
                    size="lg"
                    className="bg-pearl-600 hover:bg-pearl-700 text-white"
                  >
                    <Link href={slide.link}>
                      {slide.buttonText}
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Buttons */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-pearl-600/30 text-white hover:bg-pearl-600/50 transition-colors"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-pearl-600/30 text-white hover:bg-pearl-600/50 transition-colors"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setIsTransitioning(true)
              setTimeout(() => {
                setCurrentSlide(index)
                setIsTransitioning(false)
              }, 500)
            }}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? 'bg-pearl-400 w-8' 
                : 'bg-pearl-400/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Transition Overlay */}
      {isTransitioning && (
        <div className="absolute inset-0 bg-pearl-900/20 backdrop-blur-sm transition-opacity duration-500" />
      )}
    </div>
  )
} 