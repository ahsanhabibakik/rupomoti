'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCart } from '@/contexts/CartContext'
import { Heart, Share2, ChevronRight, Truck, Plus, Minus } from 'lucide-react'
import Image from 'next/image'
import { Product } from '@/types/product'
import { toast } from 'sonner'
import { ScrollArea } from '@/components/ui/scroll-area'

interface ProductDetailsProps {
  product: Product
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const { addItem } = useCart()

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image: product.images[0],
    })
    toast.success('Added to cart')
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Product Images */}
        <div className="flex-1 space-y-4">
          <div className="aspect-square relative rounded-xl sm:rounded-2xl overflow-hidden bg-secondary">
            <Image
              src={product.images[selectedImage]}
              alt={product.name}
              className="object-cover"
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
          </div>
          <ScrollArea className="w-full">
            <div className="flex sm:grid sm:grid-cols-4 gap-3 sm:gap-4 pb-4 sm:pb-0">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative flex-none sm:flex-auto w-20 sm:w-auto aspect-square rounded-lg overflow-hidden bg-secondary cursor-pointer transition-all ${
                    selectedImage === index ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${product.name} view ${index + 1}`}
                    className="object-cover"
                    fill
                    sizes="(min-width: 1024px) 15vw, 25vw"
                  />
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Product Info */}
        <div className="flex-1 space-y-6 sm:space-y-8">
          <div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
              Home <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" /> 
              {product.details.pearlType} <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" /> 
              {product.name}
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">{product.name}</h1>
            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <p className="text-2xl sm:text-3xl font-semibold text-primary">
                ৳{product.price.toLocaleString()}
              </p>
              {product.inStock ? (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  In Stock
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-red-100 text-red-800">
                  Out of Stock
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 sm:h-10 sm:w-10"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center text-base sm:text-lg">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 sm:h-10 sm:w-10"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex gap-3 sm:gap-4">
              <Button
                size="lg"
                className="flex-1 h-10 sm:h-11"
                onClick={handleAddToCart}
              >
                কার্টে যোগ করুন
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 sm:h-11 sm:w-11"
              >
                <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 sm:h-11 sm:w-11"
              >
                <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-4 sm:space-y-6 border-t pt-6 sm:pt-8">
            <h2 className="text-lg sm:text-xl font-semibold">Product Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 sm:gap-y-4 text-sm sm:text-base">
              {Object.entries(product.details).map(([key, value]) => (
                <div key={key} className="flex gap-2">
                  <span className="text-muted-foreground min-w-[100px] sm:min-w-[120px]">
                    {key.replace(/([A-Z])/g, ' $1').trim()}:
                  </span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Info */}
          <div className="border rounded-lg sm:rounded-xl p-4 sm:p-6 bg-secondary/10 space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <h3 className="font-semibold text-sm sm:text-base">Delivery Information</h3>
            </div>
            <div className="space-y-2 text-sm">
              <p className="flex justify-between">
                <span className="text-muted-foreground">Inside Dhaka:</span>
                <span className="font-medium">৳60</span>
              </p>
              <p className="flex justify-between">
                <span className="text-muted-foreground">Near Dhaka:</span>
                <span className="font-medium">৳100</span>
              </p>
              <p className="flex justify-between">
                <span className="text-muted-foreground">Outside Dhaka:</span>
                <span className="font-medium">৳150</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 