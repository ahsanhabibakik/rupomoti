'use client'

import { useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { useCart } from '@/contexts/CartContext'
import { ShoppingCart, Plus, Minus, X } from 'lucide-react'
import { CheckoutModal } from './CheckoutModal'

export function CartDrawer() {
  const { state, updateQuantity, removeItem } = useCart()
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <ShoppingCart className="h-5 w-5" />
            {state.itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {state.itemCount}
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-lg flex flex-col">
          <SheetHeader>
            <SheetTitle>আপনার কার্ট</SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-auto py-4">
            {state.items.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                আপনার কার্ট খালি
              </div>
            ) : (
              <div className="space-y-4">
                {state.items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-gray-500">
                        ৳{item.price.toLocaleString()}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t pt-4 space-y-4">
            <div className="flex justify-between text-lg font-medium">
              <span>মোট</span>
              <span>৳{state.total.toLocaleString()}</span>
            </div>
            <Button
              className="w-full"
              size="lg"
              disabled={state.items.length === 0}
              onClick={() => setIsCheckoutOpen(true)}
            >
              অর্ডার করুন
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <CheckoutModal
        open={isCheckoutOpen}
        onOpenChange={setIsCheckoutOpen}
      />
    </>
  )
} 