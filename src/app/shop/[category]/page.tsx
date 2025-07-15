'use client'

// Client-side with dynamic data fetching (good for category filtering)
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
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
import { notFound } from 'next/navigation'

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

export default async function CategoryPage({ params }: { params: Promise<any> }) {
  const { category } = await params;
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000])
  const [sortBy, setSortBy] = useState<string>('newest')

  const categoryObj = categories.find((c) => c.id === category)
  if (!categoryObj) {
    notFound()
  }

  useEffect(() => {
    setSelectedCategories([category])
  }, [category])

  const filteredProducts = productsData.filter((product) => {
    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.includes(product.category)
    const matchesPrice =
      product.price >= priceRange[0] && product.price <= priceRange[1]
    return matchesCategory && matchesPrice
  })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price
      case 'price-high':
        return b.price - a.price
      case 'popular':
        return b.popularity - a.popularity
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
  })

  const FilterSection = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div className="space-y-4">
        <h3 className="font-medium">Categories</h3>
        <div className="space-y-2">
          {categories.map((cat) => (
            <label
              key={cat.id}
              className="flex items-center space-x-2"
            >
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedCategories([...selectedCategories, cat.id])
                  } else {
                    setSelectedCategories(
                      selectedCategories.filter((id) => id !== cat.id)
                    )
                  }
                }}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span>{cat.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-4">
        <h3 className="font-medium">Price Range</h3>
        <div className="space-y-4">
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            min={0}
            max={100000}
            step={1000}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>৳{priceRange[0].toLocaleString()}</span>
            <span>৳{priceRange[1].toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">{categoryObj.name}</h1>
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
      {(selectedCategories.length > 1 || priceRange[0] > 0 || priceRange[1] < 100000) && (
        <div className="flex flex-wrap gap-2 mb-6">
          {selectedCategories
            .filter((id) => id !== category)
            .map((categoryId) => {
              const cat = categories.find((c) => c.id === categoryId)
              return (
                <Badge
                  key={categoryId}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() =>
                    setSelectedCategories(
                      selectedCategories.filter((id) => id !== categoryId)
                    )
                  }
                >
                  {cat?.name} ×
                </Badge>
              )
            })}
          {(priceRange[0] > 0 || priceRange[1] < 100000) && (
            <Badge
              variant="secondary"
              className="cursor-pointer"
              onClick={() => setPriceRange([0, 100000])}
            >
              Price: ৳{priceRange[0].toLocaleString()} - ৳
              {priceRange[1].toLocaleString()} ×
            </Badge>
          )}
        </div>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sortedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
} 