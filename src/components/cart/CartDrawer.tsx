'use client'

import { useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { useCart } from '@/contexts/CartContext'
import { ShoppingCart, Plus, Minus, X } from 'lucide-react'
import { CheckoutModal } from './CheckoutModal'
import Image from 'next/image'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'

export function CartDrawer() {
  const { state, updateQuantity, removeItem } = useCart()
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const { toast } = useToast()

  const subtotal = state.total
  const shipping = state.items.length > 0 ? 100 : 0
  const total = subtotal + shipping

  const handleRemoveItem = (id: string, name: string) => {
    removeItem(id)
    toast({
      title: "Item Removed",
      description: `${name} has been removed from your cart.`,
      variant: "info",
    })
  }

  const handleUpdateQuantity = (id: string, newQuantity: number, name: string) => {
    updateQuantity(id, newQuantity)
    if (newQuantity === 0) {
      toast({
        title: "Item Removed",
        description: `${name} has been removed from your cart.`,
        variant: "info",
      })
    } else {
      toast({
        title: "Quantity Updated",
        description: `${name} quantity has been updated to ${newQuantity}.`,
        variant: "success",
      })
    }
  }

  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="relative">
            <ShoppingCart className="h-5 w-5" />
            {state.items.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground w-5 h-5 rounded-full text-xs flex items-center justify-center">
                {state.items.length}
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent className="flex flex-col w-full sm:max-w-lg p-0">
          <SheetHeader className="px-6 py-4 border-b">
            <SheetTitle>Shopping Cart ({state.items.length})</SheetTitle>
          </SheetHeader>

          {state.items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
              <ShoppingCart className="w-12 h-12 text-muted-foreground" />
              <div className="space-y-1">
                <h3 className="font-medium text-lg">Your cart is empty</h3>
                <p className="text-sm text-muted-foreground">Add items to your cart to continue shopping</p>
              </div>
              <SheetClose asChild>
                <Button>Continue Shopping</Button>
              </SheetClose>
            </div>
          ) : (
            <div className="flex flex-col h-[calc(100vh-6rem)]">
              <div className="flex-1 overflow-y-auto">
                <div className="px-6 divide-y">
                  {state.items.map((item) => (
                    <div key={item.id} className="py-4 flex gap-4">
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <h4 className="font-medium line-clamp-2">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">৳{item.price.toLocaleString()}</p>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleUpdateQuantity(item.id, Math.max(0, item.quantity - 1), item.name)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1, item.name)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleRemoveItem(item.id, item.name)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t p-6 space-y-4 bg-background">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">সাবটোটাল</span>
                    <span>৳{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">ডেলিভারি চার্জ</span>
                    <span>৳{shipping.toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-medium">
                    <span>মোট</span>
                    <span>৳{total.toLocaleString()}</span>
                  </div>
                </div>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => setIsCheckoutOpen(true)}
                >
                  অর্ডার করুন
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <CheckoutModal
        open={isCheckoutOpen}
        onOpenChange={setIsCheckoutOpen}
      />
    </>
  )
} 