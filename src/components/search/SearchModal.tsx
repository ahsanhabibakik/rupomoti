"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Filter, Sparkles, Clock, TrendingUp, Search as SearchIcon, ArrowRight } from "lucide-react";
import { BsSearch } from "react-icons/bs";
import Image from "next/image";
import Link from "next/link";
// import { safeRenderPrice, safeRenderCategory } from '@/lib/search-utils'

// Temporary helper functions until search utils are reimplemented
const safeRenderPrice = (price: number, salePrice?: number) => {
  const displayPrice = salePrice && salePrice < price ? salePrice : price;
  return `৳${displayPrice.toLocaleString()}`;
};

const safeRenderCategory = (category: string) => {
  return category || 'Uncategorized';
};

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  images: string[];
  category: string;
  isNewArrival?: boolean;
  isPopular?: boolean;
  isFeatured?: boolean;
  stock?: number;
  rating?: number;
}

export default function SearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const categories = ["Necklaces", "Earrings", "Rings", "Bracelets", "Sets"];
  
  const popularSearches = [
    "Pearl Necklaces",
    "Diamond Rings", 
    "Gold Earrings",
    "Wedding Sets",
    "Luxury Jewelry",
    "Vintage Pieces"
  ];

  // Load recent searches from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSearches = localStorage.getItem("recentSearches");
      if (savedSearches) {
        setRecentSearches(JSON.parse(savedSearches));
      }
    }
  }, []);

  // Save search to recent searches
  const saveSearch = useCallback((query: string) => {
    if (!query.trim() || typeof window === 'undefined') return;
    
    const updatedSearches = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(updatedSearches);
    localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
  }, [recentSearches]);

  // Search functionality
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
        setFilteredProducts(data.products || []);
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

  // Handle search input with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchProducts(searchQuery, activeCategory);
      } else {
        setFilteredProducts([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, activeCategory, searchProducts]);

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
      localStorage.removeItem("recentSearches");
    }
  };

  const handleCategoryFilter = (category: string) => {
    setActiveCategory(category);
    if (searchQuery.trim()) {
      searchProducts(searchQuery, category);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center">
      {/* Enhanced Backdrop with gradient blur */}
      <div
        className="fixed inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60 backdrop-blur-lg z-40 transition-all duration-300"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative z-50 w-full max-w-4xl mx-4 mt-8 md:mt-16">
        <div className="bg-white/95 backdrop-blur-xl w-full rounded-3xl shadow-2xl border border-white/20 overflow-hidden transform transition-all duration-300">
          
          {/* Search Header */}
          <div className="p-6 border-b border-gray-200/50 bg-gradient-to-r from-white/90 to-gray-50/90">
            <form onSubmit={handleSearch}>
              <div className="flex items-center gap-4">
                <div className="flex-1 relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <BsSearch className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors duration-200" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for jewelry, pearls, diamonds, rings..."
                    className="w-full pl-12 pr-16 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all duration-300 text-gray-800 placeholder-gray-400 bg-white/80 text-lg font-medium shadow-sm hover:shadow-md"
                    autoFocus
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="p-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      ) : (
                        <BsSearch size={18} />
                      )}
                    </button>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-3 hover:bg-gray-100 rounded-2xl transition-all duration-200 text-gray-500 hover:text-gray-700 group"
                  title="Close search modal"
                  aria-label="Close search modal"
                >
                  <X size={24} className="group-hover:rotate-90 transition-transform duration-200" />
                </button>
              </div>
            </form>
          </div>

          {/* Categories */}
          <div className="p-4 border-b border-gray-200/50 bg-gradient-to-r from-gray-50/80 to-white/80">
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
              <span className="text-sm font-semibold text-gray-600 whitespace-nowrap flex items-center gap-2">
                <Filter size={16} />
                Categories:
              </span>
              <button
                onClick={() => handleCategoryFilter("all")}
                className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300 transform hover:scale-105 shadow-sm ${
                  activeCategory === "all"
                    ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg"
                    : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:border-orange-300"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Sparkles size={14} />
                  All Products
                </span>
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryFilter(category)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300 transform hover:scale-105 shadow-sm ${
                    activeCategory === category
                      ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg"
                      : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:border-orange-300"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="max-h-[60vh] overflow-y-auto">
            {/* Search Results */}
            {searchQuery && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Search Results</h3>
                  {filteredProducts.length > 0 && (
                    <Link
                      href={`/shop?search=${encodeURIComponent(searchQuery)}`}
                      onClick={onClose}
                      className="text-orange-500 hover:text-orange-600 text-sm font-medium flex items-center gap-1 group"
                    >
                      View All ({filteredProducts.length}+)
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-200" />
                    </Link>
                  )}
                </div>
                
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="bg-gray-100 rounded-lg h-48 animate-pulse"></div>
                    ))}
                  </div>
                ) : filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {filteredProducts.slice(0, 8).map((product) => (
                      <Link
                        key={product.id}
                        href={`/product/${product.slug || product.id}`}
                        onClick={onClose}
                        className="group bg-white rounded-lg border border-gray-200 hover:border-orange-300 overflow-hidden transition-all duration-300 hover:shadow-lg transform hover:scale-105"
                      >
                        <div className="aspect-square relative overflow-hidden">
                          <Image
                            src={product.images[0] || '/placeholder.png'}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          {product.isNewArrival && (
                            <div className="absolute top-2 left-2">
                              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">New</span>
                            </div>
                          )}
                          {product.isPopular && (
                            <div className="absolute top-2 right-2">
                              <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">Popular</span>
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <h4 className="font-medium text-gray-800 text-sm line-clamp-2 group-hover:text-orange-600 transition-colors duration-200">
                            {product.name}
                          </h4>
                          <div className="mt-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {product.salePrice ? (
                                <>
                                  <span className="text-red-600 font-bold text-sm">{safeRenderPrice(product.salePrice)}</span>
                                  <span className="text-gray-500 line-through text-xs">{safeRenderPrice(product.price)}</span>
                                </>
                              ) : (
                                <span className="text-gray-800 font-bold text-sm">{safeRenderPrice(product.price)}</span>
                              )}
                            </div>
                            <span className="text-xs text-gray-500">
                              {safeRenderCategory(product.category)}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <SearchIcon size={48} className="text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">No products found for &quot;{searchQuery}&quot;</p>
                    <p className="text-sm text-gray-400">Try adjusting your search or browse our categories</p>
                  </div>
                )}
              </div>
            )}

            {/* Default Content (when not searching) */}
            {!searchQuery && (
              <div className="p-6 space-y-6">
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <Clock size={18} />
                        Recent Searches
                      </h3>
                      <button
                        onClick={clearRecentSearches}
                        className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((search, index) => (
                        <button
                          key={index}
                          onClick={() => handleQuickSearch(search)}
                          className="px-3 py-2 bg-gray-100 hover:bg-orange-100 text-gray-700 hover:text-orange-700 rounded-lg text-sm transition-all duration-200 flex items-center gap-2 group"
                        >
                          <Clock size={12} />
                          {search}
                          <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Popular Searches */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <TrendingUp size={18} />
                    Popular Searches
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {popularSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuickSearch(search)}
                        className="px-3 py-2 bg-gradient-to-r from-orange-100 to-red-100 hover:from-orange-200 hover:to-red-200 text-orange-700 hover:text-orange-800 rounded-lg text-sm transition-all duration-200 flex items-center gap-2 group"
                      >
                        <TrendingUp size={12} />
                        {search}
                        <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Access */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Sparkles size={18} />
                    Quick Access
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <Link 
                      href="/shop?filter=featured" 
                      onClick={onClose}
                      className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg hover:from-purple-100 hover:to-indigo-100 transition-all duration-200 text-center group border border-purple-200"
                    >
                      <div className="text-purple-600 group-hover:text-purple-700 font-semibold">Featured Collection</div>
                      <div className="text-xs text-purple-500 mt-1">Handpicked for you</div>
                    </Link>
                    <Link 
                      href="/shop?filter=new-arrivals" 
                      onClick={onClose}
                      className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg hover:from-green-100 hover:to-emerald-100 transition-all duration-200 text-center group border border-green-200"
                    >
                      <div className="text-green-600 group-hover:text-green-700 font-semibold">New Arrivals</div>
                      <div className="text-xs text-green-500 mt-1">Latest designs</div>
                    </Link>
                    <Link 
                      href="/shop?filter=popular" 
                      onClick={onClose}
                      className="p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg hover:from-orange-100 hover:to-red-100 transition-all duration-200 text-center group border border-orange-200"
                    >
                      <div className="text-orange-600 group-hover:text-orange-700 font-semibold">Popular Pieces</div>
                      <div className="text-xs text-orange-500 mt-1">Customer favorites</div>
                    </Link>
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
