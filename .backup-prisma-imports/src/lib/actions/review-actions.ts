'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { auth } from '@/app/auth'

export async function createReview(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: 'Unauthorized' }
  }

  const productId = formData.get('productId') as string
  const rating = parseInt(formData.get('rating') as string, 10)
  const comment = formData.get('comment') as string

  if (!productId || !rating || !comment) {
    return { error: 'Missing required fields' }
  }

  try {
    await prisma.review.create({
      data: {
        productId,
        userId: session.user.id,
        rating,
        comment,
      },
    })
    revalidatePath(`/products/${formData.get('productSlug')}`)
    return { success: true }
  } catch (error) {
    console.error('Error creating review:', error)
    return { error: 'Failed to submit review' }
  }
}

export async function getReviewsForProduct(productId: string) {
  return prisma.review.findMany({
    where: { productId },
    include: {
      user: {
        select: {
          name: true,
          image: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
} 