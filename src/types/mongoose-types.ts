// Type definitions to replace Prisma client types

export interface Category {
  id: string
  _id?: string
  name: string
  slug: string
  description?: string
  image?: string
  isActive: boolean
  sortOrder: number
  metaTitle?: string
  metaDescription?: string
  parentId?: string
  createdAt: Date
  updatedAt: Date
  _count?: {
    products: number
  }
}

export interface Product {
  id: string
  _id?: string
  name: string
  slug: string
  description?: string
  price: number
  salePrice?: number
  sku: string
  stock: number
  images: string[]
  category: string | Category
  isFeatured: boolean
  isPopular: boolean
  tags: string[]
  weight?: number
  dimensions?: string
  materials: string[]
  careInstructions?: string
  createdAt: Date
  updatedAt: Date
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED'
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'
export type PaymentMethod = 'CASH_ON_DELIVERY' | 'BKASH' | 'NAGAD' | 'ROCKET' | 'BANK_TRANSFER' | 'CARD'

export interface OrderItem {
  productId: string
  product?: Product
  quantity: number
  price: number
  total: number
}

export interface ShippingAddress {
  name: string
  phone: string
  email?: string
  address: string
  city: string
  state?: string
  zipCode: string
  country: string
  landmark?: string
}

export interface Order {
  id: string
  _id?: string
  orderNumber: string
  userId?: string
  user?: User
  customerInfo: {
    name: string
    email: string
    phone: string
  }
  items: OrderItem[]
  subtotal: number
  shippingCost: number
  tax: number
  discount: number
  total: number
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentMethod: PaymentMethod
  shippingAddress: ShippingAddress
  billingAddress?: ShippingAddress
  notes?: string
  trackingNumber?: string
  courierService?: string
  estimatedDelivery?: Date
  deliveredAt?: Date
  cancelledAt?: Date
  cancelReason?: string
  refundAmount?: number
  refundReason?: string
  createdAt: Date
  updatedAt: Date
}

export interface User {
  id: string
  _id?: string
  name?: string
  email: string
  phone?: string
  emailVerified?: Date
  image?: string
  password?: string
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN' | 'MANAGER'
  isAdmin: boolean
  isFlagged: boolean
  address?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
  dateOfBirth?: Date
  gender?: 'MALE' | 'FEMALE' | 'OTHER'
  isActive: boolean
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
}

export interface NewsletterSubscription {
  id: string
  email: string
  isActive: boolean
  subscribedAt: Date
  unsubscribedAt?: Date
  tags: NewsletterTag[]
}

export interface NewsletterTag {
  id: string
  name: string
  description?: string
}

// Mock Prisma namespace for compatibility
export namespace Prisma {
  export type ProductWhereInput = any
  export type ProductOrderByWithRelationInput = any
  export type CategoryWhereInput = any
  export type OrderWhereInput = any
  export type UserWhereInput = any
}
