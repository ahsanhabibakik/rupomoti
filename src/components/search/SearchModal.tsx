"use client";

import { useState, useEffect } from "react";
import { X, Tag, Clock, TrendingUp, Leaf, Filter, Sparkles } from "lucide-react";
import { BsSearch } from "react-icons/bs";
import Image from "next/image";
import Link from "next/link";
import productsData from "@/data/products.json";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  details: any;
  isNew: boolean;
  isBestSeller: boolean;
  isOutOfStock: boolean;
  discount: number;
}

export default function SearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(productsData.products);
  const [activeCategory, setActiveCategory] = useState("all");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [popularSearches] = useState([
    "Pearl Necklaces",
    "Freshwater Pearls",
    "South Sea Pearls",
    "Pearl Earrings",
    "Pearl Rings",
    "Pearl Bracelets",
    "Akoya Pearls",
    "Tahitian Pearls",
  ]);

  // Load recent searches from localStorage
  useEffect(() => {
    const savedSearches = localStorage.getItem("recentSearches");
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, []);

  // Save search to recent searches
  const saveSearch = (query: string) => {
    if (!query.trim()) return;

    const updatedSearches = [
      query,
      ...recentSearches.filter((search) => search !== query),
    ].slice(0, 5); // Keep only the 5 most recent searches

    setRecentSearches(updatedSearches);
    localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
  };

  // Filter products based on search query and category
  useEffect(() => {
    let filtered = productsData.products;

    // Apply category filter
    if (activeCategory !== "all") {
      filtered = filtered.filter(
        (product: Product) =>
          product.category?.toLowerCase() === activeCategory.toLowerCase()
      );
    }

    // Apply search query filter
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter(
        (product: Product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (product.description &&
            product.description
              .toLowerCase()
              .includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredProducts(filtered);
  }, [searchQuery, activeCategory]);

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      saveSearch(searchQuery);
    }
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop with blur effect */}
      <div
        className="fixed inset-0 bg-charcoal/30 backdrop-blur-md z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-0 left-0 right-0 flex items-start justify-center p-4 z-50">
        <div className="bg-pearl-light w-full max-w-3xl rounded-2xl shadow-pearl mt-16 border border-pearl-dark overflow-hidden">
          {/* Search Input */}
          <div className="p-4 border-b border-pearl-dark bg-gradient-to-r from-pearl to-pearl-light">
            <form onSubmit={handleSearch}>
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for pearl jewelry, necklaces, earrings..."
                    className="w-full px-4 py-3 pl-12 pr-4 border-2 border-pearl-dark rounded-xl focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all duration-200 text-charcoal placeholder-slate bg-pearl-light"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate hover:text-gold"
                  >
                    <BsSearch size={20} />
                  </button>
                </div>
                <button
                  onClick={onClose}
                  className="p-2.5 hover:bg-pearl-dark rounded-xl transition-colors duration-200 text-slate hover:text-charcoal"
                >
                  <X size={22} />
                </button>
              </div>
            </form>
          </div>

          {/* Categories */}
          <div className="p-3 border-b border-pearl-dark bg-pearl">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <button
                onClick={() => setActiveCategory("all")}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeCategory === "all"
                    ? "bg-gold text-charcoal"
                    : "bg-pearl-light text-charcoal hover:bg-gold/10 hover:text-gold"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveCategory("necklaces")}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeCategory === "necklaces"
                    ? "bg-gold text-charcoal"
                    : "bg-pearl-light text-charcoal hover:bg-gold/10 hover:text-gold"
                }`}
              >
                Necklaces
              </button>
              <button
                onClick={() => setActiveCategory("earrings")}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeCategory === "earrings"
                    ? "bg-gold text-charcoal"
                    : "bg-pearl-light text-charcoal hover:bg-gold/10 hover:text-gold"
                }`}
              >
                Earrings
              </button>
              <button
                onClick={() => setActiveCategory("rings")}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeCategory === "rings"
                    ? "bg-gold text-charcoal"
                    : "bg-pearl-light text-charcoal hover:bg-gold/10 hover:text-gold"
                }`}
              >
                Rings
              </button>
              <button
                onClick={() => setActiveCategory("bracelets")}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeCategory === "bracelets"
                    ? "bg-gold text-charcoal"
                    : "bg-pearl-light text-charcoal hover:bg-gold/10 hover:text-gold"
                }`}
              >
                Bracelets
              </button>
              <button
                onClick={() => setActiveCategory("sets")}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeCategory === "sets"
                    ? "bg-gold text-charcoal"
                    : "bg-pearl-light text-charcoal hover:bg-gold/10 hover:text-gold"
                }`}
              >
                Pearl Sets
              </button>
            </div>
          </div>

          {/* Search Results */}
          <div className="max-h-[60vh] overflow-y-auto">
            {searchQuery.trim() === "" ? (
              <div className="p-6">
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-slate flex items-center gap-1">
                        <Clock size={16} />
                        Recent Searches
                      </h3>
                      <button
                        onClick={clearRecentSearches}
                        className="text-xs text-slate hover:text-gold"
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((search, index) => (
                        <button
                          key={index}
                          onClick={() => setSearchQuery(search)}
                          className="px-3 py-1.5 bg-pearl hover:bg-pearl-dark rounded-full text-sm text-charcoal transition-colors"
                        >
                          {search}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Popular Searches */}
                <div>
                  <h3 className="text-sm font-medium text-slate flex items-center gap-1 mb-3">
                    <Sparkles size={16} />
                    Popular Searches
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {popularSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => setSearchQuery(search)}
                        className="px-3 py-1.5 bg-gold/10 hover:bg-gold/20 rounded-full text-sm text-gold transition-colors"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid gap-3 p-4">
                {filteredProducts.map((product) => (
                  <Link
                    href={`/product/${product.id}`}
                    key={product.id}
                    className="flex items-center gap-4 p-4 hover:bg-pearl rounded-xl cursor-pointer border border-pearl-dark transition-all duration-200"
                    onClick={onClose}
                  >
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover rounded-lg"
                      />
                      {product.isNew && (
                        <span className="absolute top-1 right-1 bg-sapphire text-pearl text-xs font-medium px-2 py-0.5 rounded-full">
                          New
                        </span>
                      )}
                      {product.discount > 0 && (
                        <span className="absolute top-1 left-1 bg-gold text-charcoal text-xs font-medium px-2 py-0.5 rounded-full">
                          -{product.discount}%
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg text-charcoal truncate">
                          {product.name}
                        </h3>
                        {product.category && (
                          <span className="text-xs bg-pearl text-charcoal px-2 py-0.5 rounded-full">
                            {product.category}
                          </span>
                        )}
                      </div>
                      <p className="text-base font-medium text-gold mt-1">
                        ${product.price}
                        {product.discount > 0 && (
                          <span className="text-sm text-slate line-through ml-2">
                            ${(product.price / (1 - product.discount / 100)).toFixed(2)}
                          </span>
                        )}
                      </p>
                      {product.description && (
                        <p className="text-sm text-slate mt-1 line-clamp-2">
                          {product.description}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-slate py-12">
                <BsSearch className="text-slate" size={24} />
                <p className="mt-4 text-slate">
                  No pearl jewelry found matching your search.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
