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
import { useToast } from '@/hooks/use-toast'

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
  const { toast } = useToast()
  const [isHovered, setIsHovered] = useState(false)
  const [isImageLoading, setIsImageLoading] = useState(true)

  const handleAddToCart = () => {
    dispatch(addToCart({ id, name, price, image }))
    dispatch(setCartDrawerOpen(true))
    toast({
      title: 'Added to Cart',
      description: `${name} has been added to your cart.`,
    })
  }

  const handleWishlistToggle = () => {
    if (isInWishlist()) {
      removeFromWishlist()
      toast({
        title: 'Removed from Wishlist',
        description: `${name} has been removed from your wishlist.`,
      })
    } else {
      addToWishlist()
      toast({
        title: 'Added to Wishlist',
        description: `${name} has been added to your wishlist.`,
      })
    }
  }

  const safePrice = typeof price === 'number' && !isNaN(price) ? price : 0
  const discountedPrice = discount > 0 && typeof price === 'number' && !isNaN(price)
    ? price - (price * discount) / 100
    : safePrice

  return (
    <div
      className="group relative overflow-hidden rounded-lg border bg-background transition-all hover:shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/product/${id}`} className="block">
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={image}
            alt={name}
            fill
            className={`object-cover transition-transform duration-300 ${
              isHovered ? 'scale-110' : 'scale-100'
            } ${isImageLoading ? 'blur-sm' : 'blur-0'}`}
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
        <div className="p-4">
          <h3 className="font-medium line-clamp-1">{name}</h3>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>
          <div className="mt-2 flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-bold">৳{discountedPrice.toLocaleString()}</p>
              {discount > 0 && (
                <p className="text-sm text-muted-foreground line-through">
                  ৳{safePrice.toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </div>
      </Link>
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

export default ProductCard 