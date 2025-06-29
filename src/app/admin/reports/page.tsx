'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Download, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  ShoppingCart, 
  Package,
  DollarSign,
  AlertTriangle,
  Eye,
  Star
} from 'lucide-react'
import { toast } from 'sonner'

const formatCurrency = (amount: number) => `৳${amount.toLocaleString()}`

interface ReportData {
  overview?: {
    totalOrders: number;
    totalRevenue: number;
    totalProducts: number;
    totalCustomers: number;
    completedOrders: number;
    pendingOrders: number;
    cancelledOrders: number;
    lowStockProducts: number;
    averageOrderValue: number;
  };
  dailySales?: Array<{
    date: string;
    sales: number;
    orders: number;
  }>;
  salesByCategory?: Array<{
    category: string;
    sales: number;
    quantity: number;
  }>;
  topProducts?: Array<{
    productId: string;
    name: string;
    image: string | null;
    sales: number;
    quantity: number;
    orders: number;
  }>;
  productPerformance?: Array<{
    id: string;
    name: string;
    sku: string;
    category: string;
    stock: number;
    price: number;
    salePrice: number | null;
    totalSold: number;
    revenue: number;
    ordersCount: number;
  }>;
  stockReport?: Array<{
    id: string;
    name: string;
    sku: string;
    stock: number;
    price: number;
    stockStatus: 'critical' | 'low' | 'normal';
  }>;
  topCustomers?: Array<{
    id: string;
    name: string;
    email: string;
    totalSpent: number;
    orderCount: number;
    averageOrderValue: number;
  }>;
  customerStats?: {
    newCustomers: number;
    activeCustomers: number;
    returningCustomers: number;
  };
}

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState('7d')
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [reportData, setReportData] = useState<ReportData>({})

  const fetchReportData = async (type: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/reports?period=${dateRange}&type=${type}`)
      if (!response.ok) throw new Error('Failed to fetch report data')
      
      const data = await response.json()
      setReportData(prev => ({ ...prev, ...data }))
    } catch (error) {
      console.error('Error fetching report data:', error)
      toast.error('Failed to load report data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReportData(activeTab)
  }, [dateRange, activeTab])

  const handleExport = async (type: string) => {
    setLoading(true)
    try {
      console.log('Exporting', type, 'report for date range:', dateRange)
      toast.success(`Exporting ${type} report...`)
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error) {
      console.error('Error exporting report:', error)
      toast.error('Failed to export report')
    } finally {
      setLoading(false)
    }
  }

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'bg-red-500'
      case 'low':
        return 'bg-yellow-500'
      default:
        return 'bg-green-500'
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        <div className="flex gap-4">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="3m">Last 3 months</SelectItem>
              <SelectItem value="12m">Last 12 months</SelectItem>
              <SelectItem value="thisMonth">This month</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={() => handleExport(activeTab)}
            disabled={loading}
            variant="outline"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {reportData.overview && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(reportData.overview.totalRevenue)}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{reportData.overview.totalOrders}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Products</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{reportData.overview.totalProducts}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">New Customers</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{reportData.overview.totalCustomers}</div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Order Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Completed</span>
                      <Badge variant="secondary">{reportData.overview.completedOrders}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Pending</span>
                      <Badge variant="outline">{reportData.overview.pendingOrders}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Cancelled</span>
                      <Badge variant="destructive">{reportData.overview.cancelledOrders}</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Average Order Value</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(reportData.overview.averageOrderValue)}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      Low Stock Alert
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-600">{reportData.overview.lowStockProducts}</div>
                    <p className="text-xs text-muted-foreground">Products with low stock</p>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          {reportData.topProducts && (
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportData.topProducts.slice(0, 5).map((product, index) => (
                    <div key={product.productId} className="flex items-center space-x-4">
                      <div className="font-bold text-sm w-6">#{index + 1}</div>
                      <div className="flex-1">
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {product.quantity} sold • {product.orders} orders
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(product.sales)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {reportData.salesByCategory && (
            <Card>
              <CardHeader>
                <CardTitle>Sales by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportData.salesByCategory.map((category) => (
                    <div key={category.category} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">{category.category}</span>
                        <span className="text-sm">{formatCurrency(category.sales)}</span>
                      </div>
                      <Progress 
                        value={(category.sales / Math.max(...reportData.salesByCategory!.map(c => c.sales))) * 100} 
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          {reportData.stockReport && (
            <Card>
              <CardHeader>
                <CardTitle>Stock Status</CardTitle>
                <CardDescription>Current inventory levels</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reportData.stockReport.slice(0, 10).map((product) => (
                    <div key={product.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">{product.stock} units</span>
                        <div 
                          className={`w-3 h-3 rounded-full ${getStockStatusColor(product.stockStatus)}`}
                          title={product.stockStatus}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {reportData.productPerformance && (
            <Card>
              <CardHeader>
                <CardTitle>Product Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportData.productPerformance.slice(0, 10).map((product) => (
                    <div key={product.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {product.category} • {product.totalSold} sold
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(product.revenue)}</p>
                        <p className="text-sm text-muted-foreground">{product.ordersCount} orders</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          {reportData.customerStats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">New Customers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{reportData.customerStats.newCustomers}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Active Customers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{reportData.customerStats.activeCustomers}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Returning Customers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{reportData.customerStats.returningCustomers}</div>
                </CardContent>
              </Card>
            </div>
          )}

          {reportData.topCustomers && (
            <Card>
              <CardHeader>
                <CardTitle>Top Customers</CardTitle>
                <CardDescription>Customers by total spending</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportData.topCustomers.slice(0, 10).map((customer, index) => (
                    <div key={customer.id} className="flex items-center space-x-4">
                      <div className="font-bold text-sm w-6">#{index + 1}</div>
                      <div className="flex-1">
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {customer.orderCount} orders • Avg: {formatCurrency(customer.averageOrderValue)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(customer.totalSpent)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {loading && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span>Loading report data...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}