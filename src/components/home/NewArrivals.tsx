'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const newArrivals = [
  {
    id: 1,
    name: 'South Sea Pearl Necklace',
    image: '/images/products/south-sea-necklace.jpg',
    price: 2499,
    description: 'Luxurious South Sea pearl necklace with 18k gold chain'
  },
  {
    id: 2,
    name: 'Akoya Pearl Earrings',
    image: '/images/products/akoya-earrings.jpg',
    price: 1299,
    description: 'Classic Akoya pearl earrings with diamond accents'
  }
]

export function NewArrivals() {
  return (
    <section className="py-12 px-4 md:px-6">
      <div className="container mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">
          New Arrivals
        </h2>
        <p className="text-muted-foreground text-center mb-8 max-w-2xl mx-auto">
          Discover our latest additions of exquisite pearl jewelry
        </p>

        <div className="new-arrivals-grid">
          {newArrivals.map((product) => (
            <div key={product.id} className="group relative">
              <div className="relative aspect-[4/3] md:aspect-[16/9] overflow-hidden rounded-2xl">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0" />
                
                {/* Mobile Layout */}
                <div className="absolute inset-0 flex md:hidden flex-col justify-end p-6 text-white">
                  <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                  <p className="text-white/90 mb-4 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">৳{product.price.toLocaleString()}</span>
                    <Button variant="secondary" size="sm">
                      Shop Now
                    </Button>
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden md:block absolute inset-0">
                  <div className="h-full flex items-center justify-center p-8">
                    <div className="text-center text-white">
                      <h3 className="text-3xl font-bold mb-4">{product.name}</h3>
                      <p className="text-lg text-white/90 mb-6 max-w-lg mx-auto">
                        {product.description}
                      </p>
                      <div className="flex flex-col items-center gap-4">
                        <span className="text-2xl font-semibold">
                          ৳{product.price.toLocaleString()}
                        </span>
                        <Button variant="secondary" size="lg">
                          Shop Now
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
} 