'use client'

import Link from 'next/link'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useCart } from '@/contexts/CartContext'

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
        <div className="relative h-64 overflow-hidden">
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors z-10" />
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
        </div>
      </Link>
      <CardContent className="p-4">
        <Link href={`/product/${id}`}>
          <h3 className="text-lg font-semibold mb-2 hover:text-primary transition-colors">
            {name}
          </h3>
        </Link>
        <p className="text-gray-600 text-sm line-clamp-2 mb-4">
          {description}
        </p>
        <p className="font-medium text-lg">
          ৳{price.toLocaleString()}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full"
          onClick={handleAddToCart}
        >
          কার্টে যোগ করুন
        </Button>
      </CardFooter>
    </Card>
  )
} 