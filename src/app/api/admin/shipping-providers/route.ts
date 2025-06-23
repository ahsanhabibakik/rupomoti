import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const providerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  type: z.string().min(1, 'Type is required'),
  credentials: z.object({
    apiKey: z.string().min(1, 'API Key is required'),
    apiSecret: z.string().optional(),
    secretKey: z.string().optional(),
    storeId: z.string().optional(),
    webhookSecret: z.string().optional(),
  }),
  isActive: z.boolean(),
  averageDeliveryTime: z.number().optional(),
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const providers = await prisma.shippingProvider.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        type: true,
        credentials: true,
        isActive: true,
        averageDeliveryTime: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    // Remove sensitive data before sending to client
    const sanitizedProviders = providers.map(provider => ({
      ...provider,
      credentials: {
        ...provider.credentials,
        apiKey: '••••••••',
        apiSecret: provider.credentials.apiSecret ? '••••••••' : undefined,
        secretKey: provider.credentials.secretKey ? '••••••••' : undefined,
        webhookSecret: provider.credentials.webhookSecret ? '••••••••' : undefined,
      },
    }))

    return NextResponse.json({ providers: sanitizedProviders })
  } catch (error) {
    console.error('Error fetching shipping providers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch shipping providers' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = providerSchema.parse(body)

    const provider = await prisma.shippingProvider.create({
      data: {
        name: validatedData.name,
        code: validatedData.code,
        type: validatedData.type,
        credentials: validatedData.credentials,
        isActive: validatedData.isActive,
        averageDeliveryTime: validatedData.averageDeliveryTime || 0,
      },
    })

    // Remove sensitive data before sending response
    const { credentials, ...sanitizedProvider } = provider
    return NextResponse.json({
      provider: {
        ...sanitizedProvider,
        credentials: {
          ...credentials,
          apiKey: '••••••••',
          apiSecret: credentials.apiSecret ? '••••••••' : undefined,
          secretKey: credentials.secretKey ? '••••••••' : undefined,
          webhookSecret: credentials.webhookSecret ? '••••••••' : undefined,
        },
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Error creating shipping provider:', error)
    return NextResponse.json(
      { error: 'Failed to create shipping provider' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...data } = body
    const validatedData = providerSchema.parse(data)

    const provider = await prisma.shippingProvider.update({
      where: { id },
      data: {
        name: validatedData.name,
        code: validatedData.code,
        type: validatedData.type,
        credentials: validatedData.credentials,
        isActive: validatedData.isActive,
        averageDeliveryTime: validatedData.averageDeliveryTime || 0,
      },
    })

    // Remove sensitive data before sending response
    const { credentials, ...sanitizedProvider } = provider
    return NextResponse.json({
      provider: {
        ...sanitizedProvider,
        credentials: {
          ...credentials,
          apiKey: '••••••••',
          apiSecret: credentials.apiSecret ? '••••••••' : undefined,
          secretKey: credentials.secretKey ? '••••••••' : undefined,
          webhookSecret: credentials.webhookSecret ? '••••••••' : undefined,
        },
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Error updating shipping provider:', error)
    return NextResponse.json(
      { error: 'Failed to update shipping provider' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Provider ID is required' },
        { status: 400 }
      )
    }

    await prisma.shippingProvider.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting shipping provider:', error)
    return NextResponse.json(
      { error: 'Failed to delete shipping provider' },
      { status: 500 }
    )
  }
}
