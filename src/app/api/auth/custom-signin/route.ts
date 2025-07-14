import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getUserModel } from '@/models/User';
const User = getUserModel();
import dbConnect from '@/lib/mongoose'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    console.log('🔐 Custom signin attempt for:', email)

    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Email and password are required'
      }, { status: 400 })
    }

    // Connect to MongoDB
    await dbConnect()

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() })
    
    if (!user || !user.password) {
      return NextResponse.json({
        success: false,
        error: 'Invalid credentials'
      }, { status: 401 })
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    
    if (!isPasswordValid) {
      return NextResponse.json({
        success: false,
        error: 'Invalid credentials'
      }, { status: 401 })
    }

    console.log('✅ User authenticated successfully')

    // Return successful authentication result
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
    console.error('💥 Custom signin error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: (error as Error).message
    }, { status: 500 })
  }
}
