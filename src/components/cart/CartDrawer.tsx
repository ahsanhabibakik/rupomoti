'use client'

import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import { removeItem, updateQuantity, clearCart } from '@/redux/features/cartSlice'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { ShoppingCart, Trash2, Plus, Minus } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export function CartDrawer() {
  const dispatch = useDispatch()
  const router = useRouter()
  const { items, total, itemCount } = useSelector((state: RootState) => state.cart)

  const handleRemoveItem = (id: string) => {
    dispatch(removeItem(id))
  }

  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return
    dispatch(updateQuantity({ id, quantity }))
  }

  const handleCheckout = () => {
    router.push('/checkout')
  }

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {itemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
              {itemCount}
            </span>
          )}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Your Cart</DrawerTitle>
            <DrawerDescription>
              {itemCount === 0
                ? 'Your cart is empty'
                : `You have ${itemCount} item${itemCount === 1 ? '' : 's'} in your cart`}
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4">
            {items.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Add some items to your cart</p>
                <Button asChild className="mt-4">
                  <Link href="/products">Browse Products</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="relative h-20 w-20 flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        ${item.price.toFixed(2)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleRemoveItem(item.id)}
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
            <DrawerFooter>
              <div className="flex justify-between items-center mb-4">
                <span className="font-medium">Total:</span>
                <span className="font-bold">${total.toFixed(2)}</span>
              </div>
              <Button onClick={handleCheckout}>Proceed to Checkout</Button>
              <DrawerClose asChild>
                <Button variant="outline">Continue Shopping</Button>
              </DrawerClose>
            </DrawerFooter>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
} 