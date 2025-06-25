export interface Product {
  id: string
  name: string
  description: string
  price: number
  salePrice?: number | null
  sku: string
  stock: number
  images: string[]
  categoryId: string
  category: any // You might want to define a proper Category type
  isFeatured: boolean
  isNewArrival: boolean
  isPopular: boolean
  rating?: number
  createdAt: Date
  updatedAt: Date
  slug: string
} 