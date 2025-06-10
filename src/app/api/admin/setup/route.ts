import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json()

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: {
        role: 'ADMIN',
      },
    })

    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Admin already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hash(password, 12)

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: 'ADMIN',
      },
    })

    // Remove password from response
    const { password: _, ...adminWithoutPassword } = admin

    return NextResponse.json(adminWithoutPassword)
  } catch (error) {
    console.error('Error creating admin:', error)
    return NextResponse.json(
      { error: 'Error creating admin' },
      { status: 500 }
    )
  }
} 