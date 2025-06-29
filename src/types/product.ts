import { Product as PrismaProduct, Category as PrismaCategory } from '@prisma/client'

export type Product = PrismaProduct & {
  category: PrismaCategory
}

export type Category = PrismaCategory

// Legacy interface for backward compatibility
export interface ProductLegacy {
  id: string
  name: string
  description: string
  price: number
  salePrice?: number | null
  sku: string
  stock: number
  images: string[]
  categoryId: string
  category: any
  isFeatured: boolean
  isNewArrival: boolean
  isPopular: boolean
  rating?: number
  createdAt: Date
  updatedAt: Date
  slug: string
} 