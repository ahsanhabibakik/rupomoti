'use server'

import { PrismaClient, Category } from '@prisma/client'

const prisma = new PrismaClient()

interface GetCategoriesParams {
  level?: number
  active?: boolean
  parent?: string | null
}

export async function getCategories(params: GetCategoriesParams): Promise<Category[]> {
  try {
    const categories = await prisma.category.findMany({
      where: {
        isActive: params.active,
        parentId: params.parent,
      },
      orderBy: {
        sortOrder: 'asc',
      },
    })
    return categories
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
} 