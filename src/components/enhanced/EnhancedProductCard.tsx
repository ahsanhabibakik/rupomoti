import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShoppingCart, Eye, Heart } from 'lucide-react'
import Image from 'next/image'

interface EnhancedProduct {
  id: string
  name: string
  description: string
  price: number
  discountPrice?: number
  finalPrice: number
  discountPercentage: number
  isOnSale: boolean
  isInStock: boolean
  isLowStock: boolean
  images: string[]
  isFeatured: boolean
  isPopular: boolean
  stock: number
}

interface EnhancedProductCardProps {
  product: EnhancedProduct
  onAddToCart?: (productId: string) => void
  onViewDetails?: (productId: string) => void
  onAddToWishlist?: (productId: string) => void
}

export function EnhancedProductCard({ 
  product, 
  onAddToCart, 
  onViewDetails, 
  onAddToWishlist 
}: EnhancedProductCardProps) {
  return (
    <Card className="group relative overflow-hidden hover:shadow-lg transition-all duration-300">
      {/* Sale Badge */}
      {product.isOnSale && (
        <Badge 
          variant="destructive" 
          className="absolute top-2 left-2 z-10 bg-red-500 hover:bg-red-600"
        >
          {product.discountPercentage}% OFF
        </Badge>
      )}

      {/* Stock Status */}
      {product.isLowStock && product.isInStock && (
        <Badge 
          variant="outline" 
          className="absolute top-2 right-2 z-10 bg-orange-100 text-orange-800 border-orange-300"
        >
          Only {product.stock} left!
        </Badge>
      )}

      {!product.isInStock && (
        <Badge 
          variant="outline" 
          className="absolute top-2 right-2 z-10 bg-gray-100 text-gray-800 border-gray-300"
        >
          Out of Stock
        </Badge>
      )}

      {/* Featured Badge */}
      {product.isFeatured && (
        <Badge 
          className="absolute top-12 left-2 z-10 bg-gradient-to-r from-amber-400 to-yellow-500 text-white"
        >
          ⭐ Featured
        </Badge>
      )}

      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={product.images[0] || '/images/placeholder.jpg'}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Hover Actions */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300">
          <div className="absolute bottom-4 left-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
            {onViewDetails && (
              <button
                onClick={() => onViewDetails(product.id)}
                className="flex-1 bg-white/90 hover:bg-white text-gray-800 px-3 py-2 rounded-md text-sm font-medium flex items-center justify-center gap-1 transition-colors"
              >
                <Eye className="w-4 h-4" />
                View
              </button>
            )}
            {onAddToWishlist && (
              <button
                onClick={() => onAddToWishlist(product.id)}
                title="Add to Wishlist"
                className="bg-white/90 hover:bg-white text-gray-800 p-2 rounded-md transition-colors"
              >
                <Heart className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Price Display */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-primary">
            ৳{product.finalPrice.toLocaleString()}
          </span>
          {product.isOnSale && (
            <span className="text-sm text-muted-foreground line-through">
              ৳{product.price.toLocaleString()}
            </span>
          )}
        </div>

        {/* Product Features */}
        <div className="flex flex-wrap gap-1 mb-3">
          {product.isPopular && (
            <Badge variant="secondary" className="text-xs">
              🔥 Popular
            </Badge>
          )}
          {product.isInStock && (
            <Badge variant="outline" className="text-xs text-green-600 border-green-200">
              ✓ In Stock
            </Badge>
          )}
        </div>

        {/* Add to Cart Button */}
        {onAddToCart && (
          <button
            onClick={() => onAddToCart(product.id)}
            disabled={!product.isInStock}
            className={`w-full py-2 px-4 rounded-md text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              product.isInStock
                ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            {product.isInStock ? 'Add to Cart' : 'Out of Stock'}
          </button>
        )}
      </CardContent>
    </Card>
  )
}

// 🚀 NEW: Component for displaying sale products section
export function SaleProductsSection({ products }: { products: EnhancedProduct[] }) {
  if (products.length === 0) return null

  return (
    <section className="py-12 bg-gradient-to-r from-red-50 to-pink-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            🔥 Limited Time Sale
          </h2>
          <p className="text-lg text-gray-600">
            Don&apos;t miss out on these amazing deals!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <EnhancedProductCard
              key={product.id}
              product={product}
              onAddToCart={(id) => console.log('Add to cart:', id)}
              onViewDetails={(id) => console.log('View details:', id)}
              onAddToWishlist={(id) => console.log('Add to wishlist:', id)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

// 🚀 NEW: Enhanced search component with filters
export function EnhancedSearchSection() {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [priceRange, setPriceRange] = React.useState({ min: '', max: '' })
  const [results, setResults] = React.useState<EnhancedProduct[]>([])
  const [isLoading, setIsLoading] = React.useState(false)

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/products-enhanced?search=${encodeURIComponent(searchQuery)}&minPrice=${priceRange.min}&maxPrice=${priceRange.max}`)
      const data = await response.json()
      setResults(data.data || [])
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white border rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">🔍 Advanced Product Search</h3>
      
      <div className="space-y-4">
        {/* Search Input */}
        <div>
          <input
            type="text"
            placeholder="Search for jewelry, pearls, necklaces..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>

        {/* Price Range */}
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min Price"
            value={priceRange.min}
            onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <input
            type="number"
            placeholder="Max Price"
            value={priceRange.max}
            onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <button
          onClick={handleSearch}
          disabled={isLoading || !searchQuery.trim()}
          className="w-full bg-primary hover:bg-primary/90 text-white py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Searching...' : 'Search Products'}
        </button>
      </div>

      {/* Search Results */}
      {results.length > 0 && (
        <div className="mt-6">
          <h4 className="font-medium mb-3">Search Results ({results.length})</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.slice(0, 6).map((product) => (
              <EnhancedProductCard
                key={product.id}
                product={product}
                onAddToCart={(id) => console.log('Add to cart:', id)}
                onViewDetails={(id) => console.log('View details:', id)}
                onAddToWishlist={(id) => console.log('Add to wishlist:', id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
