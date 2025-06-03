'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Search, Clock, Sparkles, X } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

const popularSearches = [
  'Pearl Necklace',
  'Diamond Ring',
  'Gold Earrings',
  'Wedding Collection',
  'Gift Sets'
]

const popularItems = [
  {
    id: '1',
    name: 'Classic Pearl Necklace',
    image: '/images/pearl/jewelery1.jpeg',
    price: 2999
  },
  {
    id: '2',
    name: 'Pearl Drop Earrings',
    image: '/images/pearl/jewelery2.jpeg',
    price: 1899
  },
  {
    id: '3',
    name: 'Pearl Tennis Bracelet',
    image: '/images/pearl/jewelery3.jpeg',
    price: 3499
  }
]

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('')
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('recentSearches')
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

  const addToRecentSearches = (term: string) => {
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
  }

  const removeFromRecentSearches = (term: string) => {
    const updated = recentSearches.filter(s => s !== term)
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
  }

  const handleSearch = (term: string) => {
    if (term.trim()) {
      addToRecentSearches(term.trim())
      // TODO: Implement search functionality
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl p-0">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="search"
              placeholder="Search for jewelry, collections, and more..."
              className="pl-10 pr-4 h-12"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
            />
          </div>
        </div>

        <div className="max-h-[80vh] overflow-y-auto p-4">
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Recent Searches
              </h3>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term) => (
                  <div
                    key={term}
                    className="flex items-center gap-1 bg-gray-100 rounded-full px-3 py-1"
                  >
                    <button
                      onClick={() => handleSearch(term)}
                      className="text-sm hover:text-primary"
                    >
                      {term}
                    </button>
                    <button
                      onClick={() => removeFromRecentSearches(term)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Popular Searches */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Popular Searches
            </h3>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((term) => (
                <Button
                  key={term}
                  variant="secondary"
                  size="sm"
                  onClick={() => handleSearch(term)}
                >
                  {term}
                </Button>
              ))}
            </div>
          </div>

          {/* Popular Items */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">Popular Items</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {popularItems.map((item) => (
                <Link
                  key={item.id}
                  href={`/product/${item.id}`}
                  className="group block"
                  onClick={onClose}
                >
                  <div className="aspect-square relative rounded-lg overflow-hidden mb-2">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <h4 className="text-sm font-medium group-hover:text-primary truncate">
                    {item.name}
                  </h4>
                  <p className="text-sm text-gray-500">৳{item.price.toLocaleString()}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 