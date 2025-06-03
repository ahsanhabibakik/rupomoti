'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useCart } from '@/contexts/CartContext'
import { ShoppingBag, Plus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface ProductCardProps {
  id: string
  name: string
  description: string
  price: number
  image: string
}

export function ProductCard({ id, name, description, price, image }: ProductCardProps) {
  const { addItem } = useCart()
  const { toast } = useToast()

  const handleAddToCart = () => {
    addItem({
      id,
      name,
      price,
      quantity: 1,
      image,
    })
    toast({
      title: "Added to Cart",
      description: `${name} has been added to your cart.`,
      variant: "success",
    })
  }

  return (
    <Card className="overflow-hidden group h-full flex flex-col">
      <Link href={`/product/${id}`} className="relative aspect-square overflow-hidden">
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors z-10" />
        <Image
          src={image}
          alt={name}
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          priority
        />
      </Link>
      <CardContent className="p-3 sm:p-4 flex flex-col flex-1">
        <Link href={`/product/${id}`} className="flex-1">
          <h3 className="text-sm sm:text-base font-medium group-hover:text-primary transition-colors line-clamp-2 mb-1">
            {name}
          </h3>
          <p className="text-muted-foreground text-xs line-clamp-2 mb-2">
            {description}
          </p>
        </Link>
        <div className="flex items-center justify-between gap-2">
          <p className="font-medium text-sm sm:text-base">
            ৳{price.toLocaleString()}
          </p>
          <Button
            size="icon"
            className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors shrink-0"
            onClick={handleAddToCart}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 