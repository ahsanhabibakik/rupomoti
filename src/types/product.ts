// Product and Category types for Mongoose
export interface Product {
  _id: string
  id: string
  name: string
  description: string
  slug?: string
  price: number
  salePrice?: number // Add salePrice field
  discountPrice?: number
  categoryId: string
  images: string[]
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT'
  isFeatured: boolean
  isPopular: boolean
  isNewArrival?: boolean // Add isNewArrival field
  stock: number
  sku: string
  weight?: number
  dimensions?: {
    length: number
    width: number
    height: number
  }
  materials?: string[]
  colors?: string[]
  sizes?: string[]
  tags?: string[]
  seo?: {
    title?: string
    description?: string
    keywords?: string
  }
  createdAt: Date
  updatedAt: Date
  category?: Category
}

export interface Category {
  _id: string
  id: string
  name: string
  description?: string
  slug: string
  image?: string
  parentId?: string
  isActive: boolean
  sortOrder: number
  seo?: {
    title?: string
    description?: string
    keywords?: string
  }
  createdAt: Date
  updatedAt: Date
}

export interface ProductWithCategory extends Product {
  category: Category
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