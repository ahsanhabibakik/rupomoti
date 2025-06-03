'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { useCart } from '@/contexts/CartContext'
import productsData from '@/data/products.json'

interface CheckoutModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface FormData {
  name: string
  phone: string
  address: string
  deliveryArea: keyof typeof productsData.deliveryAreas
  paymentMethod: 'cod' | 'bkash'
}

const initialFormData: FormData = {
  name: '',
  phone: '',
  address: '',
  deliveryArea: 'insideDhaka',
  paymentMethod: 'cod'
}

export function CheckoutModal({ open, onOpenChange }: CheckoutModalProps) {
  const { state, clearCart } = useCart()
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [errors, setErrors] = useState<Partial<FormData>>({})

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
      // Here you would typically send the order to your backend
      // For now, we'll just show a success message
      clearCart()
      onOpenChange(false)
      alert('অর্ডার সফল হয়েছে! আমাদের প্রতিনিধি শীঘ্রই আপনার সাথে যোগাযোগ করবেন।')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] h-[90vh] sm:h-auto overflow-y-auto">
        <DialogTitle>অর্ডার ফর্ম</DialogTitle>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-4">
            <Label>ডেলিভারি এলাকা</Label>
            <RadioGroup
              value={formData.deliveryArea}
              onValueChange={(value: FormData['deliveryArea']) =>
                setFormData({ ...formData, deliveryArea: value })
              }
            >
              {Object.entries(productsData.deliveryAreas).map(([key, area]) => (
                <div key={key} className="flex items-center space-x-2">
                  <RadioGroupItem value={key} id={key} />
                  <Label htmlFor={key}>
                    {area.name} - ৳{area.charge}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-4">
            <Label>পেমেন্ট মেথড</Label>
            <RadioGroup
              value={formData.paymentMethod}
              onValueChange={(value: FormData['paymentMethod']) =>
                setFormData({ ...formData, paymentMethod: value })
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cod" id="cod" />
                <Label htmlFor="cod">ক্যাশ অন ডেলিভারি</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="bkash" id="bkash" />
                <Label htmlFor="bkash">বিকাশ - 01XXXXXXXXX</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">নাম</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">ফোন নম্বর</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && (
                <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
              )}
            </div>

            <div>
              <Label htmlFor="address">ডেলিভারি ঠিকানা</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className={errors.address ? 'border-red-500' : ''}
              />
              {errors.address && (
                <p className="text-sm text-red-500 mt-1">{errors.address}</p>
              )}
            </div>
          </div>

          <div className="space-y-2 border-t pt-4">
            <div className="flex justify-between">
              <span>মোট পণ্যের দাম</span>
              <span>৳{state.total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>ডেলিভারি চার্জ</span>
              <span>৳{deliveryCharge}</span>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span>সর্বমোট</span>
              <span>৳{total.toLocaleString()}</span>
            </div>
          </div>

          <Button type="submit" className="w-full">
            অর্ডার কনফার্ম করুন
          </Button>

          {formData.paymentMethod === 'cod' && (
            <p className="text-sm text-gray-500 text-center">
              আমাদের প্রতিনিধি অর্ডার কনফার্ম করতে আপনার সাথে যোগাযোগ করবেন
            </p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
} 