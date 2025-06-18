'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingCart, Sparkles } from 'lucide-react'
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
      className="group relative flex flex-col h-full overflow-hidden rounded-lg border border-pearl-dark bg-pearl-light p-2 sm:p-4 transition-all duration-300 hover:shadow-pearl hover:border-gold"
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
            <Badge className="absolute left-2 top-2 bg-sapphire text-pearl">New</Badge>
          )}
          {isBestSeller && (
            <Badge className="absolute right-2 top-2 bg-gold text-charcoal">Best Seller</Badge>
          )}
          {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-pearl-light/80">
              <Badge variant="destructive">Out of Stock</Badge>
            </div>
          )}
          {discount > 0 && (
            <Badge className="absolute top-2 left-2 bg-gold text-charcoal">-{discount}%</Badge>
          )}
        </div>
      </Link>
      <div className="flex flex-col flex-1 gap-2 mt-2">
        <div className="flex flex-wrap gap-2 min-h-[28px]">
          {isNew && <Badge className="bg-sapphire text-pearl">New</Badge>}
          {isBestSeller && <Badge className="bg-gold text-charcoal">Best Seller</Badge>}
          {discount > 0 && (
            <Badge className="bg-gold text-charcoal">-{discount}% OFF</Badge>
          )}
        </div>
        <h3 className="font-medium leading-tight text-base sm:text-lg line-clamp-1 text-charcoal">{name}</h3>
        <p className="text-sm text-slate line-clamp-2 flex-1">{description}</p>
        <div className="flex items-center justify-between mt-2">
          <div>
            {discount > 0 ? (
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-lg text-gold">${discountedPrice.toFixed(2)}</span>
                <span className="text-sm text-slate line-through">${safePrice.toFixed(2)}</span>
              </div>
            ) : (
              <span className="font-bold text-lg text-gold">${safePrice.toFixed(2)}</span>
            )}
          </div>
          {isOutOfStock && (
            <Badge className="bg-pearl text-charcoal pointer-events-none">Out of Stock</Badge>
          )}
        </div>
        <div className="flex gap-2 mt-2">
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 rounded-full transition-colors ${
              isInWishlist()
                ? 'bg-gold/10 text-gold hover:bg-gold/20'
                : 'hover:bg-pearl text-slate hover:text-charcoal'
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
            className="h-8 w-8 rounded-full hover:bg-pearl text-slate hover:text-charcoal"
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