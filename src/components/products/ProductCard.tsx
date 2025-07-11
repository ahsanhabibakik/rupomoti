'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingCart,   } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAppDispatch } from '@/redux/hooks'
import { addToCart } from '@/redux/slices/cartSlice'
import { setCartDrawerOpen } from '@/redux/slices/uiSlice'
import { useWishlist } from '@/hooks/useWishlist'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Product } from '@/types/product'
import { optimizeCloudinaryUrl, isCloudinaryUrl } from '@/utils/cloudinary'

interface ProductCardProps {
  product: Product
  compact?: boolean
  className?: string
}

// Utility function to get optimized product image
const getOptimizedProductImage = (image: string | undefined, size: 'small' | 'medium' | 'large' = 'medium'): string => {
  if (!image || typeof image !== 'string' || image.trim() === '') {
    return '/images/placeholder.jpg'
  }

  const trimmedImage = image.trim()
  
  // If it's a Cloudinary URL, optimize it
  if (isCloudinaryUrl(trimmedImage)) {
    const sizes = {
      small: { width: 300, height: 300 },
      medium: { width: 500, height: 500 },
      large: { width: 800, height: 800 }
    }
    
    const { width, height } = sizes[size]
    return optimizeCloudinaryUrl(trimmedImage, width, height, {
      quality: 'auto',
      format: 'auto',
      crop: 'fill'
    })
  }
  
  return trimmedImage
}

export function ProductCard({ product, compact = false, className }: ProductCardProps) {
  const { id, name, price, salePrice, images, isNewArrival, isPopular, isFeatured, stock } = product
  const discount = price && salePrice && salePrice < price ? Math.round(((price - salePrice) / price) * 100) : 0
  const dispatch = useAppDispatch()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const [isImageLoading, setIsImageLoading] = useState(true)
  const [isHovered, setIsHovered] = useState(false)

  const safePrice = typeof price === 'number' && !isNaN(price) ? price : 0
  const finalPrice = salePrice && salePrice < price ? salePrice : safePrice

  const isOutOfStock = typeof stock === 'number' ? stock <= 0 : false;

  // Get optimized images
  const primaryImage = getOptimizedProductImage(images?.[0], compact ? 'small' : 'medium')
  const hoverImage = getOptimizedProductImage(images?.[1], compact ? 'small' : 'medium')

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const cartItem = {
      id,
      name: name || 'Unnamed Product',
      price: finalPrice,
      image: primaryImage,
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
    if (isInWishlist(id)) {
      removeFromWishlist(id)
    } else {
      addToWishlist(id)
    }
  }


  return (
    <div
      className={cn(
        "product-card-enhanced bg-base border border-accent-light rounded-xl shadow-premium transition-premium flex flex-col overflow-hidden",
        // Responsive sizing - more compact on mobile
        "sm:rounded-xl rounded-lg sm:shadow-premium shadow-sm",
        compact && "rounded-lg shadow-sm",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <Link href={`/product/${product.slug || id}`} className={cn(
        "block relative w-full overflow-hidden",
        // Responsive aspect ratio - more compact on mobile
        compact ? "aspect-[4/3]" : "aspect-[4/3] sm:aspect-square"
      )}>
        {/* Main Image */}
        <Image
          src={primaryImage}
          alt={name || 'Unnamed Product'}
          fill
          className={cn(
            "object-cover transition-opacity duration-300",
            isHovered && hoverImage !== primaryImage ? "opacity-0" : "opacity-100"
          )}
          sizes={compact ? "(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw" : "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 50vw"}
          onLoad={() => setIsImageLoading(false)}
          onError={(e) => {
            console.error('Product image failed to load:', primaryImage)
            // Set fallback image on error
            e.currentTarget.src = '/images/placeholder.jpg'
            setIsImageLoading(false)
          }}
        />
        
        {/* Hover Image */}
        {hoverImage && hoverImage !== primaryImage && (
          <Image
            src={hoverImage}
            alt={`${name || 'Unnamed Product'} - alternate view`}
            fill
            className={cn(
              "object-cover transition-opacity duration-300",
              isHovered ? "opacity-100" : "opacity-0"
            )}
            sizes={compact ? "(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw" : "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 50vw"}
            onError={(e) => {
              console.error('Product hover image failed to load:', hoverImage)
              e.currentTarget.style.display = 'none'
            }}
          />
        )}
        {/* Loading Overlay */}
        {isImageLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
            <div className={cn(
              "border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin",
              compact ? "w-6 h-6" : "w-8 h-8"
            )}></div>
          </div>
        )}
        {/* Badges */}
        <div className={cn(
          "absolute top-2 left-2 flex flex-row flex-wrap gap-1.5 z-10 max-w-[80%]",
          // Responsive badge positioning
          "sm:top-2 sm:left-2 sm:gap-1.5 top-1 left-1 gap-1",
          compact && "top-1 left-1 gap-1"
        )}>
          {isNewArrival && (
            <Badge className={cn(
              "bg-gradient-to-r from-green-500 to-emerald-500 badge-white-text border-0 shadow-lg font-medium",
              // Responsive badge sizing
              "text-[10px] px-1 py-0 sm:text-xs sm:px-2 sm:py-1",
              compact && "text-[10px] px-1 py-0"
            )}>
              <span className="text-white">New</span>
            </Badge>
          )}
          {isPopular && (
            <Badge className={cn(
              "bg-gradient-to-r from-orange-500 to-red-500 badge-white-text border-0 shadow-lg font-medium",
              "text-[10px] px-1 py-0 sm:text-xs sm:px-2 sm:py-1",
              compact && "text-[10px] px-1 py-0"
            )}>
              <span className="text-white">Popular</span>
            </Badge>
          )}
          {isFeatured && (
            <Badge className={cn(
              "bg-gradient-to-r from-purple-500 to-indigo-500 badge-white-text border-0 shadow-lg font-medium",
              "text-[10px] px-1 py-0 sm:text-xs sm:px-2 sm:py-1",
              compact && "text-[10px] px-1 py-0"
            )}>
              <span className="text-white">Featured</span>
            </Badge>
          )}
          {discount > 0 && (
            <Badge className={cn(
              "bg-gradient-to-r from-red-500 to-pink-500 badge-white-text border-0 shadow-lg font-bold",
              "text-[10px] px-1 py-0 sm:text-xs sm:px-2 sm:py-1",
              compact && "text-[10px] px-1 py-0"
            )}>
              <span className="text-white">-{discount}%</span>
            </Badge>
          )}
        </div>
        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-20">
            <div className="text-center">
              <div className={cn(
                "text-white font-bold mb-1",
                compact ? "text-sm" : "text-base"
              )}>Out of Stock</div>
            </div>
          </div>
        )}
      </Link>
      {/* Content */}
      <div className={cn(
        "flex-1 flex flex-col",
        // Responsive padding
        "p-1.5 sm:p-2",
        compact && "p-1.5"
      )}>
        <div> {/* Content that stays at the top */}
          <Link href={`/product/${product.slug || id}`} className="block">
            <h3 className={cn(
              "font-semibold text-neutral mb-1 line-clamp-2 hover:text-primary transition-colors",
              // Responsive text sizing
              "text-xs sm:text-sm",
              "h-[32px] sm:h-[40px]",
              compact && "text-xs h-[32px]"
            )}>
              {name || 'Unnamed Product'}
            </h3>
          </Link>
          {/* Rating - wrapper ensures consistent height */}
          <div className={cn(
            "mb-1 flex items-center gap-1",
            // Responsive height
            "h-4 sm:h-5",
            compact && "h-4"
          )}>
            {/* Rating display removed - would need reviews data to calculate */}
          </div>
          {/* Price */}
          <div className="flex items-baseline gap-2 mb-1">
            <span className={cn(
              "font-bold",
              // Responsive price sizing
              "text-sm sm:text-md",
              compact && "text-sm",
              salePrice ? "text-red-600" : "text-primary"
            )}>
              ৳{salePrice ? salePrice.toLocaleString() : price?.toLocaleString()}
            </span>
            {salePrice && (
              <span className={cn(
                "text-gray-500 line-through",
                // Responsive crossed price sizing
                "text-[10px] sm:text-xs",
                compact && "text-[10px]"
              )}>
                ৳{price?.toLocaleString()}
              </span>
            )}
          </div>
        </div>
        
        <div className="mt-auto pt-1"> {/* Wrapper to push content below to the bottom */}
          {/* Stock Status */}
          {typeof stock === 'number' && (
            <div className={cn(
              "flex items-center justify-between text-xs mb-1",
              // Hide stock on mobile when compact, show on larger screens
              "hidden sm:flex",
              compact && "hidden"
            )}>
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
          <div className={cn(
            "flex gap-1.5",
            // Responsive gap
            "gap-1 sm:gap-1.5",
            compact && "gap-1"
          )}>
            <Button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={cn(
                "flex-1 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300",
                // Responsive button sizing
                "h-7 text-[10px] px-2 sm:h-9 sm:text-xs sm:px-3",
                compact && "h-7 text-[10px] px-2"
              )}
            >
              <ShoppingCart className={cn(
                // Responsive icon sizing
                "w-3 h-3 mr-1 sm:w-4 sm:h-4 sm:mr-1.5",
                compact && "w-3 h-3 mr-1"
              )} />
              {/* Responsive button text */}
              <span className="hidden sm:inline">Add to Cart</span>
              <span className="sm:hidden">Add</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className={cn(
                "rounded-lg border-gray-300 hover:border-gray-400 hover:bg-gray-50",
                // Responsive button sizing
                "h-7 w-7 sm:h-9 sm:w-9",
                compact && "h-7 w-7"
              )}
              onClick={handleWishlistToggle}
            >
              <Heart
                className={cn(
                  "transition-all duration-300",
                  // Responsive icon sizing
                  "h-3 w-3 sm:h-4 sm:w-4",
                  compact && "h-3 w-3",
                  isInWishlist(id) ? "fill-red-500 text-red-500" : "text-gray-600 hover:text-red-500"
                )}
              />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 