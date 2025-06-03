'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const featuredCollections = [
  {
    id: 1,
    title: 'Diamond Collection',
    image: '/images/diamond-collection.jpg',
    description: 'Exquisite diamond pieces that capture eternal beauty',
    price: 'Starting from $999'
  },
  {
    id: 2,
    title: 'Gold Essentials',
    image: '/images/gold-collection.jpg',
    description: 'Timeless gold jewelry for every occasion',
    price: 'Starting from $499'
  },
  {
    id: 3,
    title: 'Wedding Collection',
    image: '/images/wedding-collection.jpg',
    description: 'Special pieces for your special day',
    price: 'Starting from $799'
  }
]

const categories = [
  { name: 'Necklaces', count: '24' },
  { name: 'Rings', count: '38' },
  { name: 'Earrings', count: '16' },
  { name: 'Bracelets', count: '29' }
]

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-black/30 z-10" />
        <div className="relative z-20 text-center text-white px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Discover Timeless Beauty
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
            Exquisite jewelry pieces that tell your unique story
          </p>
          <Button size="lg" className="bg-primary hover:bg-primary/90">
            Explore Collections
          </Button>
        </div>
      </section>

      {/* Featured Collections */}
      <section className="py-16 px-4 bg-background">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Featured Collections
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCollections.map((collection) => (
              <Card key={collection.id} className="overflow-hidden group">
                <div className="relative h-64 overflow-hidden">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors z-10" />
                  <div className="relative h-full w-full bg-gray-200">
                    {/* Replace with actual images later */}
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{collection.title}</h3>
                  <p className="text-gray-600 mb-4">{collection.description}</p>
                  <p className="font-medium text-primary">{collection.price}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Browse by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category) => (
              <div
                key={category.name}
                className="group cursor-pointer text-center p-6 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                <Badge variant="secondary">{category.count} items</Badge>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Special Offer Section */}
      <section className="py-16 px-4 bg-primary/5">
        <div className="container mx-auto text-center">
          <Badge className="mb-4">Special Offer</Badge>
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
            <Button className="w-full sm:w-auto">
              Subscribe Now
            </Button>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose Rupomoti
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-2xl">✨</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Premium Quality</h3>
              <p className="text-gray-600">
                Each piece is crafted with the finest materials and attention to detail
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-2xl">🛡️</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Certified Authentic</h3>
              <p className="text-gray-600">
                All our jewelry comes with authentication certificates
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-2xl">💝</span>
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
