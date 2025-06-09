'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState('7d')
  const [loading, setLoading] = useState(false)

  // Mock data for demonstration
  const salesData = {
    totalSales: 125000,
    totalOrders: 156,
    averageOrderValue: 801.28,
    topProducts: [
      { name: 'Product 1', sales: 25000, orders: 25 },
      { name: 'Product 2', sales: 18000, orders: 18 },
      { name: 'Product 3', sales: 15000, orders: 15 },
    ],
    salesByCategory: [
      { category: 'Electronics', sales: 45000 },
      { category: 'Clothing', sales: 35000 },
      { category: 'Home & Kitchen', sales: 25000 },
      { category: 'Books', sales: 20000 },
    ],
    dailySales: [
      { date: '2024-03-01', sales: 15000 },
      { date: '2024-03-02', sales: 18000 },
      { date: '2024-03-03', sales: 22000 },
      { date: '2024-03-04', sales: 19000 },
      { date: '2024-03-05', sales: 21000 },
      { date: '2024-03-06', sales: 17000 },
      { date: '2024-03-07', sales: 13000 },
    ],
  }

  const handleExport = async (type: string) => {
    setLoading(true)
    try {
      // TODO: Implement export functionality
      console.log('Exporting', type, 'report for date range:', dateRange)
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
    } catch (error) {
      console.error('Error exporting report:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        <div className="flex items-center gap-4">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => handleExport('sales')} disabled={loading}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Sales</CardTitle>
            <CardDescription>Total revenue in selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">৳{salesData.totalSales.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Orders</CardTitle>
            <CardDescription>Number of orders in selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{salesData.totalOrders}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Average Order Value</CardTitle>
            <CardDescription>Average revenue per order</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">৳{salesData.averageOrderValue.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Sales Overview</CardTitle>
              <CardDescription>Daily sales trend for the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              {/* TODO: Implement sales chart using a charting library */}
              <div className="h-[300px] flex items-center justify-center border rounded-lg">
                Sales chart will be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
              <CardDescription>Best performing products by revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {salesData.topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.orders} orders</p>
                    </div>
                    <p className="font-bold">৳{product.sales.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Sales by Category</CardTitle>
              <CardDescription>Revenue distribution across categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {salesData.salesByCategory.map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <p className="font-medium">{category.category}</p>
                    <p className="font-bold">৳{category.sales.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers">
          <Card>
            <CardHeader>
              <CardTitle>Customer Analytics</CardTitle>
              <CardDescription>Customer behavior and demographics</CardDescription>
            </CardHeader>
            <CardContent>
              {/* TODO: Implement customer analytics */}
              <div className="h-[300px] flex items-center justify-center border rounded-lg">
                Customer analytics will be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 