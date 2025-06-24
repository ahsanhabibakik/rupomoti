'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useProducts } from '@/hooks/useProducts'
import { useOrders } from '@/hooks/useOrders'
import { useCategories } from '@/hooks/useCategories'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, ListOrdered, Users, Package, TrendingUp, Activity, UserPlus, Clock, PackageMinus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export default function DashboardPage() {
  const { data: products, isLoading: productsLoading } = useProducts()
  const { data: orders, isLoading: ordersLoading } = useOrders()
  const { data: categories, isLoading: categoriesLoading } = useCategories()
  const [salesData, setSalesData] = useState<any[]>([])
  const [categoryData, setCategoryData] = useState<any[]>([])
  const [topProducts, setTopProducts] = useState<any[]>([])
  const { toast } = useToast()

  // Mock analytics data
  const todaysSales = 12500
  const newCustomers = 7
  const pendingOrders = Array.isArray(orders) ? orders.filter((order: any) => order.status === 'PENDING').length : 0
  const processingOrders = Array.isArray(orders) ? orders.filter((order: any) => order.status === 'PROCESSING').length : 0
  const lowStockProducts = 2

  useEffect(() => {
    if (orders && Array.isArray(orders)) {
      // Group orders by date and calculate total sales
      const salesByDate = orders.reduce((acc: any, order: any) => {
        const date = new Date(order.createdAt).toLocaleDateString('bn-BD')
        acc[date] = (acc[date] || 0) + order.total
        return acc
      }, {})

      // Convert to array format for chart
      const chartData = Object.entries(salesByDate).map(([date, total]) => ({
        date,
        total,
      }))

      // Sort by date
      chartData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      setSalesData(chartData)

      // Calculate top products
      const productSales = orders.reduce((acc: any, order: any) => {
        order.items.forEach((item: any) => {
          if (!acc[item.product.id]) {
            acc[item.product.id] = {
              name: item.product.name,
              total: 0,
              quantity: 0,
            }
          }
          acc[item.product.id].total += item.price * item.quantity
          acc[item.product.id].quantity += item.quantity
        })
        return acc
      }, {})

      setTopProducts(
        Object.values(productSales)
          .sort((a: any, b: any) => b.total - a.total)
          .slice(0, 5)
      )
    }
  }, [orders])

  useEffect(() => {
    if (products && categories && Array.isArray(categories)) {
      const data = categories.map((category: any) => ({
        name: category.name,
        value: category._count?.products || 0,
      }))
      setCategoryData(data)
    }
  }, [products, categories])

  // Show loading state if any data is still loading
  if (productsLoading || ordersLoading || categoriesLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    )
  }

  const totalSales = Array.isArray(orders) ? orders.reduce((sum: number, order: any) => sum + order.total, 0) : 0
  const totalOrders = Array.isArray(orders) ? orders.length : 0
  const totalProducts = Array.isArray(products) ? products.length : 0
  const totalCategories = Array.isArray(categories) ? categories.length : 0

  const shippedOrders = Array.isArray(orders) ? orders.filter((order: any) => order.status === 'SHIPPED').length : 0
  const deliveredOrders = Array.isArray(orders) ? orders.filter((order: any) => order.status === 'DELIVERED').length : 0

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* Analytics Mini-Widgets */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
        <div className="flex flex-col items-center justify-center p-3 bg-gradient-to-br from-primary/10 to-white rounded-xl border border-primary/20 shadow-sm">
          <TrendingUp className="h-6 w-6 text-primary mb-1" />
          <span className="text-lg font-bold">৳{todaysSales.toLocaleString('bn-BD')}</span>
          <span className="text-xs text-muted-foreground">Today&apos;s Sales</span>
        </div>
        <div className="flex flex-col items-center justify-center p-3 bg-gradient-to-br from-green-100 to-white rounded-xl border border-green-200 shadow-sm">
          <UserPlus className="h-6 w-6 text-green-600 mb-1" />
          <span className="text-lg font-bold">{newCustomers}</span>
          <span className="text-xs text-muted-foreground">New Customers</span>
        </div>
        <div className="flex flex-col items-center justify-center p-3 bg-gradient-to-br from-yellow-100 to-white rounded-xl border border-yellow-200 shadow-sm">
          <Clock className="h-6 w-6 text-yellow-600 mb-1" />
          <span className="text-lg font-bold">{pendingOrders}</span>
          <span className="text-xs text-muted-foreground">Pending Orders</span>
        </div>
        <div className="flex flex-col items-center justify-center p-3 bg-gradient-to-br from-red-100 to-white rounded-xl border border-red-200 shadow-sm">
          <PackageMinus className="h-6 w-6 text-red-600 mb-1" />
          <span className="text-lg font-bold">{lowStockProducts}</span>
          <span className="text-xs text-muted-foreground">Low Stock</span>
        </div>
      </div>

      {/* Demo Toast Button */}
      <div className="mb-4">
        <button
          onClick={() => toast({ title: 'Success!', description: 'This is a demo toast notification.', variant: 'success' })}
          className="px-4 py-2 bg-primary text-white rounded-lg shadow hover:bg-primary/90 transition"
        >
          Show Toast
        </button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
        <a href="/admin/products" className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow hover:shadow-lg transition group border border-gray-100">
          <Plus className="h-6 w-6 text-primary mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-medium">Add Product</span>
        </a>
        <a href="/admin/orders" className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow hover:shadow-lg transition group border border-gray-100">
          <ListOrdered className="h-6 w-6 text-primary mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-medium">View Orders</span>
        </a>
        <a href="/admin/customers" className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow hover:shadow-lg transition group border border-gray-100">
          <Users className="h-6 w-6 text-primary mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-medium">Customers</span>
        </a>
        <a href="/admin/reports" className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow hover:shadow-lg transition group border border-gray-100">
          <TrendingUp className="h-6 w-6 text-primary mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-medium">Reports</span>
        </a>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('bn-BD', {
                style: 'currency',
                currency: 'BDT'
              }).format(totalSales)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCategories}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-4 mt-4 border border-gray-100">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="h-5 w-5 text-primary" />
          <span className="font-semibold">Recent Activity</span>
        </div>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>Order #1234 was placed by John Doe (৳5,000)</li>
          <li>Product &quot;Classic Pearl Necklace&quot; was added</li>
          <li>Order #1233 was marked as shipped</li>
          <li>Customer &quot;Jane Smith&quot; signed up</li>
        </ul>
      </div>

      <Tabs defaultValue="sales" className="space-y-6">
        <TabsList>
          <TabsTrigger value="sales">Sales Analytics</TabsTrigger>
          <TabsTrigger value="products">Product Analytics</TabsTrigger>
          <TabsTrigger value="orders">Order Status</TabsTrigger>
        </TabsList>

        <TabsContent value="sales">
          <Card>
            <CardHeader>
              <CardTitle>Sales Overview</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) =>
                      new Intl.NumberFormat('bn-BD', {
                        style: 'currency',
                        currency: 'BDT'
                      }).format(value as number)
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#8884d8"
                    name="Sales"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Products by Category</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProducts}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) =>
                        new Intl.NumberFormat('bn-BD', {
                          style: 'currency',
                          currency: 'BDT'
                        }).format(value as number)
                      }
                    />
                    <Bar dataKey="total" fill="#8884d8" name="Sales" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Pending</span>
                  <div className="flex items-center">
                    <div className="w-32 h-2 bg-gray-200 rounded-full mr-2">
                      <div
                        className="h-full bg-yellow-400 rounded-full"
                        style={{
                          width: `${(pendingOrders / totalOrders) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-yellow-600">{pendingOrders}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-medium">Processing</span>
                  <div className="flex items-center">
                    <div className="w-32 h-2 bg-gray-200 rounded-full mr-2">
                      <div
                        className="h-full bg-blue-400 rounded-full"
                        style={{
                          width: `${(processingOrders / totalOrders) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-blue-600">{processingOrders}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-medium">Shipped</span>
                  <div className="flex items-center">
                    <div className="w-32 h-2 bg-gray-200 rounded-full mr-2">
                      <div
                        className="h-full bg-purple-400 rounded-full"
                        style={{
                          width: `${(shippedOrders / totalOrders) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-purple-600">{shippedOrders}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-medium">Delivered</span>
                  <div className="flex items-center">
                    <div className="w-32 h-2 bg-gray-200 rounded-full mr-2">
                      <div
                        className="h-full bg-green-400 rounded-full"
                        style={{
                          width: `${(deliveredOrders / totalOrders) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-green-600">{deliveredOrders}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 