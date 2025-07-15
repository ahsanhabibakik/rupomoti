// Define our own Product and Category types

export type Product = {
  id: string
  name: string
  slug: string
  description?: string
  price: number
  salePrice?: number | null
  discount?: number | null
  images: string[]
  category?: Category | null
  categoryId?: string | null
  stock: number
  isFeatured: boolean
  isPopular: boolean
  rating?: number | null
  sku?: string | null
  status?: string
  weight?: number | null
  dimensions?: string | null
  material?: string | null
  care?: string | null
  createdAt: Date | string
  updatedAt: Date | string
}

export type Category = {
  id: string
  name: string
  slug: string
  description?: string | null
  image?: string | null
  featured?: boolean
  parentId?: string | null
  createdAt?: Date | string
  updatedAt?: Date | string
}

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