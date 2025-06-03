'use client'

import { useState } from 'react'
import { ProductCard } from '@/components/products/ProductCard'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { ChevronDown, SlidersHorizontal } from 'lucide-react'
import productsData from '@/data/products.json'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

const categories = [
  { id: 'necklaces', name: 'Necklaces' },
  { id: 'earrings', name: 'Earrings' },
  { id: 'rings', name: 'Rings' },
  { id: 'bracelets', name: 'Bracelets' },
  { id: 'anklets', name: 'Anklets' },
]

const sortOptions = [
  { id: 'newest', name: 'Newest First' },
  { id: 'price-low', name: 'Price: Low to High' },
  { id: 'price-high', name: 'Price: High to Low' },
  { id: 'popular', name: 'Most Popular' },
]

export default function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedSort, setSelectedSort] = useState('newest')
  const [priceRange, setPriceRange] = useState([0, 10000])
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)

  const products = productsData.products

  const filteredProducts = products.filter((product) => {
    if (selectedCategory !== 'all' && product.category !== selectedCategory) {
      return false
    }
    if (product.price < priceRange[0] || product.price > priceRange[1]) {
      return false
    }
    return true
  })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (selectedSort) {
      case 'price-low':
        return a.price - b.price
      case 'price-high':
        return b.price - a.price
      case 'popular':
        return (b.soldCount || 0) - (a.soldCount || 0)
      default:
        return 0
    }
  })

  const FilterSection = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-medium mb-4">Categories</h3>
        <div className="space-y-3">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setSelectedCategory('all')}
          >
            All Products
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Price Range */}
      <div>
        <h3 className="font-medium mb-4">Price Range</h3>
        <div className="space-y-4">
          <Slider
            defaultValue={[0, 10000]}
            max={10000}
            step={100}
            value={priceRange}
            onValueChange={setPriceRange}
          />
          <div className="flex items-center justify-between">
            <span>৳{priceRange[0].toLocaleString()}</span>
            <span>৳{priceRange[1].toLocaleString()}</span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Sort */}
      <div>
        <h3 className="font-medium mb-4">Sort By</h3>
        <div className="space-y-3">
          {sortOptions.map((option) => (
            <Button
              key={option.id}
              variant={selectedSort === option.id ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setSelectedSort(option.id)}
            >
              {option.name}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">All Products</h1>
          <p className="text-muted-foreground">
            {filteredProducts.length} products found
          </p>
        </div>
        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <Sheet open={isMobileFiltersOpen} onOpenChange={setIsMobileFiltersOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                className="sm:hidden"
                onClick={() => setIsMobileFiltersOpen(true)}
              >
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <SheetHeader className="mb-6">
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <FilterSection />
            </SheetContent>
          </Sheet>
          <div className="relative">
            <Button variant="outline" className="w-[140px] justify-between">
              <span>Sort By</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Active Filters */}
      {(selectedCategory !== 'all' || selectedSort !== 'newest' || priceRange[0] !== 0 || priceRange[1] !== 10000) && (
        <div className="flex flex-wrap gap-2 mb-6">
          {selectedCategory !== 'all' && (
            <Badge variant="secondary" className="px-3 py-1">
              {categories.find(c => c.id === selectedCategory)?.name}
              <button
                className="ml-2"
                onClick={() => setSelectedCategory('all')}
              >
                ×
              </button>
            </Badge>
          )}
          {selectedSort !== 'newest' && (
            <Badge variant="secondary" className="px-3 py-1">
              {sortOptions.find(o => o.id === selectedSort)?.name}
              <button
                className="ml-2"
                onClick={() => setSelectedSort('newest')}
              >
                ×
              </button>
            </Badge>
          )}
          {(priceRange[0] !== 0 || priceRange[1] !== 10000) && (
            <Badge variant="secondary" className="px-3 py-1">
              ৳{priceRange[0].toLocaleString()} - ৳{priceRange[1].toLocaleString()}
              <button
                className="ml-2"
                onClick={() => setPriceRange([0, 10000])}
              >
                ×
              </button>
            </Badge>
          )}
        </div>
      )}

      <div className="flex gap-8">
        {/* Desktop Filters */}
        <div className="hidden sm:block w-[240px] flex-shrink-0 sticky top-[80px]">
          <ScrollArea className="h-[calc(100vh-100px)]">
            <div className="pr-4">
              <FilterSection />
            </div>
          </ScrollArea>
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sortedProducts.map((product) => (
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
      </div>
    </div>
  )
} 