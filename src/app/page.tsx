'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProductCard } from '@/components/products/ProductCard'
import productsData from '@/data/products.json'
import { GemIcon, Crown, Diamond, Sparkles } from 'lucide-react'
import { HeroSlider } from '@/components/hero/HeroSlider'

const categories = [
  { 
    name: 'Necklaces', 
    count: '24',
    icon: Crown,
    image: '/images/pearl/jewelery1.jpeg',
    description: 'Elegant pearl necklaces for every occasion'
  },
  { 
    name: 'Rings', 
    count: '38',
    icon: Diamond,
    image: '/images/pearl/jewelery2.jpeg',
    description: 'Stunning pearl rings that make a statement'
  },
  { 
    name: 'Earrings', 
    count: '16',
    icon: Sparkles,
    image: '/images/pearl/jewelery3.jpeg',
    description: 'Beautiful pearl earrings for everyday elegance'
  },
  { 
    name: 'Bracelets', 
    count: '29',
    icon: GemIcon,
    image: '/images/pearl/jewelery4.jpeg',
    description: 'Delicate pearl bracelets that complement any style'
  }
]

async function getProducts() {
  return productsData.products
}

export default async function Home() {
  const products = await getProducts()
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <HeroSlider />

      {/* Categories Section - Immediately below hero */}
      <section className="py-12 px-4 sm:py-16 bg-gradient-to-b from-background to-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <Badge className="bg-primary/10 text-primary mb-4">Collections</Badge>
            <h2 className="text-2xl sm:text-3xl font-bold">Browse by Category</h2>
            <p className="text-gray-600 mt-2">Discover our curated collections of fine pearl jewelry</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {categories.map((category) => {
              const Icon = category.icon
              return (
                <div
                  key={category.name}
                  className="group relative overflow-hidden rounded-2xl cursor-pointer"
                >
                  <div className="aspect-[4/5] relative">
                    <Image
                      src={category.image}
                      alt={category.name}
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  </div>
                  <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="w-5 h-5 text-secondary" />
                      <Badge variant="secondary">{category.count} items</Badge>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                    <p className="text-sm text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity">
                      {category.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 px-4 sm:py-16 bg-background">
        <div className="container mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <Badge className="bg-secondary/10 text-secondary mb-4">Featured</Badge>
            <h2 className="text-2xl sm:text-3xl font-bold">Featured Collections</h2>
            <p className="text-gray-600 mt-2">Our most popular and exclusive pieces</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                description={product.description}
                price={product.price}
                image={product.images[0]}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Special Offer Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-background to-primary/5">
        <div className="container mx-auto text-center">
          <Badge className="bg-accent/10 text-accent mb-4">Special Offer</Badge>
          <h2 className="text-3xl font-bold mb-6">
            Get 20% Off Your First Purchase
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter and receive exclusive offers, new collection alerts, and styling tips.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90">
              Subscribe Now
            </Button>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <Badge className="bg-primary/10 text-primary mb-4">Why Rupomoti</Badge>
            <h2 className="text-3xl font-bold">Why Choose Rupomoti</h2>
            <p className="text-gray-600 mt-2">Experience the difference of premium pearl jewelry</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
                <Diamond className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Premium Quality</h3>
              <p className="text-gray-600">
                Each piece is crafted with the finest materials and attention to detail
              </p>
            </div>
            <div className="text-center p-6 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 mx-auto mb-6 bg-secondary/10 rounded-full flex items-center justify-center">
                <Crown className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Certified Authentic</h3>
              <p className="text-gray-600">
                All our jewelry comes with authentication certificates
              </p>
            </div>
            <div className="text-center p-6 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 mx-auto mb-6 bg-accent/10 rounded-full flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Lifetime Warranty</h3>
              <p className="text-gray-600">
                We stand behind our craftsmanship with lifetime warranty
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
