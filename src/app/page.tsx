import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProductCard } from '@/components/products/ProductCard'
import productsData from '@/data/products.json'
import { GemIcon, Crown, Diamond, Sparkles } from 'lucide-react'
import { HeroSlider } from '@/components/hero/HeroSlider'
import { CategorySection } from '@/components/home/CategorySection'
import { FeaturedSection } from '@/components/home/FeaturedSection'
import Link from 'next/link'

const categories = [
  { 
    id: 'necklaces',
    name: 'Necklaces', 
    count: '24',
    icon: Crown,
    image: '/images/pearl/jewelery1.jpeg',
    description: 'Elegant pearl necklaces for every occasion'
  },
  { 
    id: 'rings',
    name: 'Rings', 
    count: '38',
    icon: Diamond,
    image: '/images/pearl/jewelery2.jpeg',
    description: 'Stunning pearl rings that make a statement'
  },
  { 
    id: 'earrings',
    name: 'Earrings', 
    count: '16',
    icon: Sparkles,
    image: '/images/pearl/jewelery3.jpeg',
    description: 'Beautiful pearl earrings for everyday elegance'
  },
  { 
    id: 'bracelets',
    name: 'Bracelets', 
    count: '29',
    icon: GemIcon,
    image: '/images/pearl/jewelery4.jpeg',
    description: 'Delicate pearl bracelets that complement any style'
  }
]

export default function HomePage() {
  const products = productsData.products
  
  // For new arrivals, we'll use the first 8 products
  const newArrivals = productsData.products.slice(0, 8)

  // For best sellers, we'll randomly select 8 products with a stable sort
  const bestSellers = [...productsData.products]
    .sort((a, b) => parseInt(a.id) - parseInt(b.id))
    .slice(0, 8)

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <HeroSlider />

      {/* Categories Section */}
      <section className="py-12 px-4 sm:py-16 bg-gradient-to-b from-background to-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <Badge className="bg-primary/10 text-primary mb-4">Collections</Badge>
            <h2 className="text-2xl sm:text-3xl font-bold">Browse by Category</h2>
            <p className="text-muted-foreground mt-2">Discover our curated collections of fine pearl jewelry</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {categories.map((category) => {
              const Icon = category.icon
              return (
                <Link
                  key={category.id}
                  href={`/shop/${category.id}`}
                  className="group relative overflow-hidden rounded-xl sm:rounded-2xl"
                >
                  <div className="aspect-[4/5] relative">
            <Image
                      src={category.image}
                      alt={category.name}
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  </div>
                  <div className="absolute inset-0 p-3 sm:p-6 flex flex-col justify-end text-white">
                    <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-secondary" />
                      <Badge variant="secondary" className="text-xs sm:text-sm">{category.count} items</Badge>
                    </div>
                    <h3 className="text-base sm:text-xl font-semibold mb-1 sm:mb-2">{category.name}</h3>
                    <p className="text-xs sm:text-sm text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity line-clamp-2">
                      {category.description}
                    </p>
                  </div>
                </Link>
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
            <p className="text-muted-foreground mt-2">Our most popular and exclusive pieces</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
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

      {/* Why Choose Us Section */}
      <section className="py-12 sm:py-16 px-4 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <Badge className="bg-primary/10 text-primary mb-4">Why Rupomoti</Badge>
            <h2 className="text-2xl sm:text-3xl font-bold">Why Choose Rupomoti</h2>
            <p className="text-muted-foreground mt-2">Experience the difference of premium pearl jewelry</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="text-center p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-white shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 bg-primary/10 rounded-full flex items-center justify-center">
                <Diamond className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4">Premium Quality</h3>
              <p className="text-muted-foreground text-sm sm:text-base">
                Each piece is crafted with the finest materials and attention to detail
              </p>
            </div>
            <div className="text-center p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-white shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 bg-secondary/10 rounded-full flex items-center justify-center">
                <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-secondary" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4">Certified Authentic</h3>
              <p className="text-muted-foreground text-sm sm:text-base">
                All our jewelry comes with authentication certificates
              </p>
            </div>
            <div className="text-center p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-white shadow-lg hover:shadow-xl transition-shadow sm:col-span-2 md:col-span-1">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 bg-accent/10 rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-accent" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4">Lifetime Warranty</h3>
              <p className="text-muted-foreground text-sm sm:text-base">
                We stand behind our craftsmanship with lifetime warranty
              </p>
            </div>
          </div>
        </div>
      </section>

      <FeaturedSection
        title="New Arrivals"
        description="Discover our latest jewelry pieces, featuring exquisite designs and timeless elegance."
        products={newArrivals}
        viewAllLink="/new-arrivals"
      />

      <div className="bg-gray-50">
        <FeaturedSection
          title="Best Sellers"
          description="Our customers' favorite pieces that have captured hearts and continue to be our most sought-after selections."
          products={bestSellers}
          viewAllLink="/best-sellers"
        />
      </div>
    </div>
  )
}
