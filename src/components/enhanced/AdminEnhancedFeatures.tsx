'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Loader2, TrendingUp, Package, DollarSign, AlertTriangle } from 'lucide-react'

interface CategoryAnalytics {
  _id: string
  name: string
  slug: string
  productCount: number
  totalValue: number
  avgPrice: number
  inStockProducts: number
}

interface BulkOperationResult {
  success: boolean
  message: string
  data?: any
}

export function AdminEnhancedFeatures() {
  const [isLoading, setIsLoading] = useState(false)
  const [analytics, setAnalytics] = useState<CategoryAnalytics[]>([])
  const [bulkDiscount, setBulkDiscount] = useState({ categoryId: '', percentage: '' })
  const [bulkResult, setBulkResult] = useState<BulkOperationResult | null>(null)

  // 🚀 Load category analytics
  const loadAnalytics = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/categories-enhanced?type=analytics')
      const data = await response.json()
      setAnalytics(data.data || [])
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 🚀 Apply bulk discount
  const applyBulkDiscount = async () => {
    if (!bulkDiscount.categoryId || !bulkDiscount.percentage) {
      alert('Please select a category and enter a discount percentage')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/products-enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'bulk_discount',
          data: {
            categoryId: bulkDiscount.categoryId,
            percentage: parseFloat(bulkDiscount.percentage)
          }
        })
      })

      const result = await response.json()
      setBulkResult(result)
      
      // Refresh analytics after bulk operation
      if (result.success) {
        await loadAnalytics()
      }
    } catch (error) {
      console.error('Bulk discount failed:', error)
      setBulkResult({ success: false, message: 'Operation failed' })
    } finally {
      setIsLoading(false)
    }
  }

  // 🚀 Simulate bulk stock update
  const simulateBulkStockUpdate = async () => {
    setIsLoading(true)
    try {
      // Example: Update stock for multiple products
      const stockUpdates = [
        { productId: '686da9b0ac573e42c7f2de67', quantity: 5 },
        { productId: '686da9b0ac573e42c7f2de68', quantity: -2 },
        { productId: '686da9b0ac573e42c7f2de69', quantity: 10 }
      ]

      const response = await fetch('/api/products-enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'bulk_stock_update',
          data: { updates: stockUpdates }
        })
      })

      const result = await response.json()
      setBulkResult(result)
    } catch (error) {
      console.error('Bulk stock update failed:', error)
      setBulkResult({ success: false, message: 'Stock update failed' })
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    loadAnalytics()
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          🚀 Enhanced Admin Features
        </h2>
        <p className="text-lg text-gray-600">
          Powered by Advanced Mongoose Features
        </p>
      </div>

      {/* Category Analytics */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Category Analytics
          </CardTitle>
          <Button onClick={loadAnalytics} disabled={isLoading} variant="outline">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Refresh'}
          </Button>
        </CardHeader>
        <CardContent>
          {analytics.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analytics.map((category) => (
                <div key={category._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 flex items-center gap-1">
                        <Package className="w-4 h-4" />
                        Products
                      </span>
                      <Badge variant="outline">{category.productCount}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        Total Value
                      </span>
                      <span className="font-medium">৳{category.totalValue?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Avg Price</span>
                      <span className="font-medium">৳{Math.round(category.avgPrice || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" />
                        In Stock
                      </span>
                      <Badge variant={category.inStockProducts === category.productCount ? "default" : "destructive"}>
                        {category.inStockProducts}/{category.productCount}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {isLoading ? 'Loading analytics...' : 'No analytics data available'}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bulk Discount */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Bulk Discount Application
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="category-select">Select Category</Label>
              <Select 
                value={bulkDiscount.categoryId} 
                onValueChange={(value) => setBulkDiscount(prev => ({ ...prev, categoryId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a category" />
                </SelectTrigger>
                <SelectContent>
                  {analytics.map((category) => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.name} ({category.productCount} products)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="discount-percentage">Discount Percentage</Label>
              <Input
                id="discount-percentage"
                type="number"
                placeholder="Enter discount percentage (e.g., 15)"
                value={bulkDiscount.percentage}
                onChange={(e) => setBulkDiscount(prev => ({ ...prev, percentage: e.target.value }))}
                min="1"
                max="90"
              />
            </div>

            <Button 
              onClick={applyBulkDiscount} 
              disabled={isLoading || !bulkDiscount.categoryId || !bulkDiscount.percentage}
              className="w-full"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Apply Bulk Discount
            </Button>
          </CardContent>
        </Card>

        {/* Bulk Stock Update */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Bulk Stock Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              Simulate bulk stock updates for multiple products at once.
            </div>

            <Button 
              onClick={simulateBulkStockUpdate} 
              disabled={isLoading}
              className="w-full"
              variant="outline"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Run Stock Update Demo
            </Button>

            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
              This demo will update stock for several products:
              <ul className="mt-1 space-y-1">
                <li>• Product 1: +5 stock</li>
                <li>• Product 2: -2 stock</li>
                <li>• Product 3: +10 stock</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Operation Results */}
      {bulkResult && (
        <Card className={`border-l-4 ${bulkResult.success ? 'border-l-green-500 bg-green-50' : 'border-l-red-500 bg-red-50'}`}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-2 h-2 rounded-full ${bulkResult.success ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="font-medium">
                {bulkResult.success ? 'Operation Successful' : 'Operation Failed'}
              </span>
            </div>
            <p className="text-sm text-gray-700">{bulkResult.message}</p>
            {bulkResult.data && (
              <pre className="text-xs bg-white p-2 rounded mt-2 overflow-auto">
                {JSON.stringify(bulkResult.data, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
