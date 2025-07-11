import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import User from '@/models/User'
import dbConnect from '@/lib/mongoose'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    console.log('🔍 Testing database authentication...')
    console.log('Email:', email)

    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Email and password are required'
      }, { status: 400 })
    }

    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...')
    await dbConnect()
    console.log('✅ MongoDB connected')

    // Find user by email
    console.log('👤 Finding user by email...')
    const user = await User.findOne({ email: email.toLowerCase() })
    
    if (!user) {
      console.log('❌ User not found')
      return NextResponse.json({
        success: false,
        error: 'User not found',
        details: 'No user exists with this email address'
      }, { status: 404 })
    }

    console.log('✅ User found:', {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      hasPassword: !!user.password
    })

    if (!user.password) {
      console.log('❌ User has no password set')
      return NextResponse.json({
        success: false,
        error: 'Invalid account setup',
        details: 'User account has no password set'
      }, { status: 400 })
    }

    // Verify password
    console.log('🔐 Verifying password...')
    const isPasswordValid = await bcrypt.compare(password, user.password)
    
    if (!isPasswordValid) {
      console.log('❌ Password verification failed')
      return NextResponse.json({
        success: false,
        error: 'Invalid credentials',
        details: 'Password does not match'
      }, { status: 401 })
    }

    console.log('✅ Password verified successfully')

    return NextResponse.json({
      success: true,
      message: 'Authentication successful',
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name || user.email.split('@')[0],
        role: user.role,
        isAdmin: user.isAdmin
      }
    })

  } catch (error) {
    console.error('💥 Database test error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: (error as Error).message
    }, { status: 500 })
  }
}
