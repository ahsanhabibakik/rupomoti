'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Minus, Plus } from 'lucide-react'
import { useAppDispatch } from '@/redux/hooks'
import { addToCart } from '@/redux/slices/cartSlice'
import { showToast } from '@/lib/toast'
import { Product } from '@prisma/client'

interface AddToCartButtonProps {
  product: Omit<Product, 'description' | 'stock' | 'createdAt' | 'updatedAt'> & {
    category?: { name: string; slug: string } | null
  }
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1)
  const dispatch = useAppDispatch()

  const handleAddToCart = () => {
    dispatch(addToCart({ 
      id: product.id,
      name: product.name,
      price: product.salePrice ?? product.price,
      image: product.images[0],
      category: product.category?.name || 'Unknown',
      quantity 
    }))
    showToast.success(`${quantity} × "${product.name}" added to cart!`)
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center border rounded-lg">
        <Button variant="ghost" size="icon" onClick={() => setQuantity(q => Math.max(1, q - 1))}>
          <Minus className="w-4 h-4" />
        </Button>
        <span className="w-12 text-center font-semibold">{quantity}</span>
        <Button variant="ghost" size="icon" onClick={() => setQuantity(q => q + 1)}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      <Button onClick={handleAddToCart} size="lg" className="flex-1">
        <ShoppingCart className="w-5 h-5 mr-2" />
        Add to Cart
      </Button>
    </div>
  )
} 