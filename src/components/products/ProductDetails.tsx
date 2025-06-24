'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAppDispatch } from '@/redux/hooks'
import { addToCart, toggleCart } from '@/redux/slices/cartSlice'
import { Heart, Share2, ChevronRight, Truck, Plus, Minus } from 'lucide-react'
import Image from 'next/image'
import { Product } from '@/types/product'
import { showToast } from '@/lib/toast'
import { ScrollArea } from '@/components/ui/scroll-area'

interface ProductDetailsProps {
  product: Product
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const dispatch = useAppDispatch()

  const discount = product.price && product.salePrice ? Math.round(((product.price - product.salePrice) / product.price) * 100) : 0
  const isOutOfStock = typeof product.stock === 'number' ? product.stock <= 0 : false;

  const handleAddToCart = () => {
    const cartItem = {
      id: product.id,
      name: product.name || 'Unnamed Product',
      price: product.salePrice || product.price,
      image: product.images[0],
      quantity: quantity,
      category: product.category,
    }
    dispatch(addToCart(cartItem))
    dispatch(toggleCart())
    showToast.success(`${product.name || 'Unnamed Product'} has been added to your cart.`)
  }

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      {/* Product Images */}
      <div className="space-y-6">
        <div className="relative aspect-square overflow-hidden rounded-2xl border shadow-lg">
          <Image
            src={product.images[selectedImage]}
            alt={product.name || 'Unnamed Product'}
            fill
            className="object-cover"
            priority
          />
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
              <span className="text-white text-2xl font-bold">Out of Stock</span>
            </div>
          )}
        </div>
        <ScrollArea className="w-full" type="scroll">
          <div className="flex gap-4 pb-4">
            {product.images.map((image, index) => (
              <button
                key={index}
                className={`relative aspect-square w-20 overflow-hidden rounded-lg border transition-all duration-200 ${
                  selectedImage === index ? 'ring-2 ring-primary scale-105' : 'hover:ring-1 hover:ring-primary/40'
                }`}
                onClick={() => setSelectedImage(index)}
              >
                <Image
                  src={image}
                  alt={`${product.name || 'Unnamed Product'} ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Product Info */}
      <div className="space-y-8">
        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-2">
          {product.isNewArrival && <Badge className="bg-primary text-primary-foreground">New</Badge>}
          {product.isPopular && <Badge className="bg-green-500 text-white">Popular</Badge>}
          {product.isFeatured && <Badge className="bg-blue-500 text-white">Featured</Badge>}
          {discount > 0 && <Badge variant="destructive">-{discount}%</Badge>}
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold leading-tight">{product.name || 'Unnamed Product'}</h1>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-primary">
              ৳{product.salePrice ? product.salePrice.toLocaleString() : product.price.toLocaleString()}
            </span>
            {product.salePrice && (
              <span className="text-lg text-muted-foreground line-through">
                ৳{product.price.toLocaleString()}
              </span>
            )}
            {discount > 0 && (
              <span className="text-base font-semibold text-destructive">Save {discount}%</span>
            )}
          </div>
        </div>

        {/* Add to Cart & Quantity */}
        <div className="flex flex-col sm:flex-row items-center gap-4 sticky top-4 z-10 bg-white/80 py-4 rounded-xl shadow-sm">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-8 text-center font-semibold text-lg">{quantity}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setQuantity(quantity + 1)}
              disabled={isOutOfStock}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <Button
            className="flex-1 min-w-[160px] text-lg font-semibold"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
          >
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </Button>
          <Button variant="outline" size="icon">
            <Heart className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="icon">
            <Share2 className="h-5 w-5" />
          </Button>
        </div>

        {/* Product Description */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Description</h2>
          <p className="text-muted-foreground leading-relaxed text-base">
            {product.description}
          </p>
        </div>

        {/* Shipping Info */}
        <div className="rounded-lg border p-4 bg-gradient-to-r from-primary/5 to-secondary/5">
          <div className="flex items-center gap-3">
            <Truck className="h-6 w-6 text-primary" />
            <div>
              <p className="font-medium">Free Shipping</p>
              <p className="text-sm text-muted-foreground">
                Estimated delivery: 3-5 business days
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 