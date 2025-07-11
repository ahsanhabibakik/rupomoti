import { NextResponse } from 'next/server'
import { auth } from '@/app/auth'
import mongoose from 'mongoose'
import Order from '@/models/Order'

export async function GET() {
  try {
    console.log('🧪 Simple Test API called')
    
    const session = await auth()
    
    console.log('Session data:', {
      hasSession: !!session,
      userId: session?.user?.id,
      email: session?.user?.email,
      isAdmin: session?.user?.isAdmin,
      role: session?.user?.role,
    })
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        error: 'No session',
        hasSession: false 
      }, { status: 401 })
    }
    
    // Connect to MongoDB
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI!)
    }
    
    // Get total orders without any filters
    const totalOrders = await Order.countDocuments()
    const activeOrders = await Order.countDocuments({ deletedAt: null })
    
    // Get first 3 orders
    const orders = await Order.find({}, {
      orderNumber: 1,
      status: 1,
      deletedAt: 1,
      isFakeOrder: 1,
      createdAt: 1
    })
      .limit(3)
      .sort({ createdAt: -1 })
    
    return NextResponse.json({
      success: true,
      session: {
        userId: session.user.id,
        email: session.user.email,
        isAdmin: session.user.isAdmin,
        role: session.user.role,
      },
      database: {
        totalOrders,
        activeOrders,
        sampleOrders: orders
      }
    })
    
  } catch (error) {
    console.error('Simple test API error:', error)
    return NextResponse.json({ 
      error: 'Internal error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
