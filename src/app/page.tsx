import { Metadata } from 'next'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProductCard } from '@/components/products/ProductCard'
import productsJson from '@/data/products.json'
import { GemIcon, Crown, Diamond, Sparkles } from 'lucide-react'
import { HeroSlider } from '@/components/hero/HeroSlider'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Rupomoti - Elegant Pearl Jewelry Collection',
  description: 'Discover our exquisite collection of elegant pearl jewelry pieces. From timeless classics to modern designs, find the perfect pearl piece for every occasion.',
}

export default function HomePage() {
  const products = productsJson.products

  // Get best sellers (for demo, we'll use the first 4 products)
  const bestSellers = products.slice(0, 4).map(product => ({
    ...product,
    isBestSeller: true,
  }))

  // Get new arrivals (for demo, we'll use the last 4 products)
  const newArrivals = products.slice(-4).map(product => ({
    ...product,
    isNew: true,
  }))

  const categories = [
    { 
      id: 'necklaces',
      name: 'Pearl Necklaces', 
      count: '24',
      icon: Crown,
      image: '/images/pearl/jewelery1.jpeg',
      description: 'Elegant pearl necklaces for every occasion'
    },
    { 
      id: 'rings',
      name: 'Pearl Rings', 
      count: '38',
      icon: Diamond,
      image: '/images/pearl/jewelery2.jpeg',
      description: 'Stunning pearl rings that make a statement'
    },
    { 
      id: 'earrings',
      name: 'Pearl Earrings', 
      count: '16',
      icon: Sparkles,
      image: '/images/pearl/jewelery3.jpeg',
      description: 'Beautiful pearl earrings for everyday elegance'
    },
    { 
      id: 'bracelets',
      name: 'Pearl Bracelets', 
      count: '29',
      icon: GemIcon,
      image: '/images/pearl/jewelery4.jpeg',
      description: 'Delicate pearl bracelets that complement any style'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-transparent">
        <div className="relative w-full h-[500px]">
          <HeroSlider />
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 px-4 sm:py-16 bg-gradient-to-b from-base to-base-light">
        <div className="container mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <Badge className="bg-accent/10 text-accent mb-4">Collections</Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral">Browse by Category</h2>
            <p className="text-neutral-light mt-2">Discover our curated collections of fine pearl jewelry</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Link
                  key={category.id}
                  href={`/shop?category=${category.id}`}
                  className="group relative overflow-hidden rounded-xl sm:rounded-2xl shadow-premium hover:shadow-accent transition-all duration-300"
                >
                  <div className="aspect-[4/5] relative">
                    <Image
                      src={category.image}
                      alt={category.name}
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral/80 via-neutral/30 to-transparent" />
                  </div>
                  <div className="absolute inset-0 p-3 sm:p-6 flex flex-col justify-end text-base">
                    <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                      <Badge className="bg-accent/20 text-accent text-xs sm:text-sm">{category.count} items</Badge>
                    </div>
                    <h3 className="text-base sm:text-xl font-semibold mb-1 sm:mb-2">{category.name}</h3>
                    <p className="text-xs sm:text-sm text-base/80 opacity-0 group-hover:opacity-100 transition-opacity line-clamp-2">
                      {category.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="py-12 px-4 sm:py-16 bg-base-light">
        <div className="container mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <Badge className="bg-accent/10 text-accent mb-4">Best Sellers</Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral">Most Popular Pieces</h2>
            <p className="text-neutral-light mt-2">Our customers&apos; favorite pearl jewelry pieces</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {bestSellers.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                description={product.description}
                price={product.price}
                image={product.images[0]}
                isBestSeller={product.isBestSeller}
                isOutOfStock={product.isOutOfStock}
                discount={product.discount}
              />
            ))}
          </div>
          <div className="text-center mt-8">
            <Button asChild variant="outline" size="lg" className="border-accent text-accent hover:bg-accent hover:text-primary">
              <Link href="/shop?sort=popular">View All Best Sellers</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="py-12 px-4 sm:py-16 bg-base">
        <div className="container mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <Badge className="bg-primary/10 text-primary mb-4">New Arrivals</Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral">Latest Collection</h2>
            <p className="text-neutral-light mt-2">Discover our newest pearl jewelry pieces</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {newArrivals.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                description={product.description}
                price={product.price}
                image={product.images[0]}
                isNew={product.isNew}
                isOutOfStock={product.isOutOfStock}
                discount={product.discount}
              />
            ))}
          </div>
          <div className="text-center mt-8">
            <Button asChild variant="outline" size="lg" className="border-primary text-primary hover:bg-primary hover:text-accent">
              <Link href="/shop?sort=newest">View All New Arrivals</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 px-4 sm:py-16 bg-base-light">
        <div className="container mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <Badge className="bg-accent/10 text-accent mb-4">Featured</Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral">Featured Collections</h2>
            <p className="text-neutral-light mt-2">Our most popular and exclusive pearl pieces</p>
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
                isOutOfStock={product.isOutOfStock}
                discount={product.discount}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
