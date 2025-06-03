'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { useCart } from '@/contexts/CartContext'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Check, MapPin, Phone, User, Wallet, ShoppingCart } from 'lucide-react'
import productsData from '@/data/products.json'
import Image from 'next/image'

interface CheckoutModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface FormData {
  name: string
  phone: string
  address: string
  deliveryArea: keyof typeof productsData.deliveryAreas
  paymentMethod: 'cod' | 'bkash' | 'bank'
  orderNote?: string
  bkashNumber?: string
}

const initialFormData: FormData = {
  name: '',
  phone: '',
  address: '',
  deliveryArea: 'insideDhaka',
  paymentMethod: 'cod',
  orderNote: '',
  bkashNumber: ''
}

export function CheckoutModal({ open, onOpenChange }: CheckoutModalProps) {
  const { state, clearCart } = useCart()
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [errors, setErrors] = useState<Partial<FormData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const deliveryCharge = productsData.deliveryAreas[formData.deliveryArea].charge
  const total = state.total + deliveryCharge

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Partial<FormData> = {}

    if (formData.name.length < 3) {
      newErrors.name = 'নাম কমপক্ষে ৩ অক্ষরের হতে হবে'
    }

    const phoneRegex = /^(?:\+88|88)?01[3-9]\d{8}$/
    if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = 'সঠিক বাংলাদেশী ফোন নম্বর দিন'
    }

    if (formData.address.length < 10) {
      newErrors.address = 'বিস্তারিত ঠিকানা দিন'
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true)
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500))
        clearCart()
        onOpenChange(false)
        alert('অর্ডার সফল হয়েছে! আমাদের প্রতিনিধি শীঘ্রই আপনার সাথে যোগাযোগ করবেন।')
      } catch (error) {
        alert('দুঃখিত! কিছু সমস্যা হয়েছে। আবার চেষ্টা করুন।')
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>অর্ডার ফর্ম</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[80vh]">
          <form onSubmit={handleSubmit} className="space-y-6 px-6 py-4">
            {/* Order Products Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-medium">
                <ShoppingCart className="h-5 w-5" />
                <h3>অর্ডার পণ্য</h3>
              </div>
              <div className="space-y-3 bg-secondary/10 rounded-lg p-3">
                {state.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="relative w-16 h-16 rounded-md overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <div className="flex items-center justify-between mt-1 text-sm text-muted-foreground">
                        <span>{item.quantity} × ৳{item.price.toLocaleString()}</span>
                        <span>৳{(item.quantity * item.price).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Area Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-medium">
                <MapPin className="h-5 w-5" />
                <h3>ডেলিভারি এলাকা</h3>
              </div>
              <RadioGroup
                value={formData.deliveryArea}
                onValueChange={(value: FormData['deliveryArea']) =>
                  setFormData({ ...formData, deliveryArea: value })
                }
                className="grid gap-2"
              >
                {Object.entries(productsData.deliveryAreas).map(([key, area]) => (
                  <div
                    key={key}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      formData.deliveryArea === key
                        ? 'border-primary bg-primary/5'
                        : 'hover:bg-secondary'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value={key} id={key} />
                      <Label htmlFor={key} className="font-medium cursor-pointer">
                        {area.name}
                      </Label>
                    </div>
                    <span className="font-medium">৳{area.charge}</span>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Payment Method Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-medium">
                <Wallet className="h-5 w-5" />
                <h3>পেমেন্ট মেথড</h3>
              </div>
              <RadioGroup
                value={formData.paymentMethod}
                onValueChange={(value: FormData['paymentMethod']) =>
                  setFormData({ ...formData, paymentMethod: value })
                }
                className="grid gap-2"
              >
                <div
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    formData.paymentMethod === 'cod'
                      ? 'border-primary bg-primary/5'
                      : 'hover:bg-secondary'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod" className="font-medium cursor-pointer">
                      ক্যাশ অন ডেলিভারি
                    </Label>
                  </div>
                  <Check className={`h-4 w-4 ${formData.paymentMethod === 'cod' ? 'text-primary' : 'invisible'}`} />
                </div>

                <div
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    formData.paymentMethod === 'bkash'
                      ? 'border-primary bg-primary/5'
                      : 'hover:bg-secondary'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="bkash" id="bkash" />
                    <Label htmlFor="bkash" className="font-medium cursor-pointer">
                      বিকাশ
                    </Label>
                  </div>
                  <Check className={`h-4 w-4 ${formData.paymentMethod === 'bkash' ? 'text-primary' : 'invisible'}`} />
                </div>

                <div
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    formData.paymentMethod === 'bank'
                      ? 'border-primary bg-primary/5'
                      : 'hover:bg-secondary'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="bank" id="bank" />
                    <Label htmlFor="bank" className="font-medium cursor-pointer">
                      ব্যাংক ট্রান্সফার
                    </Label>
                  </div>
                  <Check className={`h-4 w-4 ${formData.paymentMethod === 'bank' ? 'text-primary' : 'invisible'}`} />
                </div>
              </RadioGroup>

              {formData.paymentMethod === 'bkash' && (
                <div className="space-y-3 bg-secondary/10 rounded-lg p-3">
                  <div>
                    <p className="font-medium mb-2">বিকাশ নাম্বার</p>
                    <p className="text-lg font-semibold text-primary">01XXXXXXXXX</p>
                  </div>
                  <div>
                    <Label htmlFor="bkashNumber">আপনার বিকাশ নাম্বার</Label>
                    <Input
                      id="bkashNumber"
                      value={formData.bkashNumber}
                      onChange={(e) => setFormData({ ...formData, bkashNumber: e.target.value })}
                      placeholder="11 ডিজিটের মোবাইল নাম্বার"
                      className="mt-1"
                    />
                  </div>
                  <div className="text-sm space-y-1">
                    <p>১. Send Money করুন</p>
                    <p>২. রেফারেন্স: আপনার নাম</p>
                    <p>৩. স্ক্রিনশট তুলে রাখুন</p>
                  </div>
                </div>
              )}

              {formData.paymentMethod === 'bank' && (
                <div className="space-y-3 bg-secondary/10 rounded-lg p-3">
                  <div>
                    <p className="font-medium mb-2">ব্যাংক একাউন্ট</p>
                    <div className="space-y-1">
                      <p><span className="font-medium">ব্যাংক:</span> ইসলামী ব্যাংক বাংলাদেশ লিমিটেড</p>
                      <p><span className="font-medium">একাউন্ট নাম্বার:</span> XXXXXXXXXX</p>
                      <p><span className="font-medium">ব্রাঞ্চ:</span> মিরপুর-১০</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Personal Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-medium">
                <User className="h-5 w-5" />
                <h3>ব্যক্তিগত তথ্য</h3>
              </div>
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="name">নাম</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={errors.name ? 'border-destructive' : ''}
                    placeholder="আপনার সম্পূর্ণ নাম"
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">ফোন নম্বর</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={`pl-10 ${errors.phone ? 'border-destructive' : ''}`}
                      placeholder="11 ডিজিটের মোবাইল নাম্বার"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-sm text-destructive mt-1">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="address">ডেলিভারি ঠিকানা</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className={errors.address ? 'border-destructive' : ''}
                    placeholder="আপনার সম্পূর্ণ ঠিকানা"
                    rows={3}
                  />
                  {errors.address && (
                    <p className="text-sm text-destructive mt-1">{errors.address}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="orderNote">অর্ডার নোট</Label>
                  <Textarea
                    id="orderNote"
                    value={formData.orderNote}
                    onChange={(e) => setFormData({ ...formData, orderNote: e.target.value })}
                    placeholder="বিশেষ কিছু বলতে চাইলে লিখুন (অপশনাল)"
                    rows={2}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Order Summary */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">মোট পণ্যের দাম</span>
                <span>৳{state.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">ডেলিভারি চার্জ</span>
                <span>৳{deliveryCharge}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-medium text-lg">
                <span>সর্বমোট</span>
                <span>৳{total.toLocaleString()}</span>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'অর্ডার প্রসেস হচ্ছে...' : 'অর্ডার কনফার্ম করুন'}
            </Button>

            {formData.paymentMethod === 'cod' && (
              <p className="text-sm text-muted-foreground text-center">
                আমাদের প্রতিনিধি অর্ডার কনফার্ম করতে আপনার সাথে যোগাযোগ করবেন
              </p>
            )}
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
} 