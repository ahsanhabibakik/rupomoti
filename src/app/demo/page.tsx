'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Search, 
  DollarSign, 
  Star
} from 'lucide-react'
import { EnhancedProductCard } from '@/components/enhanced/EnhancedProductCard'
import { AdminEnhancedFeatures } from '@/components/enhanced/AdminEnhancedFeatures'

interface Product {
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
  category?: {
    name: string
    slug: string
  }
}

interface CategoryAnalytics {
  _id: string
  name: string
  slug: string
  productCount: number
  totalValue: number
  avgPrice: number
  inStockProducts: number
}

export default function DemoPage() {
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [saleProducts, setSaleProducts] = useState<Product[]>([])
  const [analytics, setAnalytics] = useState<CategoryAnalytics[]>([])
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })
  const [priceRangeProducts, setPriceRangeProducts] = useState<Product[]>([])

  // Load initial data
  useEffect(() => {
    loadFeaturedProducts()
    loadSaleProducts()
    loadAnalytics()
  }, [])

  // 🚀 Enhanced Product Search
  const handleSearch = async () => {
    if (!searchTerm.trim()) return

    setLoading(true)
    try {
      const response = await fetch(`/api/products-enhanced?search=${encodeURIComponent(searchTerm)}&limit=8`)
      const data = await response.json()
      setSearchResults(data.data || [])
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }

  // 🚀 Load Featured Products
  const loadFeaturedProducts = async () => {
    try {
      const response = await fetch('/api/products-enhanced?type=featured&limit=6')
      const data = await response.json()
      setFeaturedProducts(data.data || [])
    } catch (error) {
      console.error('Failed to load featured products:', error)
    }
  }

  // 🚀 Load Sale Products
  const loadSaleProducts = async () => {
    try {
      const response = await fetch('/api/products-enhanced?type=sale&limit=6')
      const data = await response.json()
      setSaleProducts(data.data || [])
    } catch (error) {
      console.error('Failed to load sale products:', error)
    }
  }

  // 🚀 Load Category Analytics
  const loadAnalytics = async () => {
    try {
      const response = await fetch('/api/categories-enhanced?type=analytics')
      const data = await response.json()
      setAnalytics(data.data || [])
    } catch (error) {
      console.error('Failed to load analytics:', error)
    }
  }

  // 🚀 Price Range Search
  const searchPriceRange = async () => {
    if (!priceRange.min || !priceRange.max) return

    setLoading(true)
    try {
      const response = await fetch(
        `/api/products-enhanced?minPrice=${priceRange.min}&maxPrice=${priceRange.max}`
      )
      const data = await response.json()
      setPriceRangeProducts(data.data || [])
    } catch (error) {
      console.error('Price range search failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-center mb-2">
          🚀 Mongoose Advanced Features Demo
        </h1>
        <p className="text-muted-foreground text-center">
          Showcasing the power of our enhanced product and category system
        </p>
      </div>

      <Tabs defaultValue="search" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="search">🔍 Search</TabsTrigger>
          <TabsTrigger value="featured">⭐ Featured</TabsTrigger>
          <TabsTrigger value="sales">🏷️ Sales</TabsTrigger>
          <TabsTrigger value="analytics">📊 Analytics</TabsTrigger>
          <TabsTrigger value="admin">⚙️ Admin</TabsTrigger>
        </TabsList>

        {/* Enhanced Search Tab */}
        <TabsContent value="search" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Smart Product Search
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Search products by name, description, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} disabled={loading}>
                  {loading ? 'Searching...' : 'Search'}
                </Button>
              </div>

              {/* Price Range Filter */}
              <div className="flex gap-2 items-center">
                <span className="text-sm font-medium">Price Range:</span>
                <Input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                  className="w-24"
                />
                <span>-</span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                  className="w-24"
                />
                <Button onClick={searchPriceRange} variant="outline" disabled={loading}>
                  Filter
                </Button>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Search Results ({searchResults.length})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {searchResults.map((product) => (
                      <EnhancedProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </div>
              )}

              {/* Price Range Results */}
              {priceRangeProducts.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">
                    Price Range Results (${priceRange.min} - ${priceRange.max})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {priceRangeProducts.map((product) => (
                      <EnhancedProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Featured Products Tab */}
        <TabsContent value="featured" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                Featured Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuredProducts.map((product) => (
                  <EnhancedProductCard key={product.id} product={product} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sale Products Tab */}
        <TabsContent value="sales" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Products on Sale
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {saleProducts.map((product) => (
                  <EnhancedProductCard key={product.id} product={product} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analytics.map((category) => (
              <Card key={category._id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{category.name}</span>
                    <Badge variant="outline">
                      {category.productCount} products
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Value:</span>
                    <span className="font-semibold">${category.totalValue.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Avg Price:</span>
                    <span className="font-semibold">${category.avgPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">In Stock:</span>
                    <span className="font-semibold">{category.inStockProducts}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(category.inStockProducts / category.productCount) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {((category.inStockProducts / category.productCount) * 100).toFixed(1)}% in stock
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>📈 Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {analytics.reduce((sum, cat) => sum + cat.productCount, 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Products</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    ${analytics.reduce((sum, cat) => sum + cat.totalValue, 0).toFixed(0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Inventory Value</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {analytics.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Categories</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {analytics.reduce((sum, cat) => sum + cat.inStockProducts, 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">In Stock Items</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Admin Features Tab */}
        <TabsContent value="admin" className="space-y-6">
          <AdminEnhancedFeatures />
        </TabsContent>
      </Tabs>
    </div>
  )
}
