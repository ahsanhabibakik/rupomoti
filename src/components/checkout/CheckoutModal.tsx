'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Package, CreditCard, Banknote } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { useCart } from '@/hooks/useCart'
import { formatPrice } from '@/lib/utils'
import Image from 'next/image'

interface CheckoutModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const DELIVERY_AREAS = {
  'inside-dhaka': {
    name: 'Inside Dhaka',
    fee: 100,
  },
  'outside-dhaka': {
    name: 'Outside Dhaka',
    fee: 150,
  },
  'surrounding-dhaka': {
    name: 'Surrounding Dhaka',
    fee: 120,
  },
}

const PAYMENT_METHODS = [
  {
    id: 'cash',
    name: 'Cash on Delivery',
    icon: Banknote,
  },
  {
    id: 'bank',
    name: 'Bank Transfer',
    icon: CreditCard,
  },
]

export function CheckoutModal({ open, onOpenChange }: CheckoutModalProps) {
  const { items, clearCart } = useCart()
  const [deliveryArea, setDeliveryArea] = useState('inside-dhaka')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    note: '',
  })

  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0)
  const deliveryFee = DELIVERY_AREAS[deliveryArea as keyof typeof DELIVERY_AREAS].fee
  const total = subtotal + deliveryFee

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Handle order submission
    console.log({
      items,
      deliveryArea,
      paymentMethod,
      ...formData,
      total,
    })
    // Clear cart and close modal
    clearCart()
    onOpenChange(false)
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => onOpenChange(false)}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-lg shadow-xl z-50"
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Checkout</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-6">
              {/* Order Items */}
              <div className="space-y-4">
                <h3 className="font-medium">Order Items</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center space-x-4 p-2 rounded-lg bg-pearl-50"
                    >
                      <div className="relative h-16 w-16 flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover rounded-md"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium line-clamp-1">
                          {item.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {formatPrice(item.price)} × {item.quantity}
                        </p>
                      </div>
                      <div className="text-sm font-medium">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Information */}
              <div className="space-y-4">
                <h3 className="font-medium">Delivery Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Delivery Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="note">Order Note (Optional)</Label>
                  <Textarea
                    id="note"
                    value={formData.note}
                    onChange={(e) =>
                      setFormData({ ...formData, note: e.target.value })
                    }
                    placeholder="Add any special instructions for delivery"
                  />
                </div>
              </div>

              {/* Delivery Area */}
              <div className="space-y-4">
                <h3 className="font-medium">Delivery Area</h3>
                <RadioGroup
                  value={deliveryArea}
                  onValueChange={setDeliveryArea}
                  className="grid grid-cols-3 gap-4"
                >
                  {Object.entries(DELIVERY_AREAS).map(([id, area]) => (
                    <div key={id}>
                      <RadioGroupItem
                        value={id}
                        id={id}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={id}
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-pearl-600 [&:has([data-state=checked])]:border-pearl-600"
                      >
                        <Package className="mb-3 h-6 w-6" />
                        <div className="text-center">
                          <p className="text-sm font-medium">{area.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatPrice(area.fee)}
                          </p>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Payment Method */}
              <div className="space-y-4">
                <h3 className="font-medium">Payment Method</h3>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                  className="grid grid-cols-2 gap-4"
                >
                  {PAYMENT_METHODS.map((method) => (
                    <div key={method.id}>
                      <RadioGroupItem
                        value={method.id}
                        id={method.id}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={method.id}
                        className="flex items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-pearl-600 [&:has([data-state=checked])]:border-pearl-600"
                      >
                        <div className="flex items-center space-x-2">
                          <method.icon className="h-5 w-5" />
                          <span className="text-sm font-medium">
                            {method.name}
                          </span>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Order Summary */}
              <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery</span>
                  <span>{formatPrice(deliveryFee)}</span>
                </div>
                <div className="flex justify-between font-medium pt-2 border-t">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-pearl-600 hover:bg-pearl-700"
              >
                Place Order
              </Button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
} 