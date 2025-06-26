'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingCart, Sparkles, Eye, Star, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAppDispatch } from '@/redux/hooks'
import { addToCart } from '@/redux/slices/cartSlice'
import { setCartDrawerOpen } from '@/redux/slices/uiSlice'
import { useWishlist } from '@/hooks/useWishlist'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Product } from '@/types/product'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { id, name, price, salePrice, images, isNewArrival, isPopular, isFeatured, stock, rating } = product
  const discount = price && salePrice ? Math.round(((price - salePrice) / price) * 100) : 0
  const dispatch = useAppDispatch()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const [isImageLoading, setIsImageLoading] = useState(true)

  const safePrice = typeof price === 'number' && !isNaN(price) ? price : 0
  const discountedPrice = discount > 0 && typeof price === 'number' && !isNaN(price)
    ? price - (price * discount) / 100
    : safePrice

  const isOutOfStock = typeof stock === 'number' ? stock <= 0 : false;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const cartItem = {
      id,
      name: name || 'Unnamed Product',
      price: discount > 0 ? discountedPrice : safePrice,
      image: images[0] || '/placeholder.png',
      quantity: 1,
      category: 'Uncategorized'
    }
    dispatch(addToCart(cartItem))
    dispatch(setCartDrawerOpen(true))
    toast.success(`${name || 'Unnamed Product'} has been added to your cart.`)
  }

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isInWishlist()) {
      removeFromWishlist()
      toast.success(`${name || 'Unnamed Product'} has been removed from your wishlist.`)
    } else {
      addToWishlist()
      toast.success(`${name || 'Unnamed Product'} has been added to your wishlist.`)
    }
  }

  const renderStars = (rating: number = 0) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn(
          "w-3 h-3",
          i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        )}
      />
    ))
  }

  return (
    <div
      className="product-card-enhanced bg-base border border-accent-light rounded-xl shadow-premium transition-premium flex flex-col overflow-hidden"
    >
      {/* Image Container */}
      <Link href={`/product/${id}`} className="block relative aspect-square w-full overflow-hidden">
        <Image
          src={images[0] || '/placeholder.png'}
          alt={name || 'Unnamed Product'}
          fill
          className="object-cover"
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 50vw"
          onLoad={() => setIsImageLoading(false)}
        />
        {/* Loading Overlay */}
        {isImageLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
          </div>
        )}
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-row flex-wrap gap-1.5 z-10 max-w-[80%]">
          {isNewArrival && (
            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-lg text-xs">New</Badge>
          )}
          {isPopular && (
            <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 shadow-lg text-xs">Popular</Badge>
          )}
          {isFeatured && (
            <Badge className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-0 shadow-lg text-xs">Featured</Badge>
          )}
          {discount > 0 && (
            <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 shadow-lg font-bold text-xs">-{discount}%</Badge>
          )}
        </div>
        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-20">
            <div className="text-center">
              <div className="text-white text-base font-bold mb-1">Out of Stock</div>
            </div>
          </div>
        )}
      </Link>
      {/* Content */}
      <div className="flex-1 flex flex-col p-2">
        <div> {/* Content that stays at the top */}
          <Link href={`/product/${id}`} className="block">
            <h3 className="text-sm font-semibold text-neutral mb-1 h-[40px] line-clamp-2 hover:text-primary transition-colors">
              {name || 'Unnamed Product'}
            </h3>
          </Link>
          {/* Rating - wrapper ensures consistent height */}
          <div className="h-5 mb-1 flex items-center gap-1">
            {rating && rating > 0 && (
              <>
                {renderStars(rating)}
                <span className="text-xs text-gray-500 ml-1">({rating.toFixed(1)})</span>
              </>
            )}
          </div>
          {/* Price */}
          <div className="flex items-baseline gap-2 mb-1">
            <span className={cn(
              "text-md font-bold",
              salePrice ? "text-red-600" : "text-primary"
            )}>
              ৳{salePrice ? salePrice.toLocaleString() : price?.toLocaleString()}
            </span>
            {salePrice && (
              <span className="text-xs text-gray-500 line-through">
                ৳{price?.toLocaleString()}
              </span>
            )}
          </div>
        </div>
        
        <div className="mt-auto pt-1"> {/* Wrapper to push content below to the bottom */}
          {/* Stock Status */}
          {typeof stock === 'number' && (
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-600">Stock:</span>
              <span className={cn(
                "font-medium",
                stock > 10 ? "text-green-600" : stock > 0 ? "text-orange-600" : "text-red-600"
              )}>
                {stock > 0 ? `${stock} left` : 'Out of Stock'}
              </span>
            </div>
          )}
          {/* Action Buttons */}
          <div className="flex gap-1.5">
            <Button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="h-9 flex-1 bg-primary hover:bg-primary-dark text-accent rounded-lg text-xs font-medium shadow"
            >
              <ShoppingCart className="w-4 h-4 mr-1.5" />
              Add to Cart
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-lg border-gray-300 hover:border-gray-400 hover:bg-gray-50"
              onClick={handleWishlistToggle}
            >
              <Heart
                className={cn(
                  "h-4 w-4 transition-all duration-300",
                  isInWishlist() ? "fill-red-500 text-red-500" : "text-gray-600 hover:text-red-500"
                )}
              />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 