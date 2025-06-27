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
      <AnimatedSection className="py-16 bg-white">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <Badge className="bg-accent-light text-neutral px-4 py-2 text-sm font-medium mb-4 shadow-premium">
              Popular
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-neutral mb-2">
              Most Popular Pieces
            </h2>
            <p className="text-lg text-neutral-light max-w-2xl mx-auto">
              Our customers&apos; favorite pearl jewelry pieces
            </p>
          </div>
          <div className="product-grid-enhanced">
            {popularProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
          <div className="text-center mt-8">
            <Button asChild size="lg" className="bg-primary hover:bg-primary-dark text-accent px-8 py-3 rounded-full shadow-lg transition-premium">
              <Link href="/shop?filter=popular" className="flex items-center gap-2">
                View All Popular
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </AnimatedSection>

      {/* New Arrivals Section */}
      <AnimatedSection className="py-16 bg-gradient-to-br from-pearl-50 via-white to-pearl-50">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 text-sm font-medium mb-4 shadow-lg">
              New Arrivals
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Latest Collection
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Discover our newest pearl jewelry pieces, featuring the latest trends and innovative designs
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newArrivals.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button asChild variant="outline" size="lg" className="border-pearl-600 text-pearl-600 hover:bg-pearl-600 hover:text-white px-8 py-4 rounded-full transition-all duration-300 transform hover:-translate-y-1">
              <Link href="/shop?filter=new-arrivals" className="flex items-center gap-2">
                View All New Arrivals
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </AnimatedSection>

      {/* Featured Products */}
      <AnimatedSection className="py-16 bg-white">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-4 py-2 text-sm font-medium mb-4 shadow-lg">
              Featured
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Featured Collections
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Our most popular and exclusive pearl pieces, carefully selected for their exceptional beauty and craftsmanship
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-pearl-600 to-pearl-700">
        <div className="container mx-auto max-w-4xl text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold  mb-6">
            Discover Your Perfect Pearl
          </h2>
          <p className="text-xl text-pearl-100 mb-10 max-w-3xl mx-auto leading-relaxed">
            Explore our extensive collection of pearl jewelry and find the perfect piece that speaks to your style and elegance
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button asChild size="lg" className="bg-white text-pearl-600 hover:bg-gray-100 px-10 py-4 rounded-full shadow-lg text-lg font-semibold">
              <Link href="/shop" className="flex items-center gap-2">
                Shop Now
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-pearl-600 px-10 py-4 rounded-full text-lg font-semibold">
              <Link href="/about" className="flex items-center gap-2">
                Learn More
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
