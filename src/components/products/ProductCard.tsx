'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCart } from '@/hooks/useCart'
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
  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const { toast } = useToast()
  const [isHovered, setIsHovered] = useState(false)
  const [isImageLoading, setIsImageLoading] = useState(true)

  const handleAddToCart = () => {
    addToCart({ id, name, price, image, quantity: 1 })
    toast({
      title: 'Added to Cart',
      description: `${name} has been added to your cart.`,
    })
  }

  const handleWishlistToggle = () => {
    if (isInWishlist(id)) {
      removeFromWishlist(id)
      toast({
        title: 'Removed from Wishlist',
        description: `${name} has been removed from your wishlist.`,
      })
    } else {
      addToWishlist({ id, name, price, image })
      toast({
        title: 'Added to Wishlist',
        description: `${name} has been added to your wishlist.`,
      })
    }
  }

  const discountedPrice = discount > 0 ? price - (price * discount) / 100 : price

  return (
    <div
      className="group relative flex flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image */}
      <Link href={`/shop/${id}`} className="relative aspect-[4/5] overflow-hidden">
        <Image
          src={image}
          alt={name}
          fill
          className={`object-cover transition-transform duration-500 ${
            isHovered ? 'scale-110' : 'scale-100'
          } ${isImageLoading ? 'animate-pulse bg-muted' : ''}`}
          onLoadingComplete={() => setIsImageLoading(false)}
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 50vw"
        />
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <Badge variant="secondary" className="bg-white text-black">
              Out of Stock
            </Badge>
          </div>
        )}
        {isNew && (
          <Badge className="absolute left-2 top-2 bg-primary">New</Badge>
        )}
        {isBestSeller && (
          <Badge variant="secondary" className="absolute right-2 top-2 bg-secondary text-secondary-foreground">
            Best Seller
          </Badge>
        )}
        {discount > 0 && (
          <Badge variant="destructive" className="absolute left-2 top-2 bg-destructive">
            {discount}% Off
          </Badge>
        )}
      </Link>

      {/* Product Info */}
      <div className="flex flex-1 flex-col p-4">
        <Link href={`/shop/${id}`} className="flex-1">
          <h3 className="mb-1 line-clamp-1 text-lg font-semibold transition-colors group-hover:text-primary">
            {name}
          </h3>
          <p className="mb-2 line-clamp-2 text-sm text-muted-foreground">
            {description}
          </p>
        </Link>

        {/* Price and Actions */}
        <div className="mt-auto flex items-baseline justify-between">
          <div className="flex flex-col">
            {discount > 0 ? (
              <>
                <span className="text-lg font-bold text-destructive">
                  ${discountedPrice.toFixed(2)}
                </span>
                <span className="text-sm text-muted-foreground line-through">
                  ${price.toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-lg font-bold">${price.toFixed(2)}</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 rounded-full transition-colors ${
                isInWishlist(id)
                  ? 'bg-destructive/10 text-destructive hover:bg-destructive/20'
                  : 'hover:bg-muted'
              }`}
              onClick={handleWishlistToggle}
              aria-label={isInWishlist(id) ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart
                className={`h-4 w-4 ${
                  isInWishlist(id) ? 'fill-destructive' : ''
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
      </div>
    </div>
  )
}

export default ProductCard 