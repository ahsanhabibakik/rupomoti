import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/auth'
import mongoose from 'mongoose'
import User from '@/models/User'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // Connect to MongoDB
    if (mongoose.connection.readyState !== 1) {
      const mongoUri = process.env.MONGODB_URI || process.env.MONGODB_URL
      if (!mongoUri) {
        throw new Error('MongoDB connection string not found')
      }
      await mongoose.connect(mongoUri)
    }

    const user = await User.findById(session.user.id).select('-password')
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    })
  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { name, phone } = await req.json()

    // Connect to MongoDB
    if (mongoose.connection.readyState !== 1) {
      const mongoUri = process.env.MONGODB_URI || process.env.MONGODB_URL
      if (!mongoUri) {
        throw new Error('MongoDB connection string not found')
      }
      await mongoose.connect(mongoUri)
    }

    const user = await User.findById(session.user.id)
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    // Update user data
    if (name) user.name = name.trim()
    if (phone) user.phone = phone.trim()

    await user.save()

    return NextResponse.json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isAdmin: user.isAdmin,
      updatedAt: user.updatedAt
    })
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
