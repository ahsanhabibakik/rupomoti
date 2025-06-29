"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
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
import { SlidersHorizontal, Search, X, Loader2, Frown } from 'lucide-react'
import { Category } from '@prisma/client'
import { Product } from '@/types/product'
import { getCategories } from '@/actions/getCategories'

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

const PAGE_SIZE = 30; // Increased from 9 to 30 for better UX

function FilterSection({
  selectedCategories,
  setSelectedCategories,
  priceRange,
  setPriceRange,
  inSheet,
  categories
}: {
  selectedCategories: string[];
  setSelectedCategories: React.Dispatch<React.SetStateAction<string[]>>;
  priceRange: [number, number];
  setPriceRange: (value: [number, number]) => void;
  inSheet?: boolean;
  categories: Category[];
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
    // Only run on client side
    if (typeof window === 'undefined') {
      return { products: [], total: 0, hasMore: false };
    }
    
    const res = await fetch(`/api/products?limit=${PAGE_SIZE}&sort=newest&page=1`, { cache: 'no-store' });
    if (!res.ok) return { products: [], total: 0, hasMore: false };
    const data = await res.json();
    return {
      products: data.products || [],
      total: data.total || 0,
      hasMore: data.hasMore || false
    };
  } catch (error) {
    console.error('Failed to fetch initial products:', error);
    return { products: [], total: 0, hasMore: false };
  }
}

export default function ShopPage() {
  const searchParams = useSearchParams()
  const [initialData, setInitialData] = useState<{ products: Product[], total: number, hasMore: boolean }>({ products: [], total: 0, hasMore: false });
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [searchInput, setSearchInput] = useState('');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  const debouncedSearchInput = useDebounce(searchInput, 500);
  const debouncedPriceRange = useDebounce(priceRange, 500);
  
  const lastProductElementRef = useRef<HTMLDivElement>(null);

  // Handle URL filter parameters
  useEffect(() => {
    const filterParam = searchParams?.get('filter')
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
        default:
          break
      }
    }
  }, [searchParams])

  // Handle URL search parameter
  useEffect(() => {
    const searchParam = searchParams?.get('search')
    if (searchParam) {
      setSearchInput(searchParam)
    }
  }, [searchParams])

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
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      const newProducts = data.products || [];
      
      if (isNewSearch) {
        setProducts(newProducts);
        setPage(1);
      } else {
        setProducts(prev => [...prev, ...newProducts]);
        setPage(currentPage);
      }
      
      setHasMore(data.hasMore || false);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setHasMore(false);
    } finally {
      setLoading(false);
      if (isInitialLoad) setIsInitialLoad(false);
    }
  }, [debouncedSearchInput, selectedCategories, debouncedPriceRange, sortBy, hasMore, page, isInitialLoad]);

  useEffect(() => {
    async function loadInitialData() {
      setLoading(true);
      setIsInitialLoad(true);
      
      const [productsData, categoriesData] = await Promise.all([
        getInitialProducts(),
        getCategories({ level: 0, active: true })
      ]);
      
      setInitialData(productsData);
      setProducts(productsData.products);
      setCategories(categoriesData);
      setHasMore(productsData.hasMore);
      setPage(1);
      setIsInitialLoad(false);
      setLoading(false);
    }
    loadInitialData();
  }, []);

  useEffect(() => {
    if (isInitialLoad) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !loading && hasMore) {
          fetchProducts(false);
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '200px' // Load more products when user is 200px away from the last element
      }
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
  }, [loading, hasMore, isInitialLoad, fetchProducts]);
  
  useEffect(() => {
    if (isInitialLoad) return;
    
    // Reset pagination when filters change
    setPage(1);
    setProducts([]);
    
    const timeoutId = setTimeout(() => fetchProducts(true), 300);
    return () => clearTimeout(timeoutId);
  }, [debouncedSearchInput, selectedCategories, debouncedPriceRange, sortBy, isInitialLoad, fetchProducts]);


  const handleClearFilters = () => {
    setSelectedCategories([]);
    setPriceRange([0, 100000]);
    setSearchInput('');
    setSortBy('newest');
  };

  const hasActiveFilters = 
    selectedCategories.length > 0 ||
    priceRange[0] > 0 ||
    priceRange[1] < 100000 ||
    debouncedSearchInput.trim() !== '';
    
  const showSkeletons = isInitialLoad || (loading && products.length === 0);
  const currentProducts = showSkeletons ? [] : products;
  const showProductCount = !showSkeletons && !isInitialLoad;

  // Show full page skeleton for initial load
  if (isInitialLoad) {
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
                {hasActiveFilters && <Button variant="link" className="text-sm" onClick={handleClearFilters}>Clear all</Button>}
            </div>
            <FilterSection
              selectedCategories={selectedCategories}
              setSelectedCategories={setSelectedCategories}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              categories={categories}
            />
          </div>
        </aside>

        <main className="flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <p className="text-muted-foreground text-sm">
              {showSkeletons ? (
                'Loading products...'
              ) : showProductCount ? (
                `Showing ${currentProducts.length} ${hasActiveFilters ? 'filtered' : ''} products${initialData.total > 0 ? ` of ${initialData.total} total` : ''}`
              ) : (
                'Searching...'
              )}
              {!loading && !hasMore && currentProducts.length > 0 && " (end of results)"}
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
                      <FilterSection
                        selectedCategories={selectedCategories}
                        setSelectedCategories={setSelectedCategories}
                        priceRange={priceRange}
                        setPriceRange={setPriceRange}
                        categories={categories}
                        inSheet={true}
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

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
            {showSkeletons ? (
              // Show exactly 30 skeleton cards for initial load
              Array.from({ length: PAGE_SIZE }).map((_, index) => (
                <ProductCardSkeleton 
                  key={`skeleton-${index}`} 
                  className="transform transition-all duration-200" 
                />
              ))
            ) : currentProducts.length > 0 ? (
              currentProducts.map((product, index) => {
                const isLastElement = index === currentProducts.length - 1;
                return isLastElement && hasMore ? (
                  <div ref={lastProductElementRef} key={product.id}>
                    <ProductCard product={product} />
                  </div>
                ) : (
                  <ProductCard key={product.id} product={product} />
                )
              })
            ) : (
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

          {loading && !showSkeletons && hasMore && (
            <div className="flex justify-center items-center py-12 mt-8">
              <div className="flex flex-col items-center space-y-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading more products...</p>
              </div>
            </div>
          )}

          {!loading && !hasMore && currentProducts.length > PAGE_SIZE && (
            <div className="flex justify-center items-center py-8 mt-8 border-t">
              <p className="text-sm text-muted-foreground">
                You've reached the end of our collection
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
} 