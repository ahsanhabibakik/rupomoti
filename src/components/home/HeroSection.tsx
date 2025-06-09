'use client'

import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export function HeroSection() {
  const router = useRouter()

  return (
    <section className="relative h-[600px] w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero-bg.jpg"
          alt="Elegant jewelry collection"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
            Discover Timeless Elegance
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-200">
            Explore our exquisite collection of handcrafted jewelry pieces, where tradition meets contemporary design.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Button
              size="lg"
              onClick={() => router.push('/shop')}
              className="bg-primary hover:bg-primary/90"
            >
              Shop Collection
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push('/about')}
              className="border-white text-white hover:bg-white/10"
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
} 