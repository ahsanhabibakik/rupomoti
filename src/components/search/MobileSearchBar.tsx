'use client'

import { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface MobileSearchBarProps {
  onSearch: (query: string) => void
  className?: string
}

const searchPlaceholders = [
  "Search for rings...",
  "Find beautiful necklaces...",
  "Discover pearl earrings...",
  "Browse elegant bracelets...", 
  "Explore diamond jewelry...",
  "Look for pendant designs...",
  "Search gold jewelry...",
  "Find wedding rings..."
]

export default function MobileSearchBar({ onSearch, className }: MobileSearchBarProps) {
  const [query, setQuery] = useState('')
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Rotate placeholders every 3 seconds
    const interval = setInterval(() => {
      setCurrentPlaceholder((prev) => (prev + 1) % searchPlaceholders.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Smooth animation for placeholder changes
    setIsVisible(false)
    const timeout = setTimeout(() => setIsVisible(true), 150)
    return () => clearTimeout(timeout)
  }, [currentPlaceholder])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      onSearch(query.trim())
    }
  }

  return (
    <div className={cn("w-full", className)}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholders[currentPlaceholder]}
            className={cn(
              "w-full pl-10 pr-10 py-2.5 rounded-full border-2 border-accent/30 focus:border-primary transition-all duration-300",
              "placeholder:transition-opacity placeholder:duration-300",
              isVisible ? "placeholder:opacity-100" : "placeholder:opacity-50"
            )}
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full hover:bg-accent/20"
              onClick={() => setQuery('')}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}
