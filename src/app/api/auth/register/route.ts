import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import User from '@/models/User'

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json()

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Connect to MongoDB
    if (mongoose.connection.readyState !== 1) {
      const mongoUri = process.env.MONGODB_URI || process.env.MONGODB_URL
      if (!mongoUri) {
        throw new Error('MongoDB connection string not found')
      }
      await mongoose.connect(mongoUri)
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists with this email' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: 'USER',
      isAdmin: false
    })

    await user.save()

    return NextResponse.json(
      { 
        message: 'User created successfully',
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
