'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAppDispatch } from '@/redux/hooks'
import { addToCart } from '@/redux/slices/cartSlice'
import { setCartDrawerOpen } from '@/redux/slices/uiSlice'
import { useWishlist } from '@/hooks/useWishlist'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ProductCardProps {
  id: string
  name: string
  description: string
  price: number
  image: string
  isNew?: boolean
  isBestSeller?: boolean
  isOutOfStock?: boolean
  discount?: number
}

export function ProductCard({
  id,
  name,
  description,
  price,
  image,
  isNew = false,
  isBestSeller = false,
  isOutOfStock = false,
  discount = 0,
}: ProductCardProps) {
  const dispatch = useAppDispatch()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const [isHovered, setIsHovered] = useState(false)
  const [isImageLoading, setIsImageLoading] = useState(true)

  const safePrice = typeof price === 'number' && !isNaN(price) ? price : 0
  const discountedPrice = discount > 0 && typeof price === 'number' && !isNaN(price)
    ? price - (price * discount) / 100
    : safePrice

  const handleAddToCart = () => {
    const cartItem = {
      id,
      name,
      price: discount > 0 ? discountedPrice : safePrice,
      image,
      quantity: 1
    }
    dispatch(addToCart(cartItem))
    dispatch(setCartDrawerOpen(true))
    toast.success(`${name} has been added to your cart.`)
  }

  const handleWishlistToggle = () => {
    if (isInWishlist()) {
      removeFromWishlist()
      toast.success(`${name} has been removed from your wishlist.`)
    } else {
      addToWishlist()
      toast.success(`${name} has been added to your wishlist.`)
    }
  }

  return (
    <div 
      className="group relative overflow-hidden rounded-lg border bg-background p-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/product/${id}`} className="block">
        <div className="relative aspect-square overflow-hidden rounded-md">
          <Image
            src={image}
            alt={name}
            fill
            className={cn(
              'object-cover transition-transform duration-300',
              isHovered ? 'scale-110' : 'scale-100'
            )}
            onLoadingComplete={() => setIsImageLoading(false)}
          />
          {isNew && (
            <Badge className="absolute left-2 top-2 bg-primary">New</Badge>
          )}
          {isBestSeller && (
            <Badge className="absolute right-2 top-2 bg-secondary">Best Seller</Badge>
          )}
          {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
              <Badge variant="destructive">Out of Stock</Badge>
            </div>
          )}
        </div>
      </Link>

      <div className="relative mt-4 space-y-2 p-2">
        <div className="flex gap-2">
          {isNew && <Badge>New</Badge>}
          {isBestSeller && <Badge variant="secondary">Best Seller</Badge>}
          {discount > 0 && (
            <Badge variant="destructive">-{discount}% OFF</Badge>
          )}
        </div>
        
        <h3 className="font-medium leading-none">{name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {description}
        </p>
        
        <div className="flex items-center justify-between">
          <div>
            {discount > 0 ? (
              <div className="flex items-baseline gap-2">
                <span className="font-bold">${discountedPrice.toFixed(2)}</span>
                <span className="text-sm text-muted-foreground line-through">
                  ${safePrice.toFixed(2)}
                </span>
              </div>
            ) : (
              <span className="font-bold">${safePrice.toFixed(2)}</span>
            )}
          </div>
          {isOutOfStock && (
            <Badge variant="secondary" className="pointer-events-none">
              Out of Stock
            </Badge>
          )}
        </div>
      </div>

      <div className="absolute bottom-4 right-4 flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className={`h-8 w-8 rounded-full transition-colors ${
            isInWishlist()
              ? 'bg-destructive/10 text-destructive hover:bg-destructive/20'
              : 'hover:bg-muted'
          }`}
          onClick={handleWishlistToggle}
          aria-label={isInWishlist() ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            className={`h-4 w-4 ${
              isInWishlist() ? 'fill-destructive' : ''
            }`}
          />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full hover:bg-muted"
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          aria-label="Add to cart"
        >
          <ShoppingCart className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
} 