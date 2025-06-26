import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthSession } from '@/lib/auth'
import { z } from 'zod'

export async function GET(request: Request) {
  const session = await getAuthSession()
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  try {
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

export async function POST(request: Request) {
  const session = await getAuthSession()
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const validation = createTagSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ message: validation.error.message }, { status: 400 })
    }

    const { name } = validation.data
    const newTag = await prisma.newsletterTag.create({
      data: { name },
    })
    return NextResponse.json(newTag, { status: 201 })
  } catch (error: any) {
    if (error.code === 'P2002') {
        return NextResponse.json({ message: 'A tag with this name already exists.' }, { status: 409 })
    }
    console.error('Failed to create newsletter tag:', error)
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 })
  }
} 