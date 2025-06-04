'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useCart } from '@/hooks/useCart'
import { ShoppingBag, Plus } from 'lucide-react'
import { showToast } from '@/lib/toast'

interface ProductCardProps {
  id: string
  name: string
  description: string
  price: number
  image: string
}

export function ProductCard({ id, name, description, price, image }: ProductCardProps) {
  const { add } = useCart()

  const handleAddToCart = () => {
    add({
      id,
      name,
      price,
      image,
    })
    showToast.success(`${name} has been added to your cart.`)
  }

  return (
    <Card className="group overflow-hidden">
      <Link href={`/product/${id}`} className="block">
        <div className="relative aspect-square">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        </div>
      </Link>
      <CardContent className="p-4">
        <div className="space-y-1">
          <Link href={`/product/${id}`} className="block">
            <h3 className="font-medium line-clamp-1">{name}</h3>
          </Link>
          <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
          <div className="flex items-center justify-between">
            <p className="font-medium">৳{price.toLocaleString()}</p>
            <Button size="icon" onClick={handleAddToCart}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 