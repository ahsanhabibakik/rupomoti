'use client'

import { useState, useEffect } from 'react'
import { X, Tag, Clock, TrendingUp, Leaf, Filter } from 'lucide-react'
import { BsSearch } from 'react-icons/bs'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
  initialQuery?: string
}

export default function SearchModal({ isOpen, onClose, initialQuery = '' }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [activeCategory, setActiveCategory] = useState('all')
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [popularSearches] = useState([
    "Pearl Necklaces",
    "Earrings",
    "Bracelets",
    "Rings",
    "Pearl Sets",
    "New Arrivals",
    "Best Sellers",
    "Gifts",
  ])

  const router = useRouter()

  // Load recent searches from localStorage
  useEffect(() => {
    const savedSearches = localStorage.getItem('recentSearches')
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches))
    }
  }, [])

  // Save search to recent searches
  const saveSearch = (query: string) => {
    if (!query.trim()) return

    const updatedSearches = [
      query,
      ...recentSearches.filter((search) => search !== query),
    ].slice(0, 5) // Keep only the 5 most recent searches

    setRecentSearches(updatedSearches)
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches))
  }

  // Handle search submission
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      saveSearch(searchQuery)
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`)
      onClose()
    }
  }

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem('recentSearches')
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop with blur effect */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-md z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-0 left-0 right-0 flex items-start justify-center p-4 z-50">
        <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl mt-16 border border-gray-100 overflow-hidden">
          {/* Search Input */}
          <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-primary/5 to-white">
            <form onSubmit={handleSearch}>
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for jewelry, accessories, or gifts..."
                    className="w-full px-4 py-3 pl-12 pr-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 text-gray-800 placeholder-gray-400"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <BsSearch size={20} />
                  </button>
                </div>
                <button
                  onClick={onClose}
                  className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors duration-200 text-gray-600 hover:text-gray-800"
                >
                  <X size={22} />
                </button>
              </div>
            </form>
          </div>

          {/* Categories */}
          <div className="p-3 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeCategory === 'all'
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-700 hover:bg-primary/10 hover:text-primary'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveCategory('necklaces')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeCategory === 'necklaces'
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-700 hover:bg-primary/10 hover:text-primary'
                }`}
              >
                Necklaces
              </button>
              <button
                onClick={() => setActiveCategory('earrings')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeCategory === 'earrings'
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-700 hover:bg-primary/10 hover:text-primary'
                }`}
              >
                Earrings
              </button>
              <button
                onClick={() => setActiveCategory('rings')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeCategory === 'rings'
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-700 hover:bg-primary/10 hover:text-primary'
                }`}
              >
                Rings
              </button>
              <button
                onClick={() => setActiveCategory('bracelets')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeCategory === 'bracelets'
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-700 hover:bg-primary/10 hover:text-primary'
                }`}
              >
                Bracelets
              </button>
              <button
                onClick={() => setActiveCategory('sets')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeCategory === 'sets'
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-700 hover:bg-primary/10 hover:text-primary'
                }`}
              >
                Pearl Sets
              </button>
            </div>
          </div>

          {/* Search Results */}
          <div className="max-h-[60vh] overflow-y-auto">
            {searchQuery.trim() === '' ? (
              <div className="p-6">
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-gray-500 flex items-center gap-1">
                        <Clock size={16} />
                        Recent Searches
                      </h3>
                      <button
                        onClick={clearRecentSearches}
                        className="text-xs text-gray-400 hover:text-gray-600"
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((search, index) => (
                        <button
                          key={index}
                          onClick={() => setSearchQuery(search)}
                          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
                        >
                          {search}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Popular Searches */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 flex items-center gap-1 mb-3">
                    <TrendingUp size={16} />
                    Popular Searches
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {popularSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => setSearchQuery(search)}
                        className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 rounded-full text-sm text-primary transition-colors"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-400 py-12">
                <BsSearch className="text-gray-400" size={24} />
                <p className="mt-4 text-gray-500">
                  Type to search for products...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
} 