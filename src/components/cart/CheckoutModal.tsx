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
import { Check, MapPin, Phone, User, Wallet, ShoppingCart, CreditCard, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { showToast } from '@/lib/toast'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/redux/store'
import { clearCart } from '@/redux/slices/cartSlice'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { cn } from '@/lib/utils'

const checkoutSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(11, 'Phone number must be at least 11 digits'),
  address: z.string().min(1, 'Address is required'),
  paymentMethod: z.enum(['cash', 'bkash', 'nagad', 'rocket']),
  transactionId: z.string().optional(),
})

type CheckoutFormValues = z.infer<typeof checkoutSchema>

interface CheckoutModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CheckoutModal({ open, onOpenChange }: CheckoutModalProps) {
  const { items, total } = useSelector((state: RootState) => state.cart)
  const dispatch = useDispatch()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: '',
      phone: '',
      address: '',
      paymentMethod: 'cash',
      transactionId: '',
    },
  })

  const deliveryCharge = items.length > 0 ? 100 : 0
  const totalWithDelivery = total + deliveryCharge

  const handleSubmit = async (data: CheckoutFormValues) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          total: totalWithDelivery,
          deliveryCharge,
          customer: {
            name: data.name,
            phone: data.phone,
            address: data.address,
          },
          payment: {
            method: data.paymentMethod,
            transactionId: data.transactionId,
          },
        }),
      })

      if (!response.ok) throw new Error('Order failed')
      
      dispatch(clearCart())
      setSuccess(true)
      showToast.success('Order placed successfully!')
      onOpenChange(false)
    } catch (err) {
      showToast.error('Failed to place order. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] sm:max-w-[600px] w-[95vw] max-h-[90vh] flex flex-col p-0 bg-background border shadow-lg rounded-lg">
        <DialogHeader className="px-6 py-4 border-b sticky top-0 bg-background z-10">
          <DialogTitle className="text-xl font-semibold">Complete Your Order</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1">
          <div className="px-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 py-4">
                {/* Order Summary */}
                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="font-medium mb-4 flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Order Summary
                  </h3>
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0">
                        <div className="relative h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
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
                <div className="space-y-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Contact Information
                  </h3>
                  <div className="grid gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input placeholder="Enter your full name" className="pl-9" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input placeholder="Enter your phone number" className="pl-9" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Delivery Address</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Textarea
                                placeholder="Enter your delivery address"
                                className="resize-none pl-9"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Payment Method */}
                <div className="space-y-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Method
                  </h3>
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid grid-cols-2 gap-4"
                          >
                            <div>
                              <RadioGroupItem
                                value="cash"
                                id="cash"
                                className="peer sr-only"
                              />
                              <Label
                                htmlFor="cash"
                                className={cn(
                                  "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary",
                                  "transition-colors duration-200"
                                )}
                              >
                                <Wallet className="mb-3 h-6 w-6" />
                                Cash on Delivery
                              </Label>
                            </div>
                            <div>
                              <RadioGroupItem
                                value="bkash"
                                id="bkash"
                                className="peer sr-only"
                              />
                              <Label
                                htmlFor="bkash"
                                className={cn(
                                  "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary",
                                  "transition-colors duration-200"
                                )}
                              >
                                <CreditCard className="mb-3 h-6 w-6" />
                                bKash
                              </Label>
                            </div>
                            <div>
                              <RadioGroupItem
                                value="nagad"
                                id="nagad"
                                className="peer sr-only"
                              />
                              <Label
                                htmlFor="nagad"
                                className={cn(
                                  "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary",
                                  "transition-colors duration-200"
                                )}
                              >
                                <CreditCard className="mb-3 h-6 w-6" />
                                Nagad
                              </Label>
                            </div>
                            <div>
                              <RadioGroupItem
                                value="rocket"
                                id="rocket"
                                className="peer sr-only"
                              />
                              <Label
                                htmlFor="rocket"
                                className={cn(
                                  "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary",
                                  "transition-colors duration-200"
                                )}
                              >
                                <CreditCard className="mb-3 h-6 w-6" />
                                Rocket
                              </Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch('paymentMethod') !== 'cash' && (
                    <FormField
                      control={form.control}
                      name="transactionId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Transaction ID</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter transaction ID" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                {/* Order Total */}
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>৳{(total ?? 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Delivery Charge</span>
                    <span>৳{(deliveryCharge ?? 0).toLocaleString()}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-medium text-lg">
                    <span>Total</span>
                    <span>৳{(totalWithDelivery ?? 0).toLocaleString()}</span>
                  </div>
                </div>
              </form>
            </Form>
          </div>
        </ScrollArea>

        <div className="sticky bottom-0 bg-background border-t p-6">
          <Button
            type="submit"
            className="w-full h-12 text-base font-medium bg-primary hover:bg-primary/90"
            disabled={isSubmitting}
            onClick={form.handleSubmit(handleSubmit)}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Processing...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5" />
                <span>Place Order</span>
              </div>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 