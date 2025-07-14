'use server'

import { Category } from '@prisma/client'
import { prisma, withRetry } from '@/lib/prisma'
import { fallbackCategories } from '@/lib/fallback-data'

interface GetCategoriesParams {
  level?: number
  active?: boolean
  parent?: string | null
}

export async function getCategories(params: GetCategoriesParams = {}): Promise<Category[]> {
  try {
    return await withRetry(async () => {
      const where: any = {}
      
      if (params.active !== undefined) {
        where.isActive = params.active
      }
      
      // If we want top-level categories (level 0 or parent null)
      if (params.level === 0 || params.parent === null) {
        // Get all categories and filter manually since Prisma null query seems to have issues
        const allCategories = await prisma.category.findMany({
          where: params.active !== undefined ? { isActive: params.active } : {},
          orderBy: {
            sortOrder: 'asc',
          },
        })
        
        // Filter for top-level categories (those with null parentId)
        return allCategories.filter(cat => cat.parentId === null)
      } else if (params.parent) {
        where.parentId = params.parent
      }
      
      const categories = await prisma.category.findMany({
        where,
        orderBy: {
          sortOrder: 'asc',
        },
      })
      return categories
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    console.log('🔄 Using fallback categories due to database connectivity issues')
    // Return fallback data when database is unreachable
    return fallbackCategories as Category[]
  }
} 