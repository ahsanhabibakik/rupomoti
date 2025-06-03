'use client'

import Link from 'next/link'
import Image from 'next/image'
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
          <Image
            src={image}
            alt={name}
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
        </div>
      </Link>
      <CardContent className="p-4 sm:p-6">
        <Link href={`/product/${id}`}>
          <h3 className="text-base sm:text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
            {name}
          </h3>
        </Link>
        <p className="text-gray-600 text-xs sm:text-sm line-clamp-2 mb-3 sm:mb-4">
          {description}
        </p>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
          <p className="font-medium text-base sm:text-lg">
            ৳{price.toLocaleString()}
          </p>
          <Button
            size="sm"
            className="w-full sm:w-auto bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors"
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