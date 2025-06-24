import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    
    const where: any = {}

    if (q) {
      where.code = {
        contains: q,
        mode: 'insensitive',
      }
    }

    if (status) {
      where.isActive = status === 'ACTIVE'
    }

    if (type && type !== 'all') {
      where.type = type
    }
    
    const coupons = await prisma.coupon.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(coupons)
  } catch (error) {
    console.error('Error fetching coupons:', error)
    return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 })
  }
}

const couponSchema = z.object({
  code: z.string().min(1),
  type: z.enum(['percentage', 'fixed']),
  value: z.number(),
  minimumAmount: z.number().optional().nullable(),
  maximumDiscount: z.number().optional().nullable(),
  validFrom: z.string().datetime(),
  validUntil: z.string().datetime(),
  usageLimit: z.number().optional().nullable(),
  isActive: z.boolean().default(true),
})

export async function POST(request: Request) {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const json = await request.json()
    const data = couponSchema.parse({
      ...json,
      validFrom: new Date(json.validFrom).toISOString(),
      validUntil: new Date(json.validUntil).toISOString(),
    })

    const coupon = await prisma.coupon.create({ data })

    return NextResponse.json(coupon)
  } catch (error) {
    console.error('Error creating coupon:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 })
  }
}

const updateCouponSchema = couponSchema.extend({
  id: z.string(),
});

export async function PUT(request: Request) {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const json = await request.json()    
    const { id, ...dataToUpdate } = updateCouponSchema.parse({
      ...json,
      validFrom: new Date(json.validFrom).toISOString(),
      validUntil: new Date(json.validUntil).toISOString(),
    })
    
    const coupon = await prisma.coupon.update({
      where: { id },
      data: dataToUpdate,
    })

    return NextResponse.json(coupon)
  } catch (error) {
    console.error('Error updating coupon:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update coupon' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Coupon ID is required' }, { status: 400 })
    }

    await prisma.coupon.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting coupon:', error)
    return NextResponse.json({ error: 'Failed to delete coupon' }, { status: 500 })
  }
} 