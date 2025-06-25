'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useProducts } from '@/hooks/useProducts'
import { useOrders } from '@/hooks/useOrders'
import { useCategories } from '@/hooks/useCategories'
import { useCustomers } from '@/hooks/useCustomers'
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
import { 
  Plus, 
  ListOrdered, 
  Users, 
  Package, 
  TrendingUp, 
  Activity, 
  UserPlus, 
  Clock, 
  PackageMinus,
  DollarSign,
  ShoppingCart,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Star,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Filter,
  Search,
  Download,
  RefreshCw,
  Truck,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'

const THEME_COLORS = {
  primary: '#4A2E21', // Soft Cocoa Brown from your theme
  gold: '#C8B38A',    // Warm Oyster Gold
  accent: '#E8CBAF',  // Champagne Gold
  taupe: '#8C7760',   // Mink Taupe
  rose: '#D7AFA4',    // Rose-Gold Accent
}

const COLORS = Object.values(THEME_COLORS);

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>

      {/* Quick Stats & Mini-Widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-[500px] w-full rounded-lg" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-80 w-full rounded-lg" />
          <Skeleton className="h-80 w-full rounded-lg" />
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { data: products, isLoading: productsLoading } = useProducts()
  const { data: orders, isLoading: ordersLoading } = useOrders()
  const { categories, isLoading: categoriesLoading } = useCategories()
  const { customers, loading: customersLoading } = useCustomers('')
  const [salesData, setSalesData] = useState<any[]>([])
  const [categoryData, setCategoryData] = useState<any[]>([])
  const [topProducts, setTopProducts] = useState<any[]>([])
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const { toast } = useToast()
  const [recentActivity, setRecentActivity] = useState<any[]>([])

  const timeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    let interval = seconds / 31536000
    if (interval > 1) return Math.floor(interval) + ' years ago'
    interval = seconds / 2592000
    if (interval > 1) return Math.floor(interval) + ' months ago'
    interval = seconds / 86400
    if (interval > 1) return Math.floor(interval) + ' days ago'
    interval = seconds / 3600
    if (interval > 1) return Math.floor(interval) + ' hours ago'
    interval = seconds / 60
    if (interval > 1) return Math.floor(interval) + ' minutes ago'
    return Math.floor(seconds) + ' seconds ago'
  }

  // Analytics Calculations
  const today = new Date()
  const isToday = (date: Date) => {
    const d = new Date(date)
    return d.getDate() === today.getDate() &&
           d.getMonth() === today.getMonth() &&
           d.getFullYear() === today.getFullYear()
  }

  const todaysSales = Array.isArray(orders) ? orders.filter((o: any) => isToday(o.createdAt)).reduce((sum, o) => sum + o.total, 0) : 0
  const newCustomers = Array.isArray(customers) ? customers.filter((c: any) => isToday(c.createdAt)).length : 0
  const pendingOrders = Array.isArray(orders) ? orders.filter((order: any) => order.status === 'PENDING').length : 0
  const processingOrders = Array.isArray(orders) ? orders.filter((order: any) => order.status === 'PROCESSING').length : 0
  const lowStockProducts = Array.isArray(products) ? products.filter((p: any) => p.stock > 0 && p.stock < 10).length : 0

  const totalSales = Array.isArray(orders) ? orders.reduce((sum: number, order: any) => sum + order.total, 0) : 0
  const totalOrders = Array.isArray(orders) ? orders.length : 0
  const totalCustomers = Array.isArray(customers) ? customers.length : 0
  const totalProducts = Array.isArray(products) ? products.length : 0
  
  // Quick stats data
  const quickStats = [
    {
      title: 'Total Sales',
      value: `৳${Math.round(totalSales).toLocaleString('bn-BD')}`,
      change: '+12.5%', // Placeholder
      changeType: 'positive',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      title: 'Total Orders',
      value: totalOrders.toLocaleString('bn-BD'),
      change: '+8.2%', // Placeholder
      changeType: 'positive',
      icon: ShoppingCart,
      color: 'text-amber-700',
      bgColor: 'bg-amber-100',
      borderColor: 'border-amber-200'
    },
    {
      title: 'Total Customers',
      value: totalCustomers.toLocaleString('bn-BD'),
      change: '+15.3%', // Placeholder
      changeType: 'positive',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      title: 'Products',
      value: totalProducts.toLocaleString('bn-BD'),
      change: '+3.1%', // Placeholder
      changeType: 'positive',
      icon: Package,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    }
  ]

  useEffect(() => {
    if (orders && products && customers) {
      const newOrderActivities = (orders || []).map((order: any) => ({
        id: `order-${order.id}`,
        type: 'order',
        message: `New order #${order.id} placed by ${order.customer?.name || 'a customer'}`,
        time: order.createdAt,
        amount: `৳${order.total.toLocaleString('bn-BD')}`,
      }))

      const newProductActivities = (products || []).map((product: any) => ({
        id: `product-${product.id}`,
        type: 'product',
        message: `Product "${product.name}" was added`,
        time: product.createdAt,
      }))

      const newCustomerActivities = (customers || []).map((customer: any) => ({
        id: `customer-${customer.id}`,
        type: 'customer',
        message: `Customer "${customer.name || 'New User'}" signed up`,
        time: customer.createdAt,
      }))

      const combined = [...newOrderActivities, ...newProductActivities, ...newCustomerActivities]
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        .slice(0, 10) // show more activities

      setRecentActivity(combined)
    }
  }, [orders, products, customers])

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

      // Set recent orders
      setRecentOrders(orders.slice(0, 5))
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
  if (productsLoading || ordersLoading || categoriesLoading || customersLoading) {
    return <DashboardSkeleton />
  }

  const shippedOrders = Array.isArray(orders) ? orders.filter((order: any) => order.status === 'SHIPPED').length : 0
  const deliveredOrders = Array.isArray(orders) ? orders.filter((order: any) => order.status === 'DELIVERED').length : 0

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'PROCESSING': return 'bg-amber-100 text-amber-800 border-amber-200'
      case 'SHIPPED': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'DELIVERED': return 'bg-green-100 text-green-800 border-green-200'
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'order': return <ShoppingCart className="h-4 w-4 text-amber-600" />
      case 'product': return <Package className="h-4 w-4 text-green-500" />
      case 'shipment': return <Truck className="h-4 w-4 text-purple-500" />
      case 'customer': return <Users className="h-4 w-4 text-orange-500" />
      case 'review': return <Star className="h-4 w-4 text-yellow-500" />
      default: return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6 max-w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here&apos;s what&apos;s happening with your store today.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Quick Stats Cards - Mobile Optimized */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {quickStats.map((stat, index) => (
          <Card key={index} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-xl sm:text-2xl font-bold mt-1">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    {stat.changeType === 'positive' ? (
                      <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 text-red-600 mr-1" />
                    )}
                    <span className={`text-xs font-medium ${
                      stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analytics Mini-Widgets */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="flex flex-col items-center justify-center p-3 bg-gradient-to-br from-primary/10 to-white rounded-xl border border-primary/20 shadow-sm">
          <TrendingUp className="h-5 w-5 text-primary mb-1" />
          <span className="text-lg font-bold">৳{todaysSales.toLocaleString('bn-BD')}</span>
          <span className="text-xs text-muted-foreground">Today&apos;s Sales</span>
        </div>
        <div className="flex flex-col items-center justify-center p-3 bg-gradient-to-br from-green-100 to-white rounded-xl border border-green-200 shadow-sm">
          <UserPlus className="h-5 w-5 text-green-600 mb-1" />
          <span className="text-lg font-bold">{newCustomers}</span>
          <span className="text-xs text-muted-foreground">New Customers</span>
        </div>
        <div className="flex flex-col items-center justify-center p-3 bg-gradient-to-br from-yellow-100 to-white rounded-xl border border-yellow-200 shadow-sm">
          <Clock className="h-5 w-5 text-yellow-600 mb-1" />
          <span className="text-lg font-bold">{pendingOrders}</span>
          <span className="text-xs text-muted-foreground">Pending Orders</span>
        </div>
        <div className="flex flex-col items-center justify-center p-3 bg-gradient-to-br from-red-100 to-white rounded-xl border border-red-200 shadow-sm">
          <PackageMinus className="h-5 w-5 text-red-600 mb-1" />
          <span className="text-xs text-muted-foreground">Low Stock</span>
          <span className="text-lg font-bold">{lowStockProducts}</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Charts */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="sales" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="sales">Sales Analytics</TabsTrigger>
              <TabsTrigger value="products">Product Analytics</TabsTrigger>
              <TabsTrigger value="orders">Order Status</TabsTrigger>
            </TabsList>

            <TabsContent value="sales">
              <Card>
                <CardHeader>
                  <CardTitle>Sales Overview</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] sm:h-[400px]">
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
                        stroke={THEME_COLORS.primary}
                        strokeWidth={2}
                        dot={{ r: 4, fill: THEME_COLORS.gold, stroke: THEME_COLORS.primary }}
                        activeDot={{ r: 8, fill: THEME_COLORS.primary }}
                        name="Sales"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="products">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Products by Category</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[250px] sm:h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={60}
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
                  <CardContent className="h-[250px] sm:h-[300px]">
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
                        <Bar dataKey="total" fill={THEME_COLORS.gold} name="Sales" />
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
                        <div className="w-24 sm:w-32 h-2 bg-gray-200 rounded-full mr-2">
                          <div
                            className="h-full bg-yellow-400 rounded-full"
                            style={{
                              width: `${(pendingOrders / totalOrders) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-yellow-600 text-sm">{pendingOrders}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="font-medium">Processing</span>
                      <div className="flex items-center">
                        <div className="w-24 sm:w-32 h-2 bg-gray-200 rounded-full mr-2">
                          <div
                            className="h-full bg-amber-400 rounded-full"
                            style={{
                              width: `${(processingOrders / totalOrders) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-amber-600 text-sm">{processingOrders}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="font-medium">Shipped</span>
                      <div className="flex items-center">
                        <div className="w-24 sm:w-32 h-2 bg-gray-200 rounded-full mr-2">
                          <div
                            className="h-full bg-purple-400 rounded-full"
                            style={{
                              width: `${(shippedOrders / totalOrders) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-purple-600 text-sm">{shippedOrders}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="font-medium">Delivered</span>
                      <div className="flex items-center">
                        <div className="w-24 sm:w-32 h-2 bg-gray-200 rounded-full mr-2">
                          <div
                            className="h-full bg-green-400 rounded-full"
                            style={{
                              width: `${(deliveredOrders / totalOrders) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-green-600 text-sm">{deliveredOrders}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Recent Activity & Orders */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.message}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-muted-foreground">{timeAgo(activity.time)}</span>
                        {activity.amount && (
                          <span className="text-xs font-medium text-green-600">{activity.amount}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <ListOrdered className="h-5 w-5" />
                  Recent Orders
                </span>
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {order.customer?.name?.charAt(0) || 'C'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">#{order.id}</p>
                        <p className="text-xs text-muted-foreground">{order.customer?.name || 'Customer'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">৳{order.total}</p>
                      <Badge className={`text-xs ${getStatusColor(order.status)}`}>
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 