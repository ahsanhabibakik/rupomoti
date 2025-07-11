import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/auth'
import dbConnect from '@/lib/mongoose'
import WishlistItem from '@/models/WishlistItem'
import Product from '@/models/Product'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    console.log('🔍 Wishlist API - GET request started')
    
    const session = await auth()
    console.log('📝 Session:', { hasSession: !!session, userId: session?.user?.id })
    
    if (!session?.user?.id) {
      console.log('❌ Unauthorized access attempt')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔄 Fetching wishlist items for user:', session.user.id)
    
    await dbConnect()
    
    const wishlistItems = await WishlistItem.find({ userId: session.user.id })
      .populate({
        path: 'productId',
        select: 'name price images slug'
      })
      .sort({ createdAt: -1 })
      .lean()

    const transformedItems = wishlistItems.map(item => ({
      id: item._id.toString(),
      userId: item.userId,
      productId: item.productId._id.toString(),
      product: {
        id: item.productId._id.toString(),
        name: item.productId.name,
        price: item.productId.price,
        images: item.productId.images || [],
        slug: item.productId.slug
      },
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    }))

    console.log('✅ Wishlist items fetched:', transformedItems.length)
    return NextResponse.json(transformedItems)
  } catch (error) {
    console.error('❌ Error fetching wishlist:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch wishlist', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { productId } = await request.json()
    
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    await dbConnect()
    
    // Check if product exists
    const product = await Product.findById(productId)
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Check if already in wishlist
    const existingItem = await WishlistItem.findOne({
      userId: session.user.id,
      productId: productId
    })
    
    if (existingItem) {
      return NextResponse.json({ error: 'Product already in wishlist' }, { status: 400 })
    }

    // Add to wishlist
    const wishlistItem = await WishlistItem.create({
      userId: session.user.id,
      productId: productId
    })

    return NextResponse.json({
      message: 'Product added to wishlist',
      wishlistItem: {
        id: wishlistItem._id.toString(),
        userId: wishlistItem.userId,
        productId: wishlistItem.productId,
        createdAt: wishlistItem.createdAt,
        updatedAt: wishlistItem.updatedAt
      }
    })

  } catch (error) {
    console.error('Error adding to wishlist:', error)
    return NextResponse.json(
      { error: 'Failed to add to wishlist' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    await dbConnect()
    
    await WishlistItem.deleteOne({
      userId: session.user.id,
      productId: productId
    })

    return NextResponse.json({ message: 'Product removed from wishlist' })

  } catch (error) {
    console.error('Error removing from wishlist:', error)
    return NextResponse.json(
      { error: 'Failed to remove from wishlist' },
      { status: 500 }
    )
  }
}