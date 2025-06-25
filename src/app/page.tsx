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
  const popularProducts = await prisma.product.findMany({
    where: { isPopular: true },
    take: 4,
    include: {
      category: true,
    },
  })
  const newArrivals = await prisma.product.findMany({
    where: { isNewArrival: true },
    take: 4,
    include: {
      category: true,
    },
  })
  const featuredProducts = await prisma.product.findMany({
    where: { isFeatured: true },
    take: 4,
    include: {
      category: true,
    },
  })

  const categories = [
    { 
      id: 'necklaces',
      name: 'Pearl Necklaces', 
      count: '24',
      icon: Crown,
      image: '/images/pearl/jewelery1.jpeg',
      description: 'Elegant pearl necklaces for every occasion',
      color: 'from-pink-500/20 to-rose-500/20'
    },
    { 
      id: 'rings',
      name: 'Pearl Rings', 
      count: '38',
      icon: Diamond,
      image: '/images/pearl/jewelery2.jpeg',
      description: 'Stunning pearl rings that make a statement',
      color: 'from-blue-500/20 to-indigo-500/20'
    },
    { 
      id: 'earrings',
      name: 'Pearl Earrings', 
      count: '16',
      icon: Sparkles,
      image: '/images/pearl/jewelery3.jpeg',
      description: 'Beautiful pearl earrings for everyday elegance',
      color: 'from-purple-500/20 to-violet-500/20'
    },
    { 
      id: 'bracelets',
      name: 'Pearl Bracelets', 
      count: '29',
      icon: GemIcon,
      image: '/images/pearl/jewelery4.jpeg',
      description: 'Delicate pearl bracelets that complement any style',
      color: 'from-emerald-500/20 to-teal-500/20'
    }
  ]

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-transparent">
        <HeroSlider />
      </section>

      {/* Modern Categories Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <Badge className="bg-gradient-to-r from-pearl-600 to-pearl-700 text-white px-4 py-2 text-sm font-medium mb-4 shadow-lg">
              Collections
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Browse by Category
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Discover our curated collections of fine pearl jewelry, each piece crafted with precision and elegance
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => {
              const Icon = category.icon
              return (
                <Link
                  key={category.id}
                  href={`/shop?category=${category.id}`}
                  className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
                >
                  <div className="aspect-[4/5] relative">
                    <Image
                      src={category.image}
                      alt={category.name}
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent ${category.color}`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  
                  <div className="absolute inset-0 p-6 flex flex-col justify-end">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-white/20 backdrop-blur-sm rounded-full">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <Badge className="bg-white/20 backdrop-blur-sm text-white border-0 px-3 py-1">
                        {category.count} items
                      </Badge>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-pearl-200 transition-colors">
                      {category.name}
                    </h3>
                    
                    <p className="text-sm text-white/80 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 line-clamp-2 mb-4">
                      {category.description}
                    </p>
                    
                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <span className="text-white/90 text-sm font-medium">Explore Collection</span>
                      <ArrowRight className="w-4 h-4 text-white/90 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Popular Products Section */}
      <AnimatedSection className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 text-sm font-medium mb-4 shadow-lg">
              Popular
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Most Popular Pieces
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Our customers&apos; favorite pearl jewelry pieces, loved for their timeless beauty and exceptional quality
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button asChild size="lg" className="bg-gradient-to-r from-pearl-600 to-pearl-700 hover:from-pearl-700 hover:to-pearl-800 text-white px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <Link href="/shop?filter=popular" className="flex items-center gap-2">
                View All Popular
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </AnimatedSection>

      {/* New Arrivals Section */}
      <AnimatedSection className="py-16 px-4 bg-gradient-to-br from-pearl-50 via-white to-pearl-50">
        <div className="container mx-auto max-w-7xl">
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
      <AnimatedSection className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-7xl">
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
      <section className="py-20 px-4 bg-gradient-to-r from-pearl-600 to-pearl-700">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
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
