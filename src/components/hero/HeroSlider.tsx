'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
    description: 'Find the perfect piece to celebrate life\'s special moments'
  },
  {
    image: '/images/hero/slider3.jpeg',
    title: 'Handcrafted',
    subtitle: 'With Love',
    description: 'Each piece is carefully crafted to bring out the natural beauty of pearls'
  }
]

const SLIDE_DURATION = 5000 // 5 seconds per slide

export function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  // Handle automatic slide changes
  useEffect(() => {
    if (isPaused) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
      setProgress(0)
    }, SLIDE_DURATION)

    return () => clearInterval(interval)
  }, [isPaused])

  // Handle progress bar
  useEffect(() => {
    if (isPaused) return

    const startTime = Date.now()
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime
      const newProgress = (elapsed / SLIDE_DURATION) * 100

      if (newProgress >= 100) {
        setProgress(0)
      } else {
        setProgress(newProgress)
      }
    }, 50)

    return () => clearInterval(timer)
  }, [currentSlide, isPaused])

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
    setProgress(0)
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
    setProgress(0)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
    setProgress(0)
  }

  return (
    <section 
      className="relative h-[50vh] sm:h-[60vh] lg:h-[70vh] max-h-[600px] flex items-center justify-center overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Image
            src={slide.image}
            alt={`Slide ${index + 1}`}
            className="object-cover"
            fill
            priority={index === 0}
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-4">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-2 animate-fade-up [--slide-delay:200ms]">
              {slide.title}
            </h2>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl mb-4 animate-fade-up [--slide-delay:400ms]">
              {slide.subtitle}
            </h3>
            <p className="max-w-lg text-lg text-white/90 mb-8 animate-fade-up [--slide-delay:600ms]">
              {slide.description}
            </p>
            <Button 
              variant="secondary" 
              size="lg"
              className="animate-fade-up [--slide-delay:800ms] bg-white hover:bg-white/90 text-gray-900"
            >
              Shop Now
            </Button>
          </div>
        </div>
      ))}
      
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-white/80 text-gray-800 hover:bg-white transition-colors"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-white/80 text-gray-800 hover:bg-white transition-colors"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className="w-3 h-3 rounded-full transition-all"
            style={{
              backgroundColor: index === currentSlide ? 'white' : 'rgba(255, 255, 255, 0.5)'
            }}
          />
        ))}
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
        <div
          className="h-full bg-white transition-all duration-300 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </section>
  )
} 