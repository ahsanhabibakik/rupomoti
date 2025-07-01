"use client"

// Client-side with dynamic data fetching (good for filtering/search)
export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { ProductCard } from '@/components/products/ProductCard'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { ProductCardSkeleton } from '@/components/products/ProductCardSkeleton'
import { ShopSkeleton } from '@/components/products/ShopSkeleton'
import { useDebounce } from '@/hooks/useDebounce'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { SlidersHorizontal, Search, Loader2, Frown } from 'lucide-react'
import { Category } from '@prisma/client'
import { Product } from '@/types/product'
import { getCategories } from '@/actions/getCategories'

const sortOptions = [
  { id: 'newest', name: 'Newest First' },
  { id: 'price-low', name: 'Price: Low to High' },
  { id: 'price-high', name: 'Price: High to Low' },
  { id: 'popular', name: 'Most Popular' },
]

const PAGE_SIZE = 24; // Optimized size for better UX
const PRELOAD_THRESHOLD = 800; // Load more content when user is 800px from bottom
const DEBOUNCE_DELAY = 400; // Slightly increased for better performance

interface FetchState {
  loading: boolean;
  loadingMore: boolean;
  filterLoading: boolean;
  initialLoading: boolean;
}

function FilterSection({
  selectedCategories,
  setSelectedCategories,
  priceRange,
  setPriceRange,
  categories,
  onClearFilters,
  hasActiveFilters
}: {
  selectedCategories: string[];
  setSelectedCategories: React.Dispatch<React.SetStateAction<string[]>>;
  priceRange: [number, number];
  setPriceRange: (value: [number, number]) => void;
  categories: Category[];
  onClearFilters?: () => void;
  hasActiveFilters?: boolean;
}) {
  const handlePriceInputChange = useCallback((index: 0 | 1, value: string) => {
    const newRange = [...priceRange] as [number, number];
    const numValue = parseInt(value.replace(/[^0-9]/g, ''), 10);
    newRange[index] = isNaN(numValue) ? (index === 0 ? 0 : 100000) : numValue;
    setPriceRange(newRange);
  }, [priceRange, setPriceRange]);

  return (
    <div className="space-y-8">
      {/* Clear Filters Button */}
      {onClearFilters && (
        <div className="flex justify-between items-center border-b pb-2">
          <span className="text-sm font-medium text-foreground">Active Filters</span>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onClearFilters}
            disabled={!hasActiveFilters}
            className="text-xs"
          >
            Clear All
          </Button>
        </div>
      )}
      
      <div>
        <h3 className="font-semibold text-foreground mb-4">Categories</h3>
        <div className="max-h-64 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {categories.map((category) => (
            <label key={category.id} className="flex items-center space-x-3 cursor-pointer group">
              <input
                type="checkbox"
                id={`cat-${category.id}`}
                checked={selectedCategories.includes(category.slug)}
                onChange={(e) => {
                  const { checked } = e.target;
                  setSelectedCategories(prev => 
                    checked ? [...prev, category.slug] : prev.filter(slug => slug !== category.slug)
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

async function getInitialProducts() {
  try {
    // Always return empty for server-side, let client handle loading
    if (typeof window === 'undefined') {
      return { products: [], total: 0, hasMore: false };
    }
    
    const res = await fetch(`/api/products?limit=${PAGE_SIZE}&sort=newest&page=1`, { 
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!res.ok) {
      console.error('Initial products fetch failed:', res.status, res.statusText);
      return { products: [], total: 0, hasMore: false };
    }
    
    const data = await res.json();
    
    return {
      products: data.products || [],
      total: data.pagination?.total || 0,
      hasMore: data.pagination?.hasMore || false
    };
  } catch (error) {
    console.error('Failed to fetch initial products:', error);
    return { products: [], total: 0, hasMore: false };
  }
}

export default function ShopPage() {
  const searchParams = useSearchParams()
  
  // State management
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // Filter states
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [searchInput, setSearchInput] = useState('');
  
  // Loading states
  const [fetchState, setFetchState] = useState<FetchState>({
    loading: false,
    loadingMore: false,
    filterLoading: false,
    initialLoading: true,
  });
  
  // Debounced values
  const debouncedSearchInput = useDebounce(searchInput, DEBOUNCE_DELAY);
  const debouncedPriceRange = useDebounce(priceRange, DEBOUNCE_DELAY);
  
  // Refs
  const sentinelRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const previousFiltersRef = useRef<string>('');
  
  // Memoized filter string for comparison
  const currentFilters = useMemo(() => {
    return JSON.stringify({
      search: debouncedSearchInput,
      categories: selectedCategories.sort(),
      priceRange: debouncedPriceRange,
      sort: sortBy
    });
  }, [debouncedSearchInput, selectedCategories, debouncedPriceRange, sortBy]);
  
  // Check if filters have changed
  const filtersChanged = currentFilters !== previousFiltersRef.current;

  // Handle URL parameters
  useEffect(() => {
    const filterParam = searchParams?.get('filter')
    const searchParam = searchParams?.get('search')
    
    if (filterParam) {
      switch (filterParam) {
        case 'featured':
          setSelectedCategories([])
          setSortBy('featured')
          break
        case 'new-arrivals':
          setSelectedCategories([])
          setSortBy('newest')
          break
        case 'popular':
          setSelectedCategories([])
          setSortBy('popular')
          break
      }
    }
    
    if (searchParam) {
      setSearchInput(searchParam)
    }
  }, [searchParams])

  // Optimized fetch function with abort controller
  const fetchProducts = useCallback(async (isNewSearch: boolean = false, pageToFetch: number = 1) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller
    abortControllerRef.current = new AbortController();
    
    // Prevent multiple simultaneous requests for pagination
    if (!isNewSearch && (fetchState.loadingMore || !hasMore)) return;
    
    // Update loading states
    setFetchState(prev => ({
      ...prev,
      loading: isNewSearch,
      loadingMore: !isNewSearch,
      filterLoading: isNewSearch && prev.initialLoading === false,
    }));

    const params = new URLSearchParams();
    if (debouncedSearchInput) params.append('search', debouncedSearchInput);
    selectedCategories.forEach(cat => params.append('categories', cat));
    params.append('minPrice', debouncedPriceRange[0].toString());
    params.append('maxPrice', debouncedPriceRange[1].toString());
    params.append('sort', sortBy);
    params.append('page', pageToFetch.toString());
    params.append('limit', PAGE_SIZE.toString());

    try {
      const res = await fetch(`/api/products?${params.toString()}`, {
        signal: abortControllerRef.current.signal,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Products fetch failed:', res.status, res.statusText, errorText);
        throw new Error(`Failed to fetch products: ${res.status}`);
      }
      const data = await res.json();
      const newProducts = data.products || [];
      
      if (isNewSearch) {
        // For new searches, replace all products
        setProducts(newProducts);
        setPage(1);
        setTotalProducts(data.pagination?.total || 0);
      } else {
        // For pagination, append new products
        setProducts(prev => {
          // Prevent duplicates by checking IDs
          const existingIds = new Set(prev.map((p: Product) => p.id));
          const uniqueNewProducts = newProducts.filter((p: Product) => !existingIds.has(p.id));
          return [...prev, ...uniqueNewProducts];
        });
        setPage(pageToFetch);
      }
      
      setHasMore(data.pagination?.hasMore || false);
      
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return; // Request was cancelled, don't update state
      }
      console.error("Failed to fetch products:", error);
      setHasMore(false);
    } finally {
      setFetchState(prev => ({
        ...prev,
        loading: false,
        loadingMore: false,
        filterLoading: false,
        initialLoading: false,
      }));
    }
  }, [debouncedSearchInput, selectedCategories, debouncedPriceRange, sortBy, hasMore, fetchState.loadingMore]);

  // Initial data loading
  useEffect(() => {
    async function loadInitialData() {
      setFetchState(prev => ({ ...prev, initialLoading: true }));
      
      try {
        const [productsData, categoriesData] = await Promise.all([
          getInitialProducts(),
          getCategories({ level: 0, active: true })
        ]);
        
        setProducts(productsData.products);
        setCategories(categoriesData);
        setHasMore(productsData.hasMore);
        setTotalProducts(productsData.total);
        setPage(1);
      } catch (error) {
        console.error('Failed to load initial data:', error);
      } finally {
        setFetchState(prev => ({ ...prev, initialLoading: false }));
      }
    }
    
    loadInitialData();
  }, []);

  // Handle filter changes with debouncing
  useEffect(() => {
    if (fetchState.initialLoading) return;
    
    if (filtersChanged) {
      previousFiltersRef.current = currentFilters;
      
      // Small delay to prevent rapid filter changes
      const timeoutId = setTimeout(() => {
        fetchProducts(true, 1);
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [currentFilters, fetchState.initialLoading, fetchProducts, filtersChanged]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (fetchState.initialLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && !fetchState.loadingMore && hasMore && !fetchState.filterLoading) {
          fetchProducts(false, page + 1);
        }
      },
      { 
        threshold: 0.1,
        rootMargin: `${PRELOAD_THRESHOLD}px`
      }
    );

    const currentSentinel = sentinelRef.current;
    if (currentSentinel) {
      observer.observe(currentSentinel);
    }

    return () => {
      if (currentSentinel) {
        observer.unobserve(currentSentinel);
      }
    };
  }, [fetchProducts, page, hasMore, fetchState.loadingMore, fetchState.initialLoading, fetchState.filterLoading]);

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleClearFilters = useCallback(() => {
    setSelectedCategories([]);
    setPriceRange([0, 100000]);
    setSearchInput('');
    setSortBy('newest');
  }, []);

  const hasActiveFilters = useMemo(() => 
    selectedCategories.length > 0 ||
    priceRange[0] > 0 ||
    priceRange[1] < 100000 ||
    debouncedSearchInput.trim() !== '',
    [selectedCategories.length, priceRange, debouncedSearchInput]
  );

  // Show initial loading skeleton
  if (fetchState.initialLoading) {
    return <ShopSkeleton />
  }

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
              {hasActiveFilters && (
                <Button variant="link" className="text-sm" onClick={handleClearFilters}>
                  Clear all
                </Button>
              )}
            </div>
            <FilterSection
              selectedCategories={selectedCategories}
              setSelectedCategories={setSelectedCategories}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              categories={categories}
              onClearFilters={handleClearFilters}
              hasActiveFilters={hasActiveFilters}
            />
          </div>
        </aside>

        <main className="flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <p className="text-muted-foreground text-sm">
              {fetchState.filterLoading ? (
                'Updating results...'
              ) : products.length > 0 ? (
                `Showing ${products.length} ${hasActiveFilters ? 'filtered' : ''} products${totalProducts > 0 ? ` of ${totalProducts} total` : ''}`
              ) : (
                'No products found'
              )}
              {!fetchState.loadingMore && !hasMore && products.length > PAGE_SIZE && " • End of results"}
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
                        {hasActiveFilters && (
                          <Button variant="link" onClick={handleClearFilters}>
                            Clear all
                          </Button>
                        )}
                      </SheetHeader>
                      
                      {/* Mobile Search */}
                      <div className="relative mb-6">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="text"
                          placeholder="Search products..."
                          value={searchInput}
                          onChange={e => setSearchInput(e.target.value)}
                          className="pl-10 h-11"
                        />
                      </div>
                      
                      <FilterSection
                        selectedCategories={selectedCategories}
                        setSelectedCategories={setSelectedCategories}
                        priceRange={priceRange}
                        setPriceRange={setPriceRange}
                        categories={categories}
                        onClearFilters={handleClearFilters}
                        hasActiveFilters={hasActiveFilters}
                      />
                    </div>
                  </ScrollArea>
                </SheetContent>
              </Sheet>
              
              <select
                id="sort-by"
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="h-11 border-input bg-background ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 flex-1 rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium"
              >
                {sortOptions.map(option => (
                  <option key={option.id} value={option.id}>{option.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Filter loading overlay with smooth transition */}
          {fetchState.filterLoading && (
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
                <div className="bg-background/95 backdrop-blur-sm rounded-lg px-6 py-4 shadow-lg border animate-in fade-in duration-300">
                  <div className="flex items-center space-x-3">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <p className="text-sm font-medium">Applying filters...</p>
                  </div>
                </div>
              </div>
              
              {/* Maintain layout with placeholder grid */}
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8 opacity-30">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="min-h-[320px] bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            </div>
          )}

          {/* Product Grid with stable layout */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
            {products.length > 0 ? (
              products.map((product, index) => (
                <ProductCard 
                  key={`${product.id}-${index}`} 
                  product={product} 
                  className="min-h-[320px] transform transition-all duration-200" 
                />
              ))
            ) : !fetchState.filterLoading && (
              <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                <Frown className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-2xl font-semibold mb-2">No Products Found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filters or search terms.
                </p>
                {hasActiveFilters && (
                  <Button variant="outline" onClick={handleClearFilters}>
                    Clear All Filters
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Infinite scroll sentinel and loading indicator */}
          {hasMore && (
            <div ref={sentinelRef} className="mt-8">
              {fetchState.loadingMore && (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <ProductCardSkeleton 
                      key={`loading-${index}`} 
                      className="min-h-[320px] animate-pulse" 
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* End of results indicator */}
          {!hasMore && products.length > PAGE_SIZE && (
            <div className="flex justify-center items-center py-12 mt-8 border-t">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  You&apos;ve reached the end of our collection
                </p>
                <p className="text-xs text-muted-foreground">
                  Showing all {products.length} products
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}