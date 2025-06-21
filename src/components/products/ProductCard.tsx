'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingCart, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAppDispatch } from '@/redux/hooks'
import { addToCart, toggleCart } from '@/redux/slices/cartSlice'
import { useWishlist } from '@/hooks/useWishlist'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ProductCardProps {
  id: string
  name: string
  description: string
  price: number
  image: string
  category?: string
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
  category = 'Uncategorized',
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
      quantity: 1,
      category
    }
    dispatch(addToCart(cartItem))
    dispatch(toggleCart())
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
      className="group relative flex flex-col h-full overflow-hidden rounded-lg border border-base-dark bg-base-light p-2 sm:p-4 transition-all duration-300 hover:shadow-premium hover:border-accent"
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
            onLoad={() => setIsImageLoading(false)}
          />
          {isNew && (
            <Badge className="absolute left-2 top-2 bg-primary text-accent">New</Badge>
          )}
          {isBestSeller && (
            <Badge className="absolute right-2 top-2 bg-accent text-primary">Best Seller</Badge>
          )}
          {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-base-light/80">
              <Badge variant="destructive">Out of Stock</Badge>
            </div>
          )}
          {discount > 0 && (
            <Badge className="absolute top-2 left-2 bg-accent text-primary">-{discount}%</Badge>
          )}
        </div>
      </Link>
      <div className="flex flex-col flex-1 gap-2 mt-2">
        <div className="flex flex-wrap gap-2 min-h-[28px]">
          {isNew && <Badge className="bg-primary text-accent">New</Badge>}
          {isBestSeller && <Badge className="bg-accent text-primary">Best Seller</Badge>}
          {discount > 0 && (
            <Badge className="bg-accent text-primary">-{discount}% OFF</Badge>
          )}
        </div>
        <h3 className="font-medium leading-tight text-base sm:text-lg line-clamp-1 text-neutral">{name}</h3>
        <p className="text-sm text-neutral-light line-clamp-2 flex-1">{description}</p>
        <div className="flex items-center justify-between mt-2">
          <div>
            {discount > 0 ? (
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-lg text-accent">৳{discountedPrice.toFixed(2)}</span>
                <span className="text-sm text-neutral-light line-through">৳{safePrice.toFixed(2)}</span>
              </div>
            ) : (
              <span className="font-bold text-lg text-accent">৳{safePrice.toFixed(2)}</span>
            )}
          </div>
          {isOutOfStock && (
            <Badge className="bg-pearl text-neutral pointer-events-none">Out of Stock</Badge>
          )}
        </div>
        <div className="flex gap-2 mt-2">
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 rounded-full transition-colors ${
              isInWishlist()
                ? 'bg-gold/10 text-accent hover:bg-gold/20'
                : 'hover:bg-pearl text-neutral-light hover:text-neutral'
            }`}
            onClick={handleWishlistToggle}
            aria-label={isInWishlist() ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart
              className={`h-4 w-4 ${
                isInWishlist() ? 'fill-gold' : ''
              }`}
            />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full hover:bg-pearl text-neutral-light hover:text-neutral"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            aria-label="Add to cart"
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
} 