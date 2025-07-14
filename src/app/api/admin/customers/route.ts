import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/auth'
import dbConnect from '@/lib/mongoose'
import User from '@/models/User'
import Order from '@/models/Order'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: Request) {
  try {
    const session = await auth()
    
    if (
      !session ||
      !session.user ||
      !['ADMIN', 'MANAGER', 'SUPER_ADMIN'].includes(session.user.role)
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const status = searchParams.get('status') || 'all'
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))
    const offset = (page - 1) * limit

    console.log('📊 Query params:', { search, status, from, to, page, limit })

    // Build query
    const query: any = {}
    
    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ]
    }

    // Status filter
    switch (status) {
      case 'verified':
        query.isVerified = true
        break
      case 'unverified':
        query.isVerified = false
        break
      case 'admin':
        query.role = { $in: ['ADMIN', 'SUPER_ADMIN', 'MANAGER'] }
        break
      case 'user':
        query.role = 'USER'
        break
    }

    // Date range filter
    if (from && to) {
      query.createdAt = {
        $gte: new Date(from),
        $lte: new Date(to)
      }
    }

    console.log('🔍 Query:', JSON.stringify(query, null, 2))

    // Execute parallel queries for better performance
    const [customers, totalCount] = await Promise.all([
      User.find(query)
        .select('-password') // Exclude password field
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .lean(),
      User.countDocuments(query)
    ])

    // Get order statistics for each customer
    const customersWithStats = await Promise.all(
      customers.map(async (customer: any) => {
        try {
          const orders = await Order.find({ userId: customer._id })
            .select('total status createdAt orderNumber')
            .sort({ createdAt: -1 })
            .limit(5)
            .lean()

          const allOrders = await Order.find({ userId: customer._id })
            .select('total')
            .lean()

          const totalSpent = allOrders.reduce((sum: number, order: any) => sum + (order.total || 0), 0)
          const totalOrders = allOrders.length
          const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0
          const lastOrderDate = orders.length > 0 ? orders[0].createdAt : null

          return {
            id: customer._id.toString(),
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            image: customer.image,
            role: customer.role || 'USER',
            isVerified: customer.isVerified || false,
            totalOrders,
            totalSpent,
            averageOrderValue,
            lastOrderDate,
            createdAt: customer.createdAt,
            updatedAt: customer.updatedAt,
            recentOrders: orders
          }
        } catch (error) {
          console.error('Error processing customer stats:', error)
          return {
            id: customer._id.toString(),
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            image: customer.image,
            role: customer.role || 'USER',
            isVerified: customer.isVerified || false,
            totalOrders: 0,
            totalSpent: 0,
            averageOrderValue: 0,
            lastOrderDate: null,
            createdAt: customer.createdAt,
            updatedAt: customer.updatedAt,
            recentOrders: []
          }
        }
      })
    )

    // Filter VIP customers if requested
    let filteredCustomers = customersWithStats
    if (status === 'vip') {
      filteredCustomers = customersWithStats.filter((c: any) => c.totalSpent > 50000) // VIP threshold
    }

    const totalPages = Math.ceil(totalCount / limit)

    console.log(`✅ Returning ${filteredCustomers.length} customers (page ${page}/${totalPages})`)

    return NextResponse.json({
      customers: filteredCustomers,
      total: totalCount,
      page,
      totalPages,
      limit
    })
  } catch (error) {
    console.error('❌ Failed to fetch customers:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch customers',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}