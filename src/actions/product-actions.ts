'use server'

import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'

export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
    },
  })

  if (!product) {
    notFound()
  }

  return product
}

export async function getRelatedProducts(categoryId: string, currentProductId: string) {
  return await prisma.product.findMany({
    where: {
      categoryId,
      id: { not: currentProductId },
      status: 'PUBLISHED',
    },
    take: 4,
    include: {
      category: true,
    },
  })
}

export async function getProductReviews(productId: string) {
  return await prisma.review.findMany({
    where: { productId },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}
