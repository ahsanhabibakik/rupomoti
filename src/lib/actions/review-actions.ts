export const runtime = 'nodejs';

import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth-node'

export async function createReviewData({ productId, rating, comment, userId }) {
  // This function only creates the review in the database, no revalidation
  try {
    await prisma.review.create({
      data: {
        productId,
        userId,
        rating,
        comment,
      },
    })
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