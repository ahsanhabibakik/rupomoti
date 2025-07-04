import 'server-only'
import { prisma } from '@/lib/prisma'

export async function getProduct(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      reviews: {
        include: {
          user: {
            select: {
              name: true,
              image: true,
            }
          }
        }
      },
    },
  })

  if (!product) {
    return null
  }

  const reviewCount = product.reviews.length
  const averageRating = reviewCount > 0
    ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
    : 0

  return { ...product, reviewCount, averageRating }
}

export async function getRelatedProducts(productId: string, categoryId: string | null) {
  if (!categoryId) {
    return []
  }

  return prisma.product.findMany({
    where: {
      categoryId,
      id: {
        not: productId,
      },
    },
    include: {
      category: true,
    },
    take: 4,
  })
} 