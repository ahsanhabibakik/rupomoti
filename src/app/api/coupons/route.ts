import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import { auth } from '@/lib/auth-node'
import { z } from 'zod'
import Coupon from '@/models/Coupon'

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q')
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    
    const where: Record<string, unknown> = {}

    if (q) {
      where.code = {
        $regex: q,
        $options: 'i',
      }
    }

    if (status) {
      where.isActive = status === 'ACTIVE'
    }

    if (type && type !== 'all') {
      where.type = type
    }
    
    const coupons = await Coupon.find(where).sort({ createdAt: -1 })

    return NextResponse.json(coupons)
  } catch (error) {
    console.error('Error fetching coupons:', error)
    return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 })
  }
}

const couponSchema = z.object({
  code: z.string().min(1),
  type: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']),
  value: z.coerce.number(),
  minimumAmount: z.coerce.number().optional().nullable(),
  maximumDiscount: z.coerce.number().optional().nullable(),
  validFrom: z.string().datetime(),
  validUntil: z.string().datetime(),
  usageLimit: z.coerce.number().optional().nullable(),
  isActive: z.boolean().default(true),
})

export async function POST(req: Request) {
  try {
    await connectDB();
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const json = await req.json()
    
    // Transform empty strings for optional fields to null for Mongoose
    const transformedJson = {
      ...json,
      type: json.type === 'percentage' ? 'PERCENTAGE' : json.type === 'fixed' ? 'FIXED_AMOUNT' : json.type,
      minimumAmount: json.minimumAmount || null,
      maximumDiscount: json.maximumDiscount || null,
      usageLimit: json.usageLimit || null,
    };

    const data = couponSchema.parse({
      ...transformedJson,
      validFrom: new Date(transformedJson.validFrom).toISOString(),
      validUntil: new Date(transformedJson.validUntil).toISOString(),
    })

    const coupon = await Coupon.create(data)

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

export async function PUT(req: Request) {
  try {
    await connectDB();
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const json = await req.json()    
    const { id, ...dataToUpdate } = updateCouponSchema.parse({
      ...json,
      type: json.type === 'percentage' ? 'PERCENTAGE' : json.type === 'fixed' ? 'FIXED_AMOUNT' : json.type,
      minimumAmount: json.minimumAmount || null,
      maximumDiscount: json.maximumDiscount || null,
      usageLimit: json.usageLimit || null,
      validFrom: new Date(json.validFrom).toISOString(),
      validUntil: new Date(json.validUntil).toISOString(),
    })
    
    const coupon = await Coupon.findByIdAndUpdate(id, dataToUpdate, { new: true })

    return NextResponse.json(coupon)
  } catch (error) {
    console.error('Error updating coupon:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update coupon' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    await connectDB();
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Coupon ID is required' }, { status: 400 })
    }

    await Coupon.findByIdAndDelete(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting coupon:', error)
    return NextResponse.json({ error: 'Failed to delete coupon' }, { status: 500 })
  }
} 