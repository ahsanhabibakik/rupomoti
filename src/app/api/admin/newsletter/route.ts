import { auth } from '@/app/auth';
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthSession } from '@/lib/auth'
import { z } from 'zod'

export async function GET(request: Request) {
  const session = await auth()

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const subscriptions = await prisma.newsletterSubscription.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        tags: true,
      },
    })
    return NextResponse.json(subscriptions)
  } catch (error) {
    console.error('Failed to fetch newsletter subscribers:', error)
    return NextResponse.json(
      { message: 'An unexpected error occurred.' },
      { status: 500 }
    )
  }
}

const createSubscriberSchema = z.object({
  email: z.string().email(),
  tagIds: z.array(z.string()),
})

export async function POST(request: Request) {
  const session = await auth()

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const validation = createSubscriberSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(validation.error.flatten(), { status: 400 })
    }
    
    const { email, tagIds } = validation.data
    
    const newSubscriber = await prisma.newsletterSubscription.create({
      data: {
        email,
        tags: {
          connect: tagIds.map((id) => ({ id })),
        },
      },
      include: {
        tags: true
      }
    })

    return NextResponse.json(newSubscriber, { status: 201 })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ message: 'A subscriber with this email already exists.' }, { status: 409 })
    }
    console.error('Failed to create subscriber:', error)
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 })
  }
} 