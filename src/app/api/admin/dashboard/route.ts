import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })
    
    if (!user?.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || '30d'

    // Calculate date range
    const now = new Date()
    let startDate = new Date()
    
    switch (range) {
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate.setDate(now.getDate() - 30)
    }

    // Fetch orders within date range
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: now,
        },
      },
      include: {
        customer: true,
        items: {
          include: {
            product: {
              include: {
                category: true
              }
            }
          }
        }
      }
    })

    // Fetch all-time data for some stats
    const [totalProducts, totalCustomers, allOrders] = await Promise.all([
      prisma.product.count(),
      prisma.customer.count(),
      prisma.order.findMany({
        include: {
          items: {
            include: {
              product: {
                include: {
                  category: true
                }
              }
            }
          }
        }
      })
    ])

    // Calculate basic stats
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
    const totalOrders = orders.length
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // Order status counts
    const pendingOrders = orders.filter(order => order.status === 'PENDING').length
    const confirmedOrders = orders.filter(order => order.status === 'CONFIRMED').length
    const shippedOrders = orders.filter(order => order.status === 'SHIPPED').length
    const deliveredOrders = orders.filter(order => order.status === 'DELIVERED').length

    // Generate daily sales data
    const salesByDate = new Map<string, { sales: number; orders: number }>()
    
    orders.forEach(order => {
      const date = order.createdAt.toISOString().split('T')[0]
      const existing = salesByDate.get(date) || { sales: 0, orders: 0 }
      salesByDate.set(date, {
        sales: existing.sales + order.total,
        orders: existing.orders + 1
      })
    })

    const salesData = Array.from(salesByDate.entries())
      .map(([date, data]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        sales: data.sales,
        orders: data.orders
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-14) // Last 14 days for better chart readability

    // Calculate top products
    const productSales = new Map<string, { name: string; revenue: number; quantity: number }>()
    
    allOrders.forEach(order => {
      order.items.forEach(item => {
        const existing = productSales.get(item.productId) || { 
          name: item.name, 
          revenue: 0, 
          quantity: 0 
        }
        productSales.set(item.productId, {
          name: item.name,
          revenue: existing.revenue + (item.price * item.quantity),
          quantity: existing.quantity + item.quantity
        })
      })
    })

    const topProducts = Array.from(productSales.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    // Calculate category sales
    const categorySales = new Map<string, number>()
    
    allOrders.forEach(order => {
      order.items.forEach(item => {
        const categoryName = item.product?.category?.name || 'Uncategorized'
        const existing = categorySales.get(categoryName) || 0
        categorySales.set(categoryName, existing + (item.price * item.quantity))
      })
    })

    const totalCategorySales = Array.from(categorySales.values()).reduce((sum, value) => sum + value, 0)
    
    const categoryData = Array.from(categorySales.entries())
      .map(([name, value]) => ({
        name,
        value,
        percentage: totalCategorySales > 0 ? Math.round((value / totalCategorySales) * 100) : 0
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6) // Top 6 categories

    const dashboardData = {
      stats: {
        totalRevenue,
        totalOrders,
        totalProducts,
        totalCustomers,
        averageOrderValue,
        pendingOrders,
        confirmedOrders,
        shippedOrders,
        deliveredOrders,
      },
      salesData,
      topProducts,
      categoryData,
    }

    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}