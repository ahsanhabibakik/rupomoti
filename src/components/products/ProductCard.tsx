'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useCart } from '@/contexts/CartContext'
import { ShoppingBag } from 'lucide-react'

interface ProductCardProps {
  id: string
  name: string
  description: string
  price: number
  image: string
}

export function ProductCard({ id, name, description, price, image }: ProductCardProps) {
  const { addItem } = useCart()

  const handleAddToCart = () => {
    addItem({
      id,
      name,
      price,
      quantity: 1,
      image,
    })
  }

  return (
    <Card className="overflow-hidden group">
      <Link href={`/product/${id}`}>
        <div className="relative aspect-square overflow-hidden">
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors z-10" />
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
      </Link>
      <CardContent className="p-6">
        <Link href={`/product/${id}`}>
          <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
            {name}
          </h3>
        </Link>
        <p className="text-gray-600 text-sm line-clamp-2 mb-4">
          {description}
        </p>
        <div className="flex items-center justify-between">
          <p className="font-medium text-lg">
            ৳{price.toLocaleString()}
          </p>
          <Button
            size="sm"
            className="bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors"
            onClick={handleAddToCart}
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 