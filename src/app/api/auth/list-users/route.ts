import { NextResponse } from 'next/server'
import User from '@/models/User'
import dbConnect from '@/lib/mongoose'

export async function GET() {
  try {
    console.log('📊 Listing all users in database...')
    
    // Connect to MongoDB
    await dbConnect()
    console.log('✅ MongoDB connected')

    // Get all users
    const users = await User.find({}, { 
      email: 1, 
      name: 1, 
      role: 1, 
      isAdmin: 1,
      createdAt: 1,
      password: 1  // Include to check if password exists
    }).lean()

    console.log(`Found ${users.length} users`)

    const userList = users.map(user => ({
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      isAdmin: user.isAdmin,
      hasPassword: !!user.password,
      createdAt: user.createdAt
    }))

    return NextResponse.json({
      success: true,
      count: users.length,
      users: userList
    })

  } catch (error) {
    console.error('💥 Error listing users:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: (error as Error).message
    }, { status: 500 })
  }
}
