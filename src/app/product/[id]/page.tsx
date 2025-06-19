'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useAppDispatch } from '@/redux/hooks'
import { addToCart, toggleCart } from '@/redux/slices/cartSlice'
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
  const dispatch = useAppDispatch()

  const handleAddToCart = () => {
    dispatch(addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      quantity: 1,
      category: 'necklaces', // Placeholder, update as needed
    }))
    dispatch(toggleCart())
    showToast.success(`${product.name} has been added to your cart.`)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-8 md:grid-cols-2">
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
          <div className="grid grid-cols-4 gap-4">
            {product.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={cn(
                  'relative aspect-square overflow-hidden rounded-lg border',
                  selectedImage === index && 'ring-2 ring-primary'
                )}
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
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="mt-4 text-lg text-muted-foreground">{product.description}</p>
          </div>

          <div className="space-y-4">
            <div className="text-3xl font-bold">৳{product.price.toLocaleString()}</div>
            <Button size="lg" onClick={handleAddToCart}>
              Add to Cart
            </Button>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Product Details</h2>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li>Freshwater pearls</li>
              <li>Sterling silver clasp</li>
              <li>Adjustable length</li>
              <li>Handcrafted in Bangladesh</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Shipping Information</h2>
            <div className="prose text-muted-foreground">
              <p>Free shipping on orders over ৳10,000</p>
              <p>Delivery within 3-5 business days</p>
              <p>30-day return policy</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 