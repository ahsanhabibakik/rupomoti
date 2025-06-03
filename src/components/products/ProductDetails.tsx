'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCart } from '@/contexts/CartContext'
import { Heart, Share2, ChevronRight, Truck } from 'lucide-react'
import Image from 'next/image'

interface Product {
  id: string
  name: string
  description: string
  price: number
  images: string[]
  details: Record<string, string>
  inStock: boolean
}

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
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Product Images */}
        <div className="flex-1 space-y-4">
          <div className="aspect-square relative rounded-2xl overflow-hidden bg-gray-100">
            <Image
              src={product.images[selectedImage]}
              alt={product.name}
              className="object-cover"
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {product.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`aspect-square relative rounded-lg overflow-hidden bg-gray-100 cursor-pointer transition-all ${
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
        </div>

        {/* Product Info */}
        <div className="flex-1 space-y-8">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
              Home <ChevronRight className="w-4 h-4" /> 
              {product.details.pearlType} <ChevronRight className="w-4 h-4" /> 
              {product.name}
            </div>
            <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
            <div className="flex items-center gap-4 mb-6">
              <p className="text-3xl font-semibold text-primary">
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
            <p className="text-gray-600 text-lg leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                -
              </Button>
              <span className="w-12 text-center text-lg">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
              >
                +
              </Button>
            </div>

            <div className="flex gap-4">
              <Button
                size="lg"
                className="flex-1"
                onClick={handleAddToCart}
              >
                কার্টে যোগ করুন
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-12 flex-none"
              >
                <Heart className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-12 flex-none"
              >
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6 border-t pt-8">
            <h2 className="text-xl font-semibold">Product Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4">
              {Object.entries(product.details).map(([key, value]) => (
                <div key={key} className="flex gap-2">
                  <span className="text-gray-500 min-w-[120px]">
                    {key.replace(/([A-Z])/g, ' $1').trim()}:
                  </span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Info */}
          <div className="border rounded-xl p-6 bg-gray-50 space-y-4">
            <div className="flex items-center gap-3">
              <Truck className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Delivery Information</h3>
            </div>
            <div className="space-y-2">
              <p className="flex justify-between text-sm">
                <span>Inside Dhaka:</span>
                <span className="font-medium">৳60</span>
              </p>
              <p className="flex justify-between text-sm">
                <span>Near Dhaka:</span>
                <span className="font-medium">৳100</span>
              </p>
              <p className="flex justify-between text-sm">
                <span>Outside Dhaka:</span>
                <span className="font-medium">৳150</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 