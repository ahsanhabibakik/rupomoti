'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { useCart } from '@/hooks/useCart'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Check, MapPin, Phone, User, Wallet, ShoppingCart } from 'lucide-react'
import Image from 'next/image'
import { showToast } from '@/lib/toast'

interface CheckoutModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CheckoutModal({ open, onOpenChange }: CheckoutModalProps) {
  const { items, total, clear } = useCart()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const shipping = items.length > 0 ? 100 : 0
  const totalWithShipping = total + shipping

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Here you would typically send the order to your backend
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulated API call
      clear()
      onOpenChange(false)
      showToast.success('Order placed successfully!')
    } catch (error) {
      showToast.error('Failed to place order. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b sticky top-0 bg-background z-10">
          <DialogTitle>Checkout</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6">
          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            {/* Order Summary */}
            <div>
              <h3 className="font-medium mb-4">Order Summary</h3>
              <div className="rounded-md border p-4 space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative h-16 w-16 rounded overflow-hidden flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium line-clamp-1">{item.name}</h4>
                      <div className="text-sm text-muted-foreground">
                        <span>৳{item.price.toLocaleString()}</span>
                        <span className="mx-2">×</span>
                        <span>{item.quantity}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="font-medium mb-4">Contact Information</h3>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <Input
                      id="name"
                      placeholder="Enter your full name"
                      required
                      className="pl-10"
                    />
                    <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      required
                      className="pl-10"
                    />
                    <Phone className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="address">Delivery Address</Label>
                  <div className="relative">
                    <Textarea
                      id="address"
                      placeholder="Enter your delivery address"
                      required
                      className="min-h-[100px] pl-10 resize-none"
                    />
                    <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <h3 className="font-medium mb-4">Payment Method</h3>
              <RadioGroup defaultValue="cash" className="grid gap-4">
                <div className="flex items-center space-x-2 rounded-md border p-4">
                  <RadioGroupItem value="cash" id="cash" />
                  <Label htmlFor="cash" className="flex-1">Cash on Delivery</Label>
                  <Wallet className="h-5 w-5 text-muted-foreground" />
                </div>
              </RadioGroup>
            </div>

            {/* Order Total */}
            <div className="space-y-4">
              <h3 className="font-medium">Order Total</h3>
              <div className="rounded-lg border p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>৳{total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>৳{shipping.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>৳{totalWithShipping.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-background pt-4 pb-6 border-t">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    <span>Place Order</span>
                  </div>
                )}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
} 