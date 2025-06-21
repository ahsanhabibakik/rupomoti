import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(coupons)
  } catch (error) {
    console.error('Error fetching coupons:', error)
    return NextResponse.json(
      { error: 'Failed to fetch coupons' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const json = await request.json()

    const coupon = await prisma.coupon.create({
      data: {
        code: json.code,
        type: json.type,
        value: json.value,
        minAmount: json.minAmount,
        maxAmount: json.maxAmount,
        startDate: new Date(json.startDate),
        endDate: new Date(json.endDate),
        usageLimit: json.usageLimit,
      }
    })

    return NextResponse.json(coupon)
  } catch (error) {
    console.error('Error creating coupon:', error)
    return NextResponse.json(
      { error: 'Failed to create coupon' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const json = await request.json()
    const { id, ...data } = json

    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
      }
    })

    return NextResponse.json(coupon)
  } catch (error) {
    console.error('Error updating coupon:', error)
    return NextResponse.json(
      { error: 'Failed to update coupon' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Coupon ID is required' },
        { status: 400 }
      )
    }

    await prisma.coupon.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting coupon:', error)
    return NextResponse.json(
      { error: 'Failed to delete coupon' },
      { status: 500 }
    )
  }
} 