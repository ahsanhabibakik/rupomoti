"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { X, Filter, Search as SearchIcon, ArrowRight, Loader2 } from "lucide-react";
import { BsSearch } from "react-icons/bs";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  salePrice?: number;
  images: string[];
  categoryName?: string;
  isNewArrival?: boolean;
  isPopular?: boolean;
  isFeatured?: boolean;
  stock?: number;
  rating?: number;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  const categories = useMemo(() => ["Necklaces", "Earrings", "Rings", "Bracelets", "Sets"], []);
  
  const popularSearches = useMemo(() => [
    "Pearl Necklaces",
    "Diamond Rings", 
    "Gold Earrings",
    "Wedding Sets",
    "Luxury Jewelry",
    "Vintage Pieces"
  ], []);

  // Load recent searches from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedSearches = localStorage.getItem("recentSearches");
        if (savedSearches) {
          setRecentSearches(JSON.parse(savedSearches));
        }
      } catch (error) {
        console.error("Failed to load recent searches:", error);
      }
    }
  }, []);

  // Save search to recent searches
  const saveSearch = useCallback((query: string) => {
    if (!query.trim() || typeof window === 'undefined') return;
    
    const updatedSearches = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(updatedSearches);
    try {
      localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
    } catch (error) {
      console.error("Failed to save search:", error);
    }
  }, [recentSearches]);

  // Search functionality with error handling
  const searchProducts = useCallback(async (query: string, category: string = "all") => {
    if (!query.trim()) {
      setFilteredProducts([]);
      return;
    }

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        search: query,
        limit: "8"
      });
      
      if (category !== "all") {
        params.append("categories", category);
      }

      const response = await fetch(`/api/products-mongo?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        // Ensure we safely extract product data and category names
        const products = (data.products || []).map((product: any) => ({
          id: product.id,
          name: product.name || "",
          description: product.description || "",
          price: product.price || 0,
          salePrice: product.salePrice,
          images: Array.isArray(product.images) ? product.images : [],
          categoryName: typeof product.category === 'object' ? product.category?.name : product.category || "Uncategorized",
          isNewArrival: product.isNewArrival,
          isPopular: product.isPopular,
          isFeatured: product.isFeatured,
          stock: product.stock,
          rating: product.rating
        }));
        setFilteredProducts(products);
      } else {
        setFilteredProducts([]);
      }
    } catch (error) {
      console.error("Search error:", error);
      setFilteredProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle search input with optimized debounce
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    if (searchQuery.trim()) {
      const timeoutId = setTimeout(() => {
        searchProducts(searchQuery, activeCategory);
      }, 300);
      setSearchTimeout(timeoutId);
    } else {
      setFilteredProducts([]);
      setIsLoading(false);
    }

    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchQuery, activeCategory, searchProducts, searchTimeout]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      saveSearch(searchQuery.trim());
      onClose();
      window.location.href = `/shop?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const handleQuickSearch = (query: string) => {
    saveSearch(query);
    onClose();
    window.location.href = `/shop?search=${encodeURIComponent(query)}`;
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem("recentSearches");
      } catch (error) {
        console.error("Failed to clear recent searches:", error);
      }
    }
  };

  const handleCategoryFilter = (category: string) => {
    setActiveCategory(category);
    if (searchQuery.trim()) {
      searchProducts(searchQuery, category);
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center">
      {/* Enhanced Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-all duration-300"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative z-50 w-full max-w-4xl mx-4 mt-4 md:mt-16">
        <div className="bg-white/100 w-full rounded-2xl md:rounded-3xl shadow-2xl border border-gray-200 overflow-hidden transform transition-all duration-300">
          
          {/* Search Header */}
          <div className="p-4 md:p-6 border-b border-gray-200 bg-white">
            <form onSubmit={handleSearch}>
              <div className="flex items-center gap-3 md:gap-4">
                <div className="flex-1 relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none">
                    <BsSearch className="h-4 w-4 md:h-5 md:w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors duration-200" />
                  </div>
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for jewelry, pearls, diamonds..."
                    className="w-full pl-10 md:pl-12 pr-12 md:pr-16 py-3 md:py-4 border-2 border-gray-200 rounded-xl md:rounded-2xl focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all duration-300 text-gray-800 placeholder-gray-400 bg-white text-base md:text-lg font-medium shadow-sm hover:shadow-md"
                    autoFocus
                  />
                  <div className="absolute inset-y-0 right-0 pr-2 md:pr-3 flex items-center">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      size="sm"
                      className="p-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg md:rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <Loader2 className="h-3 w-3 md:h-4 md:w-4 animate-spin" />
                      ) : (
                        <BsSearch className="h-3 w-3 md:h-4 md:w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <Button
                  onClick={onClose}
                  variant="ghost"
                  size="icon"
                  className="p-2 md:p-3 hover:bg-gray-100 rounded-xl md:rounded-2xl transition-all duration-200 text-gray-500 hover:text-gray-700 group flex-shrink-0"
                >
                  <X className="h-5 w-5 md:h-6 md:w-6 group-hover:rotate-90 transition-transform duration-200" />
                </Button>
              </div>
            </form>
          </div>

          {/* Categories - Horizontal scroll on mobile */}
          <div className="p-3 md:p-4 border-b border-gray-200 bg-gray-50/50">
            <div className="flex items-center gap-2 md:gap-3 overflow-x-auto pb-2 scrollbar-hide">
              <span className="text-xs md:text-sm font-semibold text-gray-600 whitespace-nowrap flex items-center gap-1 md:gap-2 flex-shrink-0">
                <Filter className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Categories:</span>
              </span>
              <Button
                onClick={() => handleCategoryFilter("all")}
                variant={activeCategory === "all" ? "default" : "outline"}
                size="sm"
                className={cn(
                  "px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-semibold whitespace-nowrap transition-all duration-300 transform hover:scale-105 shadow-sm flex-shrink-0",
                  activeCategory === "all"
                    ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md"
                    : "bg-white text-gray-700 hover:bg-gray-100 border-gray-300"
                )}
              >
                All
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  onClick={() => handleCategoryFilter(category)}
                  variant={activeCategory === category ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-semibold whitespace-nowrap transition-all duration-300 transform hover:scale-105 shadow-sm flex-shrink-0",
                    activeCategory === category
                      ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md"
                      : "bg-white text-gray-700 hover:bg-gray-100 border-gray-300"
                  )}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="max-h-96 md:max-h-[500px] overflow-y-auto">
            {searchQuery.trim() ? (
              <div className="p-4 md:p-6">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8 md:py-12">
                    <Loader2 className="h-6 w-6 md:h-8 md:w-8 animate-spin text-orange-500" />
                    <span className="ml-2 text-sm md:text-base text-gray-600">Searching...</span>
                  </div>
                ) : filteredProducts.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base md:text-lg font-semibold text-gray-900">
                        Search Results ({filteredProducts.length})
                      </h3>
                      <Link
                        href={`/shop?search=${encodeURIComponent(searchQuery)}`}
                        onClick={onClose}
                        className="text-xs md:text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
                      >
                        View All <ArrowRight className="h-3 w-3 md:h-4 md:w-4" />
                      </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                      {filteredProducts.map((product) => (
                        <Link
                          key={product.id}
                          href={`/products/${product.id}`}
                          onClick={onClose}
                          className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all duration-200 group"
                        >
                          <div className="relative h-12 w-12 md:h-16 md:w-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                            {product.images?.[0] ? (
                              <Image
                                src={product.images[0]}
                                alt={product.name}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-200"
                                sizes="(max-width: 768px) 48px, 64px"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                                <span className="text-orange-600 text-xs md:text-sm font-bold">
                                  {product.name.charAt(0)}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm md:text-base font-medium text-gray-900 truncate group-hover:text-orange-600 transition-colors duration-200">
                              {product.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm md:text-base font-semibold text-orange-600">
                                ৳{(product.salePrice || product.price).toLocaleString()}
                              </span>
                              {product.salePrice && product.salePrice < product.price && (
                                <span className="text-xs text-gray-500 line-through">
                                  ৳{product.price.toLocaleString()}
                                </span>
                              )}
                            </div>
                            {product.categoryName && (
                              <span className="text-xs text-gray-500">{product.categoryName}</span>
                            )}
                          </div>
                          {(product.isNewArrival || product.isPopular || product.isFeatured) && (
                            <div className="flex flex-col gap-1">
                              {product.isNewArrival && (
                                <Badge variant="secondary" className="text-xs">New</Badge>
                              )}
                              {product.isPopular && (
                                <Badge variant="destructive" className="text-xs">Popular</Badge>
                              )}
                              {product.isFeatured && (
                                <Badge variant="default" className="text-xs">Featured</Badge>
                              )}
                            </div>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 md:py-12">
                    <SearchIcon className="h-12 w-12 md:h-16 md:w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm md:text-base text-gray-600 mb-2">No products found for "{searchQuery}"</p>
                    <p className="text-xs md:text-sm text-gray-500">Try adjusting your search or browse our categories</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 md:p-6 space-y-6">
                {recentSearches.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm md:text-base font-semibold text-gray-900">Recent Searches</h3>
                      <Button
                        onClick={clearRecentSearches}
                        variant="ghost"
                        size="sm"
                        className="text-xs md:text-sm text-gray-500 hover:text-gray-700"
                      >
                        Clear
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((search, index) => (
                        <Button
                          key={index}
                          onClick={() => handleQuickSearch(search)}
                          variant="outline"
                          size="sm"
                          className="text-xs md:text-sm px-3 py-1.5 rounded-full bg-gray-50 border-gray-200 hover:bg-gray-100 transition-colors duration-200"
                        >
                          {search}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-3">Popular Searches</h3>
                  <div className="flex flex-wrap gap-2">
                    {popularSearches.map((search, index) => (
                      <Button
                        key={index}
                        onClick={() => handleQuickSearch(search)}
                        variant="outline"
                        size="sm"
                        className="text-xs md:text-sm px-3 py-1.5 rounded-full bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100 transition-colors duration-200"
                      >
                        {search}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
