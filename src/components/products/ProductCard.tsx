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
import { Product } from '@/types/product'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { id, name, price, salePrice, images, isNewArrival, isPopular, isFeatured } = product
  const discount = price && salePrice ? Math.round(((price - salePrice) / price) * 100) : 0
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
      image: images[0] || '/placeholder.png',
      quantity: 1,
      category: 'Uncategorized'
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
    <Link href={`/product/${id}`} className="group relative block overflow-hidden rounded-lg">
      <div className="relative aspect-[4/5] w-full">
        <Image
          src={images[0] || '/placeholder.png'}
          alt={name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 50vw"
        />
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {isNewArrival && <Badge className="bg-primary text-primary-foreground">New</Badge>}
          {isPopular && <Badge className="bg-green-500 text-white">Popular</Badge>}
          {isFeatured && <Badge className="bg-blue-500 text-white">Featured</Badge>}
          {discount > 0 && <Badge variant="destructive">-{discount}%</Badge>}
        </div>
      </div>

      <div className="p-4 bg-background">
        <h3 className="text-base font-semibold text-foreground truncate">{name}</h3>
        <div className="flex items-baseline gap-2 mt-1">
          <span className={`text-lg font-bold ${salePrice ? 'text-destructive' : 'text-foreground'}`}>
            ৳{salePrice ? salePrice.toLocaleString() : price.toLocaleString()}
          </span>
          {salePrice && (
            <span className="text-sm text-muted-foreground line-through">
              ৳{price.toLocaleString()}
            </span>
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
            disabled={!salePrice && isOutOfStock}
            aria-label="Add to cart"
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Link>
  )
} 