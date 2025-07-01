'use client'

export const dynamic = 'force-dynamic';

import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useProducts } from '@/hooks/useProducts'
import { useOrders } from '@/hooks/useOrders'
import { useCategories } from '@/hooks/useCategories'
import { useCustomers } from '@/hooks/useCustomers'
import { useOrderStatistics } from '@/hooks/useOrderStatistics'
import { useSession } from 'next-auth/react'
import { StockManagement } from '@/components/admin/StockManagement'
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
  AreaChart,
  Area,
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
  Flag,
  Bell,
  Settings,
  BarChart3,
  PieChart as PieChartIcon,
  Zap,
  Target,
  Shield,
  Crown,
  Sparkles,
  TrendingDown,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { getOrderAnalyticalInfo } from '@/lib/utils/order-number'
import SafeSuperAdminThemeManager from '@/components/admin/SafeSuperAdminThemeManager'

const THEME_COLORS = {
  primary: 'var(--color-primary)',
  gold: 'var(--color-secondary)',
  accent: 'var(--color-accent)',
  taupe: '#8C7760',
  rose: '#D7AFA4',
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  danger: 'var(--color-danger)',
  info: 'var(--color-info)',
  purple: 'var(--color-purple)',
  indigo: '#6366F1',
  pink: '#EC4899',
}

const COLORS = Object.values(THEME_COLORS);

function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-3 sm:p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-9" />
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-4">
          <Skeleton className="h-96 rounded-lg" />
          <Skeleton className="h-80 rounded-lg" />
        </div>
        <div className="lg:col-span-4 space-y-4">
          <Skeleton className="h-80 rounded-lg" />
          <Skeleton className="h-80 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

// Custom hook for client-side time calculations to avoid hydration issues
function useClientTime() {
  const [clientTime, setClientTime] = useState<Date | null>(null)
  
  useEffect(() => {
    setClientTime(new Date())
    const interval = setInterval(() => setClientTime(new Date()), 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])
  
  return clientTime
}

// Time calculation utilities that work on client-side only
function useTimeAgo() {
  const clientTime = useClientTime()
  
  const timeAgo = (dateString: string) => {
    if (!clientTime) return '...'
    
    const date = new Date(dateString)
    const now = clientTime
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
  
  return timeAgo
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const { data: products, isLoading: productsLoading } = useProducts()
  const { data: orders, isLoading: ordersLoading } = useOrders()
  const { data: orderStats, isLoading: orderStatsLoading } = useOrderStatistics()
  const { categories, isLoading: categoriesLoading } = useCategories()
  const { customers, loading: customersLoading } = useCustomers('')
  
  const [salesData, setSalesData] = useState<any[]>([])
  const [monthlyData, setMonthlyData] = useState<any[]>([])
  const [categoryData, setCategoryData] = useState<any[]>([])
  const [topProducts, setTopProducts] = useState<any[]>([])
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [topCustomers, setTopCustomers] = useState<any[]>([])
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('overview')
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  const timeAgo = useTimeAgo()
  const clientTime = useClientTime()

  // Role-based permissions
  const userRole = session?.user?.role
  const isSuperAdmin = userRole === 'SUPER_ADMIN'
  const isAdmin = userRole === 'ADMIN'
  const isManager = userRole === 'MANAGER'
  const hasFullAccess = isSuperAdmin || isAdmin
  
  // Analytics calculations with proper client-side handling
  const analytics = useMemo(() => {
    if (!clientTime || !orderStats) return null
    
    const today = new Date(clientTime)
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000)
    const thisWeekStart = new Date(todayStart.getTime() - (today.getDay() * 24 * 60 * 60 * 1000))
    const lastWeekStart = new Date(thisWeekStart.getTime() - (7 * 24 * 60 * 60 * 1000))
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    
    return {
      todaysSales: orderStats?.revenueToday || 0,
      yesterdaysSales: orderStats?.revenueYesterday || 0,
      thisWeekSales: orderStats?.revenueThisWeek || 0,
      lastWeekSales: orderStats?.revenueLastWeek || 0,
      thisMonthSales: orderStats?.revenueThisMonth || 0,
      lastMonthSales: orderStats?.revenueLastMonth || 0,
      salesGrowthToday: orderStats?.revenueYesterday ? 
        (((orderStats.revenueToday - orderStats.revenueYesterday) / orderStats.revenueYesterday) * 100).toFixed(1) : '0',
      salesGrowthWeekly: orderStats?.revenueLastWeek ? 
        (((orderStats?.revenueThisWeek || 0) - orderStats.revenueLastWeek) / orderStats.revenueLastWeek * 100).toFixed(1) : '0',
      salesGrowthMonthly: orderStats?.revenueLastMonth ? 
        (((orderStats?.revenueThisMonth || 0) - orderStats.revenueLastMonth) / orderStats.revenueLastMonth * 100).toFixed(1) : '0',
      newCustomersToday: Array.isArray(customers) ? customers.filter((c: any) => {
        const createdAt = new Date(c.createdAt)
        return createdAt >= todayStart
      }).length : 0,
      conversionRate: orderStats?.total && orderStats.total > 0 && Array.isArray(customers) ? 
        ((orderStats.total / customers.length) * 100).toFixed(1) : '0',
      averageOrderValue: orderStats?.total && orderStats.total > 0 ? 
        (orderStats.revenue / orderStats.total).toFixed(0) : '0',
    }
  }, [clientTime, orderStats, customers])

  // Main statistics for cards
  const getMainStats = () => {
    if (!analytics) return []
    
    const stats = [
      {
        title: 'Total Revenue',
        value: `৳${Math.round(orderStats?.revenue || 0).toLocaleString('bn-BD')}`,
        change: `${analytics.salesGrowthMonthly}%`,
        changeType: parseFloat(String(analytics.salesGrowthMonthly)) >= 0 ? 'positive' : 'negative',
        icon: DollarSign,
        gradient: 'from-emerald-500 to-teal-600',
        description: 'This month vs last month',
        visible: true
      },
      {
        title: 'Total Orders',
        value: (orderStats?.total || 0).toLocaleString('bn-BD'),
        change: (orderStats?.newToday || 0) > 0 ? `+${orderStats?.newToday} today` : 'No new orders today',
        changeType: (orderStats?.newToday || 0) > 0 ? 'positive' : 'neutral',
        icon: ShoppingCart,
        gradient: 'from-blue-500 to-cyan-600',
        description: 'New orders today',
        visible: true
      },
      {
        title: 'Total Customers',
        value: Array.isArray(customers) ? customers.length.toLocaleString('bn-BD') : '0',
        change: analytics.newCustomersToday > 0 ? `+${analytics.newCustomersToday} today` : 'No new customers',
        changeType: analytics.newCustomersToday > 0 ? 'positive' : 'neutral',
        icon: Users,
        gradient: 'from-purple-500 to-indigo-600',
        description: 'New customers today',
        visible: hasFullAccess
      },
      {
        title: 'Products',
        value: Array.isArray(products) ? products.length.toLocaleString('bn-BD') : '0',
        change: Array.isArray(products) ? `${products.filter((p: any) => p.stock > 0 && p.stock < 10).length} low stock` : '0 low stock',
        changeType: Array.isArray(products) && products.filter((p: any) => p.stock > 0 && p.stock < 10).length > 0 ? 'warning' : 'neutral',
        icon: Package,
        gradient: 'from-orange-500 to-red-600',
        description: 'Products with low stock',
        visible: true
      }
    ]
    
    return stats.filter(stat => stat.visible)
  }

  // Quick stats for smaller cards
  const getQuickStats = () => {
    if (!orderStats) return []
    
    return [
      {
        title: 'Pending',
        value: orderStats.pending,
        icon: Clock,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        href: '/admin/orders?status=PENDING'
      },
      {
        title: 'Processing',
        value: orderStats.processing,
        icon: Activity,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        href: '/admin/orders?status=PROCESSING'
      },
      {
        title: 'Shipped',
        value: orderStats.shipped,
        icon: Truck,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        href: '/admin/orders?status=SHIPPED'
      },
      {
        title: 'Delivered',
        value: orderStats.delivered,
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        href: '/admin/orders?status=DELIVERED'
      },
      {
        title: 'Fake Orders',
        value: orderStats.fake,
        icon: Flag,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        href: '/admin/orders?tab=fake',
        visible: hasFullAccess
      },
      {
        title: 'Avg. Order',
        value: `৳${analytics?.averageOrderValue || 0}`,
        icon: Target,
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50',
        borderColor: 'border-indigo-200'
      }
    ].filter(stat => stat.visible !== false)
  }

  // Quick actions based on role
  const getQuickActions = () => {
    const actions = [
      {
        title: 'Add Product',
        href: '/admin/products/new',
        icon: Plus,
        color: 'hover:bg-blue-50 hover:text-blue-600',
        visible: hasFullAccess
      },
      {
        title: 'View Orders',
        href: '/admin/orders',
        icon: ListOrdered,
        color: 'hover:bg-green-50 hover:text-green-600',
        visible: true
      },
      {
        title: 'Customers',
        href: '/admin/customers',
        icon: Users,
        color: 'hover:bg-purple-50 hover:text-purple-600',
        visible: hasFullAccess
      },
      {
        title: 'Analytics',
        href: '/admin/analytics',
        icon: BarChart3,
        color: 'hover:bg-orange-50 hover:text-orange-600',
        visible: hasFullAccess
      },
      {
        title: 'Categories',
        href: '/admin/categories',
        icon: Package,
        color: 'hover:bg-teal-50 hover:text-teal-600',
        visible: hasFullAccess
      },
      {
        title: 'Settings',
        href: '/admin/settings',
        icon: Settings,
        color: 'hover:bg-gray-50 hover:text-gray-600',
        visible: isSuperAdmin
      }
    ]
    
    return actions.filter(action => action.visible)
  }

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      // Force refetch of all data
      window.location.reload()
    } finally {
      setTimeout(() => setIsRefreshing(false), 1000)
    }
  }

  // Data processing effects - Fixed to prevent infinite re-renders
  useEffect(() => {
    if (orders && Array.isArray(orders) && clientTime) {
      // Daily sales data for the last 7 days
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(clientTime)
        date.setDate(date.getDate() - (6 - i))
        return date.toDateString()
      })

      const salesByDate = orders.reduce((acc: any, order: any) => {
        const orderDate = new Date(order.createdAt).toDateString()
        if (last7Days.includes(orderDate)) {
          acc[orderDate] = (acc[orderDate] || 0) + order.total
        }
        return acc
      }, {})

      const chartData = last7Days.map(date => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        total: salesByDate[date] || 0,
        orders: orders.filter((o: any) => 
          new Date(o.createdAt).toDateString() === date
        ).length
      }))

      setSalesData(chartData)

      // Monthly data for the last 6 months
      const last6Months = Array.from({ length: 6 }, (_, i) => {
        const date = new Date(clientTime)
        date.setMonth(date.getMonth() - (5 - i))
        return { year: date.getFullYear(), month: date.getMonth() }
      })

      const salesByMonth = orders.reduce((acc: any, order: any) => {
        const orderDate = new Date(order.createdAt)
        const monthKey = `${orderDate.getFullYear()}-${orderDate.getMonth()}`
        acc[monthKey] = (acc[monthKey] || 0) + order.total
        return acc
      }, {})

      const monthlyChartData = last6Months.map(({ year, month }) => {
        const monthKey = `${year}-${month}`
        const date = new Date(year, month)
        return {
          month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
          total: salesByMonth[monthKey] || 0,
          orders: orders.filter((o: any) => {
            const orderDate = new Date(o.createdAt)
            return orderDate.getFullYear() === year && orderDate.getMonth() === month
          }).length
        }
      })

      setMonthlyData(monthlyChartData)

      // Top products
      const productSales = orders.reduce((acc: any, order: any) => {
        order.items?.forEach((item: any) => {
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
          .slice(0, 10)
      )

      // Recent orders
      setRecentOrders(orders.slice(0, 10))
      
      // Recent activity - Fixed to avoid function calls in dependency
      const orderActivities = orders.slice(0, 10).map((order: any, index) => ({
        id: `order-${order.id}`,
        type: 'order',
        message: `New order #${order.id.slice(-8).toUpperCase()} placed`,
        time: order.createdAt,
        amount: `৳${order.total.toLocaleString('bn-BD')}`,
        user: order.customer?.name || 'Guest',
        icon: ShoppingCart,
        color: 'text-blue-600'
      }))
      
      setRecentActivity(orderActivities)
    }
  }, [orders, clientTime]) // Removed getOrderAnalyticalInfo from dependencies

  useEffect(() => {
    if (Array.isArray(customers) && orders && Array.isArray(orders)) {
      // Top customers by total orders
      const customerOrders = orders.reduce((acc: any, order: any) => {
        const customerId = order.customer?.id
        if (customerId) {
          if (!acc[customerId]) {
            acc[customerId] = {
              customer: order.customer,
              totalSpent: 0,
              orderCount: 0,
            }
          }
          acc[customerId].totalSpent += order.total
          acc[customerId].orderCount += 1
        }
        return acc
      }, {})

      setTopCustomers(
        Object.values(customerOrders)
          .sort((a: any, b: any) => b.totalSpent - a.totalSpent)
          .slice(0, 10)
      )
    }
  }, [customers, orders])

  useEffect(() => {
    if (Array.isArray(products)) {
      setLowStockProducts(
        products
          .filter((p: any) => p.stock > 0 && p.stock < 10)
          .sort((a: any, b: any) => a.stock - b.stock)
          .slice(0, 10)
      )
    }
  }, [products])

  useEffect(() => {
    if (Array.isArray(categories) && Array.isArray(products)) {
      const data = categories.map((category: any) => ({
        name: category.name,
        value: products.filter((p: any) => p.categoryId === category.id).length,
        fill: COLORS[Math.floor(Math.random() * COLORS.length)]
      })).filter(item => item.value > 0)
      setCategoryData(data)
    }
  }, [products, categories])

  // Show loading state if any critical data is still loading
  if (productsLoading || ordersLoading || orderStatsLoading || customersLoading || !clientTime || !analytics) {
    return <DashboardSkeleton />
  }

  const mainStats = getMainStats()
  const quickStats = getQuickStats()
  const quickActions = getQuickActions()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-3 sm:p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                Dashboard
              </h1>
              {isSuperAdmin && (
                <Badge variant="secondary" className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
                  <Crown className="h-3 w-3 mr-1" />
                  Super Admin
                </Badge>
              )}
              {isAdmin && !isSuperAdmin && (
                <Badge variant="secondary" className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
                  <Shield className="h-3 w-3 mr-1" />
                  Admin
                </Badge>
              )}
              {isManager && (
                <Badge variant="secondary" className="bg-gradient-to-r from-green-500 to-teal-600 text-white border-0">
                  <Activity className="h-3 w-3 mr-1" />
                  Manager
                </Badge>
              )}
            </div>
            <p className="text-gray-600 text-sm sm:text-base">
              Welcome back, {session?.user?.name || 'Admin'}! Here&apos;s your store overview.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-9 text-xs sm:text-sm"
              onClick={() => window.print()}
            >
              <Download className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Export
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-9 text-xs sm:text-sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" className="h-9 px-2">
              <Bell className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>
      </div>
  
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {mainStats.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 group">
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5 group-hover:opacity-10 transition-opacity`} />
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-lg sm:text-2xl font-bold text-foreground mb-2">{stat.value}</p>
                  <div className="flex items-center flex-wrap gap-1">
                    {stat.changeType === 'positive' ? (
                      <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                    ) : stat.changeType === 'negative' ? (
                      <ArrowDownRight className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
                    ) : stat.changeType === 'warning' ? (
                      <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600" />
                    ) : (
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                    )}
                    <span className={`text-xs sm:text-sm font-medium ${
                      stat.changeType === 'positive' ? 'text-green-600' : 
                      stat.changeType === 'negative' ? 'text-red-600' : 
                      stat.changeType === 'warning' ? 'text-orange-600' : 'text-gray-600'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                </div>
                <div className={`p-2 sm:p-3 rounded-xl bg-gradient-to-br ${stat.gradient} text-white`}>
                  <stat.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 lg:grid-cols-6 mb-6">
        {quickStats.map((stat, index) => (
          <Card 
            key={index} 
            className={`relative overflow-hidden border cursor-pointer hover:shadow-md transition-all duration-200 ${stat.href ? 'hover:scale-105' : ''}`}
            onClick={() => stat.href && (window.location.href = stat.href)}
          >
            <div className={`absolute inset-0 ${stat.bgColor} opacity-50`} />
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className={`p-2 rounded-lg ${stat.bgColor} ${stat.borderColor} border`}>
                  <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color}`} />
                </div>
                <div className="space-y-1">
                  <div className={`text-lg sm:text-2xl font-bold ${stat.color}`}>
                    {typeof stat.value === 'number' ? stat.value.toLocaleString('bn-BD') : stat.value}
                  </div>
                  <div className="text-xs sm:text-sm font-medium text-gray-700">{stat.title}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="mb-6 border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {quickActions.map((action, index) => (
              <a
                key={index}
                href={action.href}
                className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200 group bg-white ${action.color}`}
              >
                <action.icon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600 group-hover:scale-110 mb-2 transition-all" />
                <span className="text-xs sm:text-sm font-medium text-foreground text-center group-hover:font-semibold transition-all">
                  {action.title}
                </span>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 h-auto p-1">
          <TabsTrigger value="overview" className="flex items-center gap-1 sm:gap-2 py-2 text-xs sm:text-sm">
            <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-1 sm:gap-2 py-2 text-xs sm:text-sm">
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="stock" className="flex items-center gap-1 sm:gap-2 py-2 text-xs sm:text-sm">
            <Package className="h-3 w-3 sm:h-4 sm:w-4" />
            Stock
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-1 sm:gap-2 py-2 text-xs sm:text-sm">
            <ListOrdered className="h-3 w-3 sm:h-4 sm:w-4" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-1 sm:gap-2 py-2 text-xs sm:text-sm">
            <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
            Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Sales Trend Chart */}
            <Card className="lg:col-span-8 border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  Sales Trend (Last 7 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-60 sm:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={salesData}>
                      <defs>
                        <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={THEME_COLORS.primary} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={THEME_COLORS.primary} stopOpacity={0.05}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis 
                        tick={{ fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `৳${(value / 1000).toFixed(0)}k`}
                      />
                      <Tooltip 
                        formatter={(value: number) => [`৳${value.toLocaleString()}`, 'Sales']}
                        labelStyle={{ color: '#666', fontSize: '12px' }}
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                          fontSize: '12px'
                        }}
                      />
                      <Area 
                        type="monotone"
                        dataKey="total"
                        stroke={THEME_COLORS.primary}
                        fill="url(#salesGradient)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card className="lg:col-span-4 border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-green-500" />
                  Recent Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentOrders.slice(0, 5).map((order: any) => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">#{order.orderNumber || order.id.slice(-8).toUpperCase()}</p>
                        <p className="text-xs text-gray-600">{order.customer?.name || 'Guest'}</p>
                        <p className="text-xs text-gray-500">{timeAgo(order.createdAt)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm">৳{order.total.toLocaleString('bn-BD')}</p>
                        <Badge variant="outline" className="text-xs">
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Monthly Sales Chart */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg font-semibold">Monthly Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={(value) => `৳${(value / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(value: number) => [`৳${value.toLocaleString()}`, 'Sales']} />
                      <Bar dataKey="total" fill={THEME_COLORS.primary} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Category Distribution */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg font-semibold">Product Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="stock" className="space-y-6">
          <StockManagement />
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          {/* Recent Activity */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-500" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                    <div className="p-2 rounded-full bg-white">
                      <activity.icon className={`h-4 w-4 ${activity.color}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.message}</p>
                      <p className="text-xs text-gray-600">by {activity.user}</p>
                      <p className="text-xs text-gray-500">{timeAgo(activity.time)}</p>
                    </div>
                    {activity.amount && (
                      <div className="text-sm font-semibold text-green-600">
                        {activity.amount}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {/* Top Products */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Top Selling Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.map((product: any, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-gray-600">{product.quantity} sold</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">৳{Math.round(product.total).toLocaleString('bn-BD')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Super Admin Theme Manager */}
          {isSuperAdmin && (
            <SafeSuperAdminThemeManager />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
