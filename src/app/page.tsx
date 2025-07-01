// ISR: Revalidate homepage data every hour
export const revalidate = 3600
export const dynamic = 'auto'

import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProductCard } from '@/components/products/ProductCard'
import { HeroSlider } from '@/components/hero/HeroSlider'
import { Product } from '@/types/product'
import { getHomePageData } from '@/actions/home-actions'
import { GemIcon, Crown, Diamond, Sparkles, ArrowRight } from 'lucide-react'
import Loading from './loading'
import { AnimatedSection } from '@/components/ui/AnimatedSection'
import CategorySection from '@/components/home/CategorySection'
import SlidableProductSection from '@/components/home/SlidableProductSection'
import GridProductSection from '@/components/home/GridProductSection'
import RegularProductSection from '@/components/home/RegularProductSection'
import SeasonalOffersBanner from '@/components/home/SeasonalOffersBanner'
import ModernBlogSection from '@/components/home/ModernBlogSection'
import { getCategories } from '@/actions/getCategories'

export const metadata: Metadata = {
  title: 'Rupomoti - Elegant Pearl Jewelry Collection',
  description: 'Discover our exquisite collection of elegant pearl jewelry pieces. From timeless classics to modern designs, find the perfect pearl piece for every occasion.',
}

export default async function HomePage() {
  const { popularProducts, newArrivals, featuredProducts, regularProducts } = await getHomePageData()
  const categories = await getCategories({ active: true, level: 0 })

  return (
    <div className="flex flex-col min-h-screen">
      {/* Seasonal Offers Banner */}
      <SeasonalOffersBanner />
      
      {/* Hero Section */}
      <section className="bg-transparent">
        <HeroSlider />
      </section>

      {/* Shop by Category Section */}
      <AnimatedSection>
        <div className="container mx-auto max-w-7xl">
          <CategorySection categories={categories} />
        </div>
      </AnimatedSection>

      {/* Featured Collections Section */}
      <AnimatedSection>
        <div className="bg-white border-t border-b border-gray-100">
          <div className="container mx-auto max-w-7xl">
            <GridProductSection 
              title="Best Selling Flowers & Gifts"
              products={featuredProducts}
              viewAllLink="/shop?filter=featured"
              className="bg-white"
              mobileColumns={2}
              desktopColumns={4}
              showMoreProducts={8}
            />
          </div>
        </div>
      </AnimatedSection>

      {/* Latest Collection Section - Slider */}
      <AnimatedSection>
        <SlidableProductSection 
          title="Latest Collection"
          products={newArrivals}
          viewAllLink="/shop?filter=new-arrivals"
          className="bg-secondary/50"
        />
      </AnimatedSection>

      {/* Popular Pieces Section */}
      <AnimatedSection>
        <div className="bg-white border-t border-b border-gray-100">
          <div className="container mx-auto max-w-7xl">
            <GridProductSection 
              title="Popular Pieces"
              products={popularProducts}
              viewAllLink="/shop?filter=popular"
              className="bg-white"
              mobileColumns={2}
              desktopColumns={4}
              showMoreProducts={8}
            />
          </div>
        </div>
      </AnimatedSection>

      {/* Regular Products Section */}
      <AnimatedSection>
        <RegularProductSection 
          title="Our Collection"
          products={regularProducts}
          viewAllLink="/shop"
          className="bg-gray-50"
          maxProducts={8}
        />
      </AnimatedSection>

      {/* Modern Blog Section */}
      <AnimatedSection>
        <ModernBlogSection 
          maxPosts={4}
          showFeaturedOnly={false}
          className="bg-background"
        />
      </AnimatedSection>

      {/* Testimonials Section */}
      <AnimatedSection>
        <section className="py-12 md:py-16 bg-muted">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">
                What Our Customers Say
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Discover why thousands of customers trust us for their jewelry needs
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {[
                {
                  text: "The quality of the pearls is exceptional. I've received so many compliments!",
                  name: "Sarah Ahmed",
                  role: "Verified Customer"
                },
                {
                  text: "Beautiful craftsmanship and excellent customer service. Highly recommended!",
                  name: "Fatima Khan",
                  role: "Jewelry Enthusiast"
                },
                {
                  text: "Perfect for special occasions. The packaging was elegant and delivery was prompt.",
                  name: "Ayesha Rahman",
                  role: "Happy Customer"
                }
              ].map((testimonial, index) => (
                <div key={index} className="bg-background p-6 rounded-lg shadow-sm border border-accent/20">
                  <div className="mb-4">
                    <div className="flex text-accent mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Sparkles key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <p className="text-foreground text-sm md:text-base italic">
                      &ldquo;{testimonial.text}&rdquo;
                    </p>
                  </div>
                  <div className="border-t border-accent/20 pt-4">
                    <p className="font-semibold text-primary text-sm">{testimonial.name}</p>
                    <p className="text-muted-foreground text-xs">{testimonial.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Enhanced CTA Section */}
      <AnimatedSection>
        <section className="py-12 md:py-16 lg:py-20 bg-gradient-to-r from-primary to-accent relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 left-4 md:top-8 md:left-8">
              <Diamond className="w-8 h-8 md:w-12 md:h-12 text-background" />
            </div>
            <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8">
              <GemIcon className="w-6 h-6 md:w-10 md:h-10 text-background" />
            </div>
            <div className="absolute top-1/2 left-1/4 transform -translate-y-1/2">
              <Crown className="w-4 h-4 md:w-6 md:h-6 text-background" />
            </div>
          </div>
          
          <div className="container mx-auto max-w-7xl text-center px-4 sm:px-6 lg:px-8 relative">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-background mb-4 md:mb-6">
              Find Your Perfect Piece
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-secondary mb-6 md:mb-8 max-w-2xl mx-auto">
              Explore our collection of elegant jewelry crafted with the finest materials
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center">
              <Button asChild size="lg" className="w-full sm:w-auto bg-background text-primary hover:bg-secondary px-6 md:px-8 py-3 rounded-full shadow-lg text-base md:text-lg font-semibold transition-all duration-300 hover:scale-105">
                <Link href="/shop" className="flex items-center justify-center gap-2">
                  Shop Now
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto border-background text-background hover:bg-background hover:text-primary px-6 md:px-8 py-3 rounded-full text-base md:text-lg font-semibold transition-all duration-300 hover:scale-105">
                <Link href="/about">
                  Learn More
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </AnimatedSection>
    </div>
  )
}
