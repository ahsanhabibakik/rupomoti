'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCart } from '@/contexts/CartContext'

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
    <div className="container mx-auto px-4 py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square relative rounded-lg overflow-hidden">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {product.images.map((image, index) => (
              <div
                key={index}
                className="aspect-square relative rounded-lg overflow-hidden cursor-pointer"
              >
                <img
                  src={image}
                  alt={`${product.name} view ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <p className="text-2xl font-semibold text-primary">
              ৳{product.price.toLocaleString()}
            </p>
          </div>

          <div>
            <h2 className="font-semibold mb-2">Description</h2>
            <p className="text-gray-600">{product.description}</p>
          </div>

          <div className="space-y-4">
            <h2 className="font-semibold">Details</h2>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(product.details).map(([key, value]) => (
                <div key={key}>
                  <span className="text-sm text-gray-500 block">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                -
              </Button>
              <span className="w-12 text-center">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
              >
                +
              </Button>
            </div>

            <Button
              size="lg"
              className="w-full"
              onClick={handleAddToCart}
            >
              কার্টে যোগ করুন
            </Button>
          </div>

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
      </div>
    </div>
  )
} 