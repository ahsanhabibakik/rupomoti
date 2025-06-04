'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useCart } from '@/contexts/CartContext'
import { showToast } from '@/lib/toast'
import { cn } from '@/lib/utils'

// Mock product data - replace with your actual data fetching logic
const product = {
  id: '1',
  name: 'Classic Pearl Necklace',
  description: 'Elegant single-strand freshwater pearl necklace with sterling silver clasp',
  price: 2999,
  images: [
    '/images/products/necklace1.jpg',
    '/images/products/necklace2.jpg',
    '/images/products/necklace3.jpg',
    '/images/products/necklace4.jpg',
  ],
}

export default function ProductPage({ params }: { params: { id: string } }) {
  const [selectedImage, setSelectedImage] = useState(0)
  const { addItem } = useCart()

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images[0],
    })
    showToast.success(`${product.name} has been added to your cart.`)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
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
                className={cn(
                  "relative aspect-square overflow-hidden rounded-lg bg-gray-100",
                  selectedImage === index && "ring-2 ring-primary"
                )}
              >
                <Image
                  src={image}
                  alt={`${product.name} ${index + 1}`}
                  className="object-cover"
                  fill
                  sizes="(min-width: 1024px) 15vw, 25vw"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="mt-2 text-2xl font-semibold text-primary">
              ৳{product.price.toLocaleString()}
            </p>
          </div>

          <div className="prose max-w-none">
            <p>{product.description}</p>
          </div>

          <Button
            size="lg"
            className="w-full"
            onClick={handleAddToCart}
          >
            Add to Cart
          </Button>

          <div className="space-y-4 border-t pt-6">
            <div>
              <h3 className="text-sm font-medium">Free Delivery</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Enter your postal code for delivery availability
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium">Returns</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Free 30-day returns. See our return policy for more details.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 