"use client"

import { useState, useEffect } from 'react'
import { ProductCard } from '@/components/products/ProductCard'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { ProductCardSkeleton } from '@/components/products/ProductCardSkeleton'
import { useDebounce } from '@/hooks/useDebounce'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { SlidersHorizontal, Search, X } from 'lucide-react'

const categories = [
  { id: 'necklaces', name: 'Necklaces' },
  { id: 'earrings', name: 'Earrings' },
  { id: 'rings', name: 'Rings' },
  { id: 'bracelets', name: 'Bracelets' },
  { id: 'anklets', name: 'Anklets' },
  { id: 'popular', name: 'Most Popular' },
]

const sortOptions = [
  { id: 'newest', name: 'Newest First' },
  { id: 'price-low', name: 'Price: Low to High' },
  { id: 'price-high', name: 'Price: High to Low' },
  { id: 'popular', name: 'Most Popular' },
]

const FilterSection = ({ 
  inSheet = false,
  selectedCategories,
  setSelectedCategories,
  priceRange,
  setPriceRange,
}: { 
  inSheet?: boolean;
  selectedCategories: string[];
  setSelectedCategories: React.Dispatch<React.SetStateAction<string[]>>;
  priceRange: [number, number];
  setPriceRange: (value: [number, number]) => void;
}) => {
    
    const handlePriceInputChange = (index: 0 | 1, value: string) => {
        const newRange = [...priceRange] as [number, number];
        const numValue = parseInt(value, 10);
        newRange[index] = isNaN(numValue) ? (index === 0 ? 0 : 100000) : numValue;
        setPriceRange(newRange);
    }

    const validatePriceRange = () => {
        let [min, max] = priceRange;
        if (min < 0) min = 0;
        if (max > 100000) max = 100000;
        if (min > max) {
            setPriceRange([max, min]); // Swap them if min > max
        } else {
            setPriceRange([min, max]); // Otherwise just clamp
        }
    }
    
    return (
        <ScrollArea className={inSheet ? 'h-[calc(100vh-200px)]' : 'h-auto'}>
            <div className="space-y-8 pr-4">
                {/* Categories */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-foreground">Categories</h3>
                    <div className="space-y-2">
                        {categories.map((category) => (
                            <label key={category.id} className="flex items-center space-x-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={selectedCategories.includes(category.id)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedCategories([...selectedCategories, category.id])
                                        } else {
                                            setSelectedCategories(selectedCategories.filter((id) => id !== category.id))
                                        }
                                    }}
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary focus:ring-2 focus:ring-offset-0"
                                />
                                <span className="text-muted-foreground group-hover:text-foreground transition-colors">{category.name}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Price Range */}
                <div className="space-y-6">
                    <h3 className="font-semibold text-foreground">Price Range</h3>
                    <Slider
                        value={priceRange}
                        onValueChange={(value) => setPriceRange([value[0], value[1]])}
                        min={0}
                        max={100000}
                        step={1000}
                        className="w-full"
                    />
                    <div className="flex justify-between items-center text-sm text-muted-foreground space-x-2">
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">৳</span>
                            <Input
                                type="number"
                                value={priceRange[0]}
                                onChange={(e) => handlePriceInputChange(0, e.target.value)}
                                onBlur={validatePriceRange}
                                className="w-full pl-7 h-9"
                                placeholder="Min"
                            />
                        </div>
                        <span className="flex-shrink-0">-</span>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">৳</span>
                            <Input
                                type="number"
                                value={priceRange[1]}
                                onChange={(e) => handlePriceInputChange(1, e.target.value)}
                                onBlur={validatePriceRange}
                                className="w-full pl-7 h-9"
                                placeholder="Max"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </ScrollArea>
    )
}

export default function ShopPage() {
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000])
  const [sortBy, setSortBy] = useState<string>('newest')
  const [searchInput, setSearchInput] = useState('')
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const debouncedSearchInput = useDebounce(searchInput, 500)
  const debouncedPriceRange = useDebounce(priceRange, 500)

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      const params = new URLSearchParams()
      if (debouncedSearchInput) params.append('search', debouncedSearchInput)
      selectedCategories.forEach(cat => params.append('categories', cat))
      params.append('minPrice', debouncedPriceRange[0].toString())
      params.append('maxPrice', debouncedPriceRange[1].toString())
      params.append('sort', sortBy)
      
      const res = await fetch(`/api/products?${params.toString()}`)
      const data = await res.json()
      setProducts(data.products || [])
      setLoading(false)
    }
    fetchProducts()
  }, [debouncedSearchInput, selectedCategories, debouncedPriceRange, sortBy])

  const handleClearFilters = () => {
    setSelectedCategories([])
    setPriceRange([0, 100000])
    setSearchInput('')
    setSortBy('newest')
  }

  const hasActiveFilters = 
    selectedCategories.length > 0 ||
    priceRange[0] > 0 ||
    priceRange[1] < 100000

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-1">Shop Collection</h1>
          <p className="text-muted-foreground">
            {loading ? 'Searching for treasures...' : `Showing ${products.length} products`}
          {hasActiveFilters && !loading && <span className="text-sm"> matching your filters.</span>}
          </p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Mobile Filters Trigger */}
          <Sheet open={isMobileFiltersOpen} onOpenChange={setIsMobileFiltersOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                className="md:hidden"
                onClick={() => setIsMobileFiltersOpen(true)}
              >
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[320px] sm:max-w-sm">
              <SheetHeader className="flex flex-row items-center justify-between mb-6 pr-4">
                <SheetTitle>Filters</SheetTitle>
                 <Button variant="ghost" size="icon" onClick={handleClearFilters}>
                  <span className="text-sm mr-1">Clear</span> <X className="h-4 w-4"/>
                </Button>
              </SheetHeader>
              <FilterSection 
                inSheet={true} 
                selectedCategories={selectedCategories}
                setSelectedCategories={setSelectedCategories}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
              />
            </SheetContent>
          </Sheet>
          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="border rounded-md px-3 h-10 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 w-full md:w-[160px]"
          >
            {sortOptions.map(option => (
              <option key={option.id} value={option.id}>{option.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-x-8">
        {/* Desktop Filters */}
        <aside className="hidden md:block w-64 lg:w-72 flex-shrink-0">
          <div className="sticky top-24 space-y-8">
            {/* Search Input for Desktop */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                className="pl-10 h-10"
              />
            </div>
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Filters</h2>
                <Button variant="link" className="text-sm" onClick={handleClearFilters}>Clear all</Button>
            </div>
            <FilterSection
              selectedCategories={selectedCategories}
              setSelectedCategories={setSelectedCategories}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
            />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {/* Search Input for Mobile */}
          <div className="relative md:hidden mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className="pl-10 h-10"
            />
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mb-6 items-center">
              <h3 className="text-sm font-medium mr-2">Applied Filters:</h3>
              {selectedCategories.map((categoryId) => {
                const category = categories.find((c) => c.id === categoryId)
                return (
                  <Badge
                    key={categoryId}
                    variant="secondary"
                    className="cursor-pointer group"
                    onClick={() =>
                      setSelectedCategories(
                        selectedCategories.filter((id) => id !== categoryId)
                      )
                    }
                  >
                    {category?.name} <X className="ml-1.5 h-3 w-3 text-muted-foreground group-hover:text-foreground" />
                  </Badge>
                )
              })}
              {(priceRange[0] > 0 || priceRange[1] < 100000) && (
                <Badge
                  variant="secondary"
                  className="cursor-pointer group"
                  onClick={() => setPriceRange([0, 100000])}
                >
                  Price: ৳{priceRange[0].toLocaleString()} - ৳
                  {priceRange[1].toLocaleString()} <X className="ml-1.5 h-3 w-3 text-muted-foreground group-hover:text-foreground" />
                </Badge>
              )}
            </div>
          )}

          {/* Products Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
              {[...Array(9)].map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-24 border-2 border-dashed rounded-lg">
              <h3 className="text-xl font-semibold text-foreground">No Products Found</h3>
              <p className="text-muted-foreground mt-2">Try adjusting your search or filters.</p>
              <Button onClick={handleClearFilters} className="mt-4">Clear Filters</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
} 