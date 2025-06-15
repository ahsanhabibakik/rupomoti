'use client'

import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { removeFromCart, updateQuantity, clearCart, selectCartItems, selectCartTotal, selectCartItemCount } from '@/redux/slices/cartSlice'
import { Button } from '@/components/ui/button'
import * as Sheet from '@radix-ui/react-dialog'
import { ShoppingCart, Trash2, Plus, Minus, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { CartItem } from '@/redux/slices/cartSlice'

export function CartDrawer() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const items = useAppSelector(selectCartItems)
  const total = useAppSelector(selectCartTotal)
  const itemCount = useAppSelector(selectCartItemCount)

  const handleRemoveItem = (id: string, variantId?: string) => {
    dispatch(removeFromCart({ id, variantId }))
  }

  const handleUpdateQuantity = (id: string, quantity: number, variantId?: string) => {
    if (quantity < 1) return
    dispatch(updateQuantity({ id, quantity, variantId }))
  }

  const handleCheckout = () => {
    router.push('/checkout')
  }

  return (
    <Sheet.Root>
      <Sheet.Trigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          <div className="absolute -top-1 -right-1">
            {itemCount > 0 && (
              <div className="h-5 w-5 flex items-center justify-center p-0 text-xs bg-secondary text-secondary-foreground rounded-full">
                {itemCount}
              </div>
            )}
          </div>
        </Button>
      </Sheet.Trigger>
      <Sheet.Portal>
        <Sheet.Overlay className="fixed inset-0 bg-black/50" />
        <Sheet.Content className="fixed right-0 top-0 h-full w-full border-l bg-background p-6 shadow-lg sm:max-w-sm">
          <div className="space-y-2">
            <Sheet.Title className="text-lg font-semibold">Your Cart</Sheet.Title>
            <Sheet.Description>
              {itemCount === 0
                ? 'Your cart is empty'
                : `You have ${itemCount} item${itemCount === 1 ? '' : 's'} in your cart`}
            </Sheet.Description>
          </div>
          <div className="mt-8 flex-1 overflow-y-auto">
            {items.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Add some items to your cart</p>
                <Button asChild className="mt-4">
                  <Link href="/products">Browse Products</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item: CartItem) => (
                  <div key={item.id + (item.variantId || '')} className="flex items-center gap-4">
                    <div className="relative h-20 w-20 flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">
                        {item.name}
                        {item.variantName && (
                          <span className="text-sm text-muted-foreground"> ({item.variantName})</span>
                        )}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        ${item.price.toFixed(2)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1, item.variantId)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1, item.variantId)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleRemoveItem(item.id, item.variantId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {items.length > 0 && (
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <span className="font-medium">Total:</span>
                <span className="font-bold">${total.toFixed(2)}</span>
              </div>
              <div className="space-y-2">
                <Button onClick={handleCheckout} className="w-full">
                  Proceed to Checkout
                </Button>
                <Sheet.Close asChild>
                  <Button variant="outline" className="w-full">
                    Continue Shopping
                  </Button>
                </Sheet.Close>
              </div>
            </div>
          )}
          <Sheet.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Sheet.Close>
        </Sheet.Content>
      </Sheet.Portal>
    </Sheet.Root>
  )
} 