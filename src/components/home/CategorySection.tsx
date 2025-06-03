'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

const categories = [
  {
    id: 'necklaces',
    name: 'Necklaces',
    image: '/images/categories/necklaces.jpg',
    description: 'Elegant necklaces for every occasion'
  },
  {
    id: 'earrings',
    name: 'Earrings',
    image: '/images/categories/earrings.jpg',
    description: 'Beautiful earrings to complement your style'
  },
  {
    id: 'rings',
    name: 'Rings',
    image: '/images/categories/rings.jpg',
    description: 'Stunning rings for that special moment'
  },
  {
    id: 'bracelets',
    name: 'Bracelets',
    image: '/images/categories/bracelets.jpg',
    description: 'Charming bracelets for everyday wear'
  }
]

export function CategorySection() {
  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold">Shop by Category</h2>
          <Link href="/shop">
            <Button variant="link" className="text-primary">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/shop/${category.id}`}
              className="group block"
            >
              <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 transition-opacity group-hover:bg-black/30" />
                <div className="absolute inset-0 p-4 flex flex-col justify-end">
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {category.name}
                  </h3>
                  <p className="text-sm text-white/90">
                    {category.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
} 