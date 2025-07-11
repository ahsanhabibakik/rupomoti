import { Product } from '@prisma/client'

export interface SafeProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  images: string[];
  category: string | { name: string; slug: string } | null;
  categoryName?: string;
  isNewArrival?: boolean;
  isPopular?: boolean;
  isFeatured?: boolean;
  stock?: number;
  rating?: number;
}

export function formatProductForDisplay(product: any): SafeProduct {
  return {
    ...product,
    price: Number(product.price) || 0,
    salePrice: product.salePrice ? Number(product.salePrice) : undefined,
    images: Array.isArray(product.images) ? product.images : [],
    category: product.category?.name || product.categoryName || product.category || 'Uncategorized',
    isNewArrival: Boolean(product.isNewArrival),
    isPopular: Boolean(product.isPopular),
    isFeatured: Boolean(product.isFeatured),
    stock: Number(product.stock) || 0,
    rating: Number(product.rating) || 0,
  }
}

export function safeRenderPrice(price: number): string {
  return `৳${(price || 0).toLocaleString()}`
}

export function safeRenderCategory(category: string | { name: string } | null): string {
  if (!category) return 'Uncategorized'
  if (typeof category === 'string') return category
  if (typeof category === 'object' && category.name) return category.name
  return 'Uncategorized'
}
