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

  const handleAddToCart = () => {
    dispatch(addToCart(product))
    dispatch(toggleCart())
    showToast.success(`${product.name} has been added to your cart.`)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Product Images */}
      <div className="space-y-4">
        <div className="relative aspect-square overflow-hidden rounded-lg border">
          <Image
            src={product.images[selectedImage]}
            alt={product.name}
            fill
            className="object-cover"
            priority
          />
        </div>
        <ScrollArea className="w-full" type="scroll">
          <div className="flex gap-4 pb-4">
            {product.images.map((image, index) => (
              <button
                key={index}
                className={`relative aspect-square w-20 overflow-hidden rounded-lg border ${
                  selectedImage === index ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedImage(index)}
              >
                <Image
                  src={image}
                  alt={`${product.name} ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Product Info */}
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">৳{product.price.toLocaleString()}</span>
            {product.salePrice && (
              <span className="text-lg text-muted-foreground line-through">
                ৳{product.salePrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Button className="flex-1" onClick={handleAddToCart}>
              Add to Cart
            </Button>
            <Button variant="outline" size="icon">
              <Heart className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="icon">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Product Description */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Description</h2>
          <p className="text-muted-foreground">{product.description}</p>
        </div>

        {/* Shipping Info */}
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-muted-foreground" />
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