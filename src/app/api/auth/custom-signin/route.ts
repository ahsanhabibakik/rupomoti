import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import User from '@/models/User'
import dbConnect from '@/lib/mongoose'
import { signIn } from '@/app/auth'

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

    // Try to use NextAuth's signIn with a custom redirect approach
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      return NextResponse.json({
        success: true,
        message: 'Authentication successful',
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name || user.email.split('@')[0],
          role: user.role,
          isAdmin: user.isAdmin
        },
        nextAuthResult: result
      })

    } catch (signInError) {
      console.log('NextAuth signIn failed, but user is valid:', signInError)
      
      // Return success anyway since we verified the user
      return NextResponse.json({
        success: true,
        message: 'User verified, but NextAuth signIn failed',
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name || user.email.split('@')[0],
          role: user.role,
          isAdmin: user.isAdmin
        },
        nextAuthError: (signInError as Error).message
      })
    }

  } catch (error) {
    console.error('💥 Custom signin error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: (error as Error).message
    }, { status: 500 })
  }
}
