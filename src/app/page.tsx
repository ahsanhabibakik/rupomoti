import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProductCard } from '@/components/products/ProductCard'
import { HeroSlider } from '@/components/hero/HeroSlider'
import { Product } from '@/types/product'
import { prisma } from '@/lib/prisma'
import { GemIcon, Crown, Diamond, Sparkles, ArrowRight } from 'lucide-react'
import Loading from './loading'
import { AnimatedSection } from '@/components/ui/AnimatedSection'
import CategorySection from '@/components/home/CategorySection'
import SlidableProductSection from '@/components/home/SlidableProductSection'
import { getCategories } from '@/actions/getCategories'

export const metadata: Metadata = {
  title: 'Rupomoti - Elegant Pearl Jewelry Collection',
  description: 'Discover our exquisite collection of elegant pearl jewelry pieces. From timeless classics to modern designs, find the perfect pearl piece for every occasion.',
}

async function getProducts(filter: { [key: string]: boolean }) {
  return await prisma.product.findMany({
    where: filter,
    take: 4,
    orderBy: { createdAt: 'desc' },
    include: {
      category: true,
    },
  })
}

export default async function HomePage() {
  const [popularProducts, newArrivals, featuredProducts, categories] = await Promise.all([
    prisma.product.findMany({
      where: { isPopular: true },
      take: 4,
      include: { category: true },
    }),
    prisma.product.findMany({
      where: { isNewArrival: true },
      take: 4,
      include: { category: true },
    }),
    prisma.product.findMany({
      where: { isFeatured: true },
      take: 4,
      include: { category: true },
    }),
    getCategories({ active: true, level: 0 }),
  ])

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-transparent">
        <HeroSlider />
      </section>

      {/* Modern Categories Section */}
      <CategorySection categories={categories} />

      {/* Popular Products Section */}
      <SlidableProductSection 
        title="Popular Pieces"
        products={popularProducts}
        viewAllLink="/shop?filter=popular"
        className="bg-white"
      />

      {/* New Arrivals Section */}
      <SlidableProductSection 
        title="Latest Collection"
        products={newArrivals}
        viewAllLink="/shop?filter=new-arrivals"
        className="bg-gray-50"
      />

      {/* Featured Products */}
      <SlidableProductSection 
        title="Featured Collections"
        products={featuredProducts}
        viewAllLink="/shop?filter=featured"
        className="bg-white"
      />

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-orange-600 to-orange-700">
        <div className="container mx-auto max-w-4xl text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Find Your Perfect Piece
          </h2>
          <p className="text-lg text-orange-100 mb-8 max-w-2xl mx-auto">
            Explore our collection of elegant jewelry
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-3 rounded-full shadow-lg text-lg font-semibold">
              <Link href="/shop" className="flex items-center gap-2">
                Shop Now
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-orange-600 px-8 py-3 rounded-full text-lg font-semibold">
              <Link href="/about">
                Learn More
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
