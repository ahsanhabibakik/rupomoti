
import { NextResponse } from 'next/server'


import { getAuthSession } from '@/lib/auth'
import { z } from 'zod'

export async function GET(req: Request) {
  try {
    await connectDB();
    const session = await auth()
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    const tags = await prisma.newsletterTag.findMany({
      orderBy: { name: 'asc' },
    })
    return NextResponse.json(tags)
  } catch (error) {
    console.error('Failed to fetch newsletter tags:', error)
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 })
  }
}

const createTagSchema = z.object({
  name: z.string().min(1, 'Tag name cannot be empty.'),
})

export async function POST(req: Request) {
  try {
    await connectDB();
    const session = await auth()
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    const body = await request.json()
    const validation = createTagSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ message: validation.error.message }, { status: 400 })
    }
    const { name } = validation.data
    try {
      const newTag = await prisma.newsletterTag.create({
        data: { name },
      })
      return NextResponse.json(newTag, { status: 201 })
    } catch (error: any) {
      if (error.code === 'P2002') {
        return NextResponse.json({ message: 'A tag with this name already exists.' }, { status: 409 })
      }
      throw error;
    }
  } catch (error) {
    console.error('Failed to create newsletter tag:', error)
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 })
  }
} 