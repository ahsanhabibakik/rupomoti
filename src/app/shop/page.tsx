"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { ProductCard } from '@/components/products/ProductCard'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
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
import { SlidersHorizontal, Search, X, Loader2, Frown } from 'lucide-react'
import { Product } from '@/types/product'

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

const PAGE_SIZE = 9;

function FilterSection({ 
  selectedCategories, 
  setSelectedCategories, 
  priceRange, 
  setPriceRange 
}: {
  selectedCategories: string[];
  setSelectedCategories: React.Dispatch<React.SetStateAction<string[]>>;
  priceRange: [number, number];
  setPriceRange: (value: [number, number]) => void;
  inSheet?: boolean;
}) {
  const handlePriceInputChange = (index: 0 | 1, value: string) => {
    const newRange = [...priceRange] as [number, number];
    const numValue = parseInt(value.replace(/[^0-9]/g, ''), 10);
    newRange[index] = isNaN(numValue) ? (index === 0 ? 0 : 100000) : numValue;
    setPriceRange(newRange);
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="font-semibold text-foreground mb-4">Categories</h3>
        <div className="space-y-3">
          {categories.map((category) => (
            <label key={category.id} className="flex items-center space-x-3 cursor-pointer group">
              <input
                type="checkbox"
                id={`cat-${category.id}`}
                checked={selectedCategories.includes(category.id)}
                onChange={(e) => {
                  const { checked } = e.target;
                  setSelectedCategories(prev => 
                    checked ? [...prev, category.id] : prev.filter(id => id !== category.id)
                  )
                }}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary focus:ring-2 focus:ring-offset-0 transition"
              />
              <span className="text-sm text-muted-foreground group-hover:text-foreground cursor-pointer">
                {category.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-foreground mb-4">Price Range</h3>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          min={0}
          max={100000}
          step={1000}
        />
        <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground space-x-2">
          <Input
            value={`৳${priceRange[0].toLocaleString()}`}
            onChange={(e) => handlePriceInputChange(0, e.target.value)}
            className="w-full h-9"
          />
          <span className="flex-shrink-0">-</span>
          <Input
            value={`৳${priceRange[1].toLocaleString()}`}
            onChange={(e) => handlePriceInputChange(1, e.target.value)}
            className="w-full h-9"
          />
        </div>
      </div>
    </div>
  )
}

export default function ShopPage() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [searchInput, setSearchInput] = useState('');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  
  const debouncedSearchInput = useDebounce(searchInput, 500);
  const debouncedPriceRange = useDebounce(priceRange, 500);
  
  const lastProductElementRef = useRef<HTMLDivElement>(null);

  const fetchProducts = useCallback(async (isNewSearch: boolean) => {
    if (!isNewSearch && !hasMore) return;
    setLoading(true);

    const currentPage = isNewSearch ? 1 : page + 1;
    const params = new URLSearchParams();
    if (debouncedSearchInput) params.append('search', debouncedSearchInput);
    selectedCategories.forEach(cat => params.append('categories', cat));
    params.append('minPrice', debouncedPriceRange[0].toString());
    params.append('maxPrice', debouncedPriceRange[1].toString());
    params.append('sort', sortBy);
    params.append('page', currentPage.toString());
    params.append('limit', PAGE_SIZE.toString());

    try {
      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      const newProducts = data.products || [];

      setProducts(prev => isNewSearch ? newProducts : [...prev, ...newProducts]);
      setPage(currentPage);
      setHasMore(newProducts.length === PAGE_SIZE);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchInput, selectedCategories, debouncedPriceRange, sortBy, page, hasMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !loading) {
          fetchProducts(false);
        }
      },
      { threshold: 1.0 }
    );

    const currentRef = lastProductElementRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [loading, fetchProducts]);
  
  useEffect(() => {
    const timeoutId = setTimeout(() => fetchProducts(true), 100);
    return () => clearTimeout(timeoutId);
  }, [debouncedSearchInput, selectedCategories, debouncedPriceRange, sortBy]);


  const handleClearFilters = () => {
    setSelectedCategories([]);
    setPriceRange([0, 100000]);
    setSearchInput('');
    setSortBy('newest');
  };

  const hasActiveFilters = 
    selectedCategories.length > 0 ||
    priceRange[0] > 0 ||
    priceRange[1] < 100000;
    
  const showSkeletons = loading && products.length === 0;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-2">Shop Our Collection</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Discover timeless elegance with our handcrafted pearl jewelry.
        </p>
      </div>

      <div className="flex gap-x-8 lg:gap-x-12">
        {/* Desktop Filters */}
        <aside className="hidden md:block w-64 lg:w-72 flex-shrink-0">
          <div className="sticky top-24 space-y-10">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                className="pl-10 h-11"
              />
            </div>
            <div className="flex justify-between items-center border-b pb-2">
                <h2 className="text-lg font-semibold">Filters</h2>
                {hasActiveFilters && <Button variant="link" className="text-sm" onClick={handleClearFilters}>Clear all</Button>}
            </div>
            <FilterSection
              selectedCategories={selectedCategories}
              setSelectedCategories={setSelectedCategories}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
            />
          </div>
        </aside>

        <main className="flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <p className="text-muted-foreground text-sm">
              {showSkeletons ? 'Searching...' : `Showing ${products.length} products`}
              {!loading && !hasMore && products.length > 0 && " (end of results)"}
            </p>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="md:hidden flex-1">
                    <SlidersHorizontal className="mr-2 h-4 w-4" /> Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[320px] p-0">
                  <ScrollArea className="h-full">
                    <div className="p-6">
                      <SheetHeader className="flex flex-row items-center justify-between mb-6">
                        <SheetTitle>Filters</SheetTitle>
                        {hasActiveFilters && <Button variant="link" onClick={handleClearFilters}>Clear all</Button>}
                      </SheetHeader>
                      <FilterSection inSheet={true} {...{selectedCategories, setSelectedCategories, priceRange, setPriceRange}} />
                    </div>
                  </ScrollArea>
                </SheetContent>
              </Sheet>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="border rounded-md px-3 h-10 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 w-auto flex-1"
              >
                {sortOptions.map(option => <option key={option.id} value={option.id}>{option.name}</option>)}
              </select>
            </div>
          </div>

          {showSkeletons ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
              {[...Array(PAGE_SIZE)].map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
                {products.map((product) => (
                   <ProductCard key={product.id} product={product} />
                ))}
              </div>
              
              <div ref={lastProductElementRef} className="h-1" />

              {loading && products.length > 0 && (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-24 border-2 border-dashed rounded-lg flex flex-col items-center">
              <Frown className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-xl font-semibold text-foreground">No Products Found</h3>
              <p className="text-muted-foreground mt-2">Try adjusting your search or filters.</p>
              <Button onClick={handleClearFilters} className="mt-6">Clear Filters</Button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
} 