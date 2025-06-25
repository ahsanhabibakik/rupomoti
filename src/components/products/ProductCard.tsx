'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingCart, Sparkles, Eye, Star, ArrowRight } from 'lucide-react'
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
  const { id, name, price, salePrice, images, isNewArrival, isPopular, isFeatured, stock, rating } = product
  const discount = price && salePrice ? Math.round(((price - salePrice) / price) * 100) : 0
  const dispatch = useAppDispatch()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const [isHovered, setIsHovered] = useState(false)
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
    dispatch(toggleCart())
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
      className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-gray-200"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/5] w-full overflow-hidden">
        <Image
          src={images[0] || '/placeholder.png'}
          alt={name || 'Unnamed Product'}
          fill
          className={cn(
            "object-cover transition-all duration-700",
            isHovered ? "scale-110" : "scale-100"
          )}
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
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          {isNewArrival && (
            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-lg">
              <Sparkles className="w-3 h-3 mr-1" />
              New
            </Badge>
          )}
          {isPopular && (
            <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 shadow-lg">
              <Star className="w-3 h-3 mr-1" />
              Popular
            </Badge>
          )}
          {isFeatured && (
            <Badge className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-0 shadow-lg">
              Featured
            </Badge>
          )}
          {discount > 0 && (
            <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 shadow-lg font-bold">
              -{discount}%
            </Badge>
          )}
        </div>

        {/* Quick Actions */}
        <div className={cn(
          "absolute top-3 right-3 flex flex-col gap-2 z-10 transition-all duration-300",
          isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
        )}>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg border border-white/20"
            onClick={handleWishlistToggle}
            aria-label={isInWishlist() ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart
              className={cn(
                "h-4 w-4 transition-all duration-300",
                isInWishlist() ? "fill-red-500 text-red-500" : "text-gray-600 hover:text-red-500"
              )}
            />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg border border-white/20"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            aria-label="Add to cart"
          >
            <ShoppingCart className="h-4 w-4 text-gray-600 hover:text-blue-600 transition-colors" />
          </Button>
        </div>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-20">
            <div className="text-center">
              <div className="text-white text-lg font-bold mb-2">Out of Stock</div>
              <div className="text-white/80 text-sm">We&apos;ll notify you when available</div>
            </div>
          </div>
        )}

        {/* Quick View Overlay */}
        <div className={cn(
          "absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-10 transition-all duration-300",
          isHovered ? "opacity-100" : "opacity-0"
        )}>
          <Link href={`/product/${id}`}>
            <Button className="bg-white text-gray-900 hover:bg-gray-100 px-6 py-3 rounded-full shadow-lg flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Quick View
            </Button>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <Link href={`/product/${id}`} className="block">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
            {name || 'Unnamed Product'}
          </h3>
        </Link>

        {/* Rating */}
        {rating && (
          <div className="flex items-center gap-1 mb-2">
            {renderStars(rating)}
            <span className="text-sm text-gray-500 ml-1">({rating})</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className={cn(
            "text-xl font-bold",
            salePrice ? "text-red-600" : "text-gray-900"
          )}>
            ৳{salePrice ? salePrice.toLocaleString() : price?.toLocaleString()}
          </span>
          {salePrice && (
            <span className="text-sm text-gray-500 line-through">
              ৳{price?.toLocaleString()}
            </span>
          )}
        </div>

        {/* Stock Status */}
        {typeof stock === 'number' && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Stock</span>
              <span className={cn(
                "font-medium",
                stock > 10 ? "text-green-600" : stock > 0 ? "text-orange-600" : "text-red-600"
              )}>
                {stock > 10 ? `${stock} available` : stock > 0 ? `Only ${stock} left` : 'Out of stock'}
              </span>
            </div>
            {stock > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                <div 
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    stock > 10 ? "bg-green-500" : "bg-orange-500"
                  )}
                  style={{ width: `${Math.min((stock / 20) * 100, 100)}%` }}
                />
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg py-2.5 transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add to Cart
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-lg border-gray-300 hover:border-gray-400 hover:bg-gray-50"
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

        {/* View Details Link */}
        <Link 
          href={`/product/${id}`}
          className="flex items-center justify-center gap-2 mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          View Details
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  )
} 