import { Product as PrismaProduct, Category as PrismaCategory } from '@prisma/client'

export type Product = PrismaProduct & {
  category: PrismaCategory
}

export type Category = PrismaCategory

// Legacy interface for backward compatibility
export interface ProductLegacy {
  id: string
  name: string
  slug: string
  description: string
  price: number
  salePrice?: number | null
  sku: string
  stock: number
  images: string[]
  categoryId: string
  category?: {
    name: string
    slug: string
  }
  isFeatured: boolean
  isNewArrival: boolean
  isPopular: boolean
  status: string
  weight?: number | null
  dimensions?: string | null
  material?: string | null
  care?: string | null
  createdAt: Date
  updatedAt: Date
} 