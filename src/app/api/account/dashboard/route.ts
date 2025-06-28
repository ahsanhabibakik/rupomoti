import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user stats
    const [orderCount, wishlistCount, reviewCount, addressCount] = await Promise.all([
      prisma.order.count({
        where: { userId: session.user.id }
      }),
      prisma.wishlistItem.count({
        where: { userId: session.user.id }
      }),
      prisma.review.count({
        where: { userId: session.user.id }
      }),
      prisma.address.count({
        where: { userId: session.user.id }
      })
    ])

    // Get recent orders
    const recentOrders = await prisma.order.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        total: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 3
    })

    // Get recently added wishlist items
    const recentWishlistItems = await prisma.wishlistItem.findMany({
      where: { userId: session.user.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            images: true,
            price: true,
            salePrice: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 3
    })

    return NextResponse.json({
      stats: {
        orders: orderCount,
        wishlist: wishlistCount,
        reviews: reviewCount,
        addresses: addressCount
      },
      recentOrders,
      recentWishlistItems
    })
  } catch (error) {
    console.error('Error fetching account dashboard:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
