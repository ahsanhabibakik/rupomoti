'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Package, CreditCard, Banknote, MapPin, User, Phone, Tag, Loader2, CheckCircle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { formatPrice } from '@/lib/utils'
import Image from 'next/image'
import { useAppSelector, useAppDispatch } from '@/redux/hooks'
import { selectCartItems, clearCart } from '@/redux/slices/cartSlice'
import { showToast } from '@/lib/toast'
import { useSession } from 'next-auth/react'

type DeliveryZoneKey = 'INSIDE_DHAKA' | 'OUTSIDE_DHAKA' | 'PERIPHERAL_DHAKA'

const DELIVERY_ZONES: Record<DeliveryZoneKey, {
  name: string
  fee: number
  description: string
  icon: any
}> = {
  'INSIDE_DHAKA': {
    name: 'Inside Dhaka',
    fee: 60,
    description: 'Dhaka City Corporation area',
    icon: MapPin,
  },
  'PERIPHERAL_DHAKA': {
    name: 'Peripheral Dhaka',
    fee: 90,
    description: 'Near Dhaka (Savar, Gazipur, Narayanganj)',
    icon: MapPin,
  },
  'OUTSIDE_DHAKA': {
    name: 'Outside Dhaka',
    fee: 120,
    description: 'Outside Dhaka division',
    icon: MapPin,
  },
}

const PAYMENT_METHODS = [
  {
    id: 'CASH_ON_DELIVERY',
    name: 'Cash on Delivery',
    description: 'Pay when you receive your order',
    icon: Banknote,
    instructions: 'A representative will call you to confirm the order. You can pay when the product is delivered to your doorstep.',
  },
  {
    id: 'MOBILE_BANKING',
    name: 'Mobile Banking (bKash)',
    description: 'bKash payment',
    icon: CreditCard,
    instructions: 'Send payment to: 01XXXXXXXXX (bKash). Include your order number in the reference.',
  },
  {
    id: 'BANK_TRANSFER',
    name: 'Bank Transfer',
    description: 'Transfer to our bank account',
    icon: CreditCard,
    instructions: 'Bank: Dutch Bangla Bank Ltd.\nAccount: 123-456-789\nAccount Name: Rupomoti\nInclude order number in transfer details.',
  },
]

interface FormData {
  name: string
  phone: string
  address: string
  note: string
  couponCode: string
}

interface FormErrors {
  name?: string
  phone?: string
  address?: string
  couponCode?: string
}

interface Coupon {
  id: string
  code: string
  type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING'
  value: number
  minimumAmount?: number
  maximumDiscount?: number
}

interface Settings {
  freeShippingThreshold: number
  bkashNumber: string
  bankDetails: {
    name: string
    account: string
    accountName: string
  }
}

export default function CheckoutPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { data: session } = useSession()
  const items = useAppSelector(selectCartItems)
  
  const [deliveryZone, setDeliveryZone] = useState<DeliveryZoneKey>('INSIDE_DHAKA')
  const [paymentMethod, setPaymentMethod] = useState('CASH_ON_DELIVERY')
  const [formData, setFormData] = useState<FormData>({
    name: session?.user?.name || '',
    phone: '',
    address: '',
    note: '',
    couponCode: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null)
  const [isCouponLoading, setIsCouponLoading] = useState(false)
  const [settings, setSettings] = useState<Settings>({
    freeShippingThreshold: 1000,
    bkashNumber: '01XXXXXXXXX',
    bankDetails: {
      name: 'Dutch Bangla Bank Ltd.',
      account: '123-456-789',
      accountName: 'Rupomoti'
    }
  })

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      router.push('/shop')
    }
  }, [items, router])

  // Load settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/settings')
        if (response.ok) {
          const data = await response.json()
          setSettings(prev => ({ ...prev, ...data }))
        }
      } catch (error) {
        console.error('Error loading settings:', error)
      }
    }
    loadSettings()
  }, [])

  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0)
  const baseDeliveryFee = DELIVERY_ZONES[deliveryZone].fee
  
  // Calculate shipping (free if above threshold or coupon provides free shipping)
  const isFreeShipping = subtotal >= settings.freeShippingThreshold || appliedCoupon?.type === 'FREE_SHIPPING'
  const deliveryFee = isFreeShipping ? 0 : baseDeliveryFee
  
  // Calculate discount
  let discount = 0
  if (appliedCoupon) {
    if (appliedCoupon.type === 'PERCENTAGE') {
      discount = (subtotal * appliedCoupon.value) / 100
      if (appliedCoupon.maximumDiscount && discount > appliedCoupon.maximumDiscount) {
        discount = appliedCoupon.maximumDiscount
      }
    } else if (appliedCoupon.type === 'FIXED_AMOUNT') {
      discount = appliedCoupon.value
    }
  }

  const total = subtotal + deliveryFee - discount

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^(\+8801|01)[3-9]\d{8}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Please enter a valid Bangladeshi phone number'
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Delivery address is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const applyCoupon = async () => {
    if (!formData.couponCode.trim()) return

    setIsCouponLoading(true)
    setErrors(prev => ({ ...prev, couponCode: undefined }))

    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: formData.couponCode.trim().toUpperCase(),
          subtotal
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Invalid coupon')
      }

      setAppliedCoupon(result.coupon)
      showToast.success('Coupon applied successfully!')
    } catch (error: any) {
      setErrors(prev => ({ ...prev, couponCode: error.message }))
      showToast.error(error.message)
    } finally {
      setIsCouponLoading(false)
    }
  }

  const removeCoupon = () => {
    setAppliedCoupon(null)
    setFormData(prev => ({ ...prev, couponCode: '' }))
    showToast.success('Coupon removed')
  }

  const generateOrderNumber = (): string => {
    const timestamp = Date.now().toString()
    const random = Math.random().toString(36).substring(2, 5).toUpperCase()
    return `RP${timestamp.slice(-6)}${random}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    if (items.length === 0) {
      showToast.error('Your cart is empty')
      return
    }

    setIsSubmitting(true)

    try {
      const orderNumber = generateOrderNumber()
      
      // Prepare order data
      const orderData = {
        orderNumber,
        customer: {
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          email: session?.user?.email || null,
        },
        items: items.map((item: any) => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        subtotal,
        deliveryFee,
        discount,
        total,
        deliveryZone,
        deliveryAddress: formData.address.trim(),
        orderNote: formData.note.trim() || null,
        paymentMethod,
        userId: session?.user?.id || null,
        couponId: appliedCoupon?.id || null,
      }

      // Create order
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create order')
      }

      // Clear cart and redirect
      dispatch(clearCart())
      
      showToast.success(
        `Order #${orderNumber} placed successfully! We'll contact you soon.`
      )

      router.push(`/order-confirmation?orderNumber=${orderNumber}`)

    } catch (error: any) {
      console.error('Error creating order:', error)
      showToast.error(error.message || 'Failed to place order. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev: FormData) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev: FormErrors) => ({ ...prev, [field]: undefined }))
    }
  }

  const getPaymentInstructions = () => {
    const method = PAYMENT_METHODS.find(m => m.id === paymentMethod)
    if (!method) return ''

    let instructions = method.instructions
    if (paymentMethod === 'MOBILE_BANKING') {
      instructions = instructions.replace('01XXXXXXXXX', settings.bkashNumber)
    } else if (paymentMethod === 'BANK_TRANSFER') {
      instructions = instructions
        .replace('Dutch Bangla Bank Ltd.', settings.bankDetails.name)
        .replace('123-456-789', settings.bankDetails.account)
        .replace('Rupomoti', settings.bankDetails.accountName)
    }
    return instructions
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-600 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-4">Add some products to your cart before checkout</p>
          <Button onClick={() => router.push('/shop')}>
            Continue Shopping
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600 mt-2">Complete your order below</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Forms */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className={errors.name ? 'border-red-500' : ''}
                        placeholder="Enter your full name"
                        disabled={isSubmitting}
                      />
                      {errors.name && (
                        <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className={errors.phone ? 'border-red-500' : ''}
                        placeholder="01XXXXXXXXX"
                        disabled={isSubmitting}
                      />
                      {errors.phone && (
                        <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Delivery Address *</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className={errors.address ? 'border-red-500' : ''}
                      placeholder="Enter your complete delivery address"
                      rows={3}
                      disabled={isSubmitting}
                    />
                    {errors.address && (
                      <p className="text-sm text-red-500 mt-1">{errors.address}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="note">Order Note (Optional)</Label>
                    <Textarea
                      id="note"
                      value={formData.note}
                      onChange={(e) => handleInputChange('note', e.target.value)}
                      placeholder="Any special instructions for delivery"
                      rows={2}
                      disabled={isSubmitting}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Zone */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Delivery Zone
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={deliveryZone}
                    onValueChange={(value) => setDeliveryZone(value as DeliveryZoneKey)}
                    className="space-y-3"
                  >
                    {(Object.entries(DELIVERY_ZONES) as [DeliveryZoneKey, typeof DELIVERY_ZONES[DeliveryZoneKey]][]).map(([id, zone]) => (
                      <div key={id}>
                        <RadioGroupItem
                          value={id}
                          id={id}
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor={id}
                          className="flex items-center justify-between rounded-lg border-2 border-gray-200 bg-white p-4 hover:bg-gray-50 cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                        >
                          <div className="flex items-center space-x-3">
                            <zone.icon className="h-5 w-5 text-primary" />
                            <div>
                              <p className="font-medium">{zone.name}</p>
                              <p className="text-sm text-gray-600">{zone.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-primary">
                              {isFreeShipping ? (
                                <span className="text-green-600">FREE</span>
                              ) : (
                                `৳${zone.fee}`
                              )}
                            </p>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                    className="space-y-3"
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
                          className="flex items-center space-x-3 rounded-lg border-2 border-gray-200 bg-white p-4 hover:bg-gray-50 cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                        >
                          <method.icon className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">{method.name}</p>
                            <p className="text-sm text-gray-600">{method.description}</p>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>

                  {/* Payment Instructions */}
                  {paymentMethod && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-blue-900 mb-2">Payment Instructions:</h4>
                      <p className="text-sm text-blue-800 whitespace-pre-line">
                        {getPaymentInstructions()}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Order Summary */}
            <div className="space-y-6">
              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    Order Items ({items.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {items.map((item: any) => (
                      <div key={item.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                        <div className="relative h-12 w-12 flex-shrink-0">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium line-clamp-2">{item.name}</h4>
                          <p className="text-sm text-gray-600">
                            {formatPrice(item.price)} × {item.quantity}
                          </p>
                        </div>
                        <div className="text-sm font-medium text-primary">
                          {formatPrice(item.price * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Coupon */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5 text-primary" />
                    Coupon Code
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!appliedCoupon ? (
                    <div className="flex gap-2">
                      <Input
                        value={formData.couponCode}
                        onChange={(e) => handleInputChange('couponCode', e.target.value.toUpperCase())}
                        placeholder="Enter coupon code"
                        className={errors.couponCode ? 'border-red-500' : ''}
                        disabled={isSubmitting || isCouponLoading}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={applyCoupon}
                        disabled={!formData.couponCode.trim() || isSubmitting || isCouponLoading}
                      >
                        {isCouponLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Apply'
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-green-800">{appliedCoupon.code}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={removeCoupon}
                        className="text-green-600 hover:text-green-700"
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                  {errors.couponCode && (
                    <p className="text-sm text-red-500 mt-1">{errors.couponCode}</p>
                  )}
                </CardContent>
              </Card>

              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal ({items.length} items)</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span>
                      {isFreeShipping ? (
                        <span className="text-green-600 font-medium">FREE</span>
                      ) : (
                        formatPrice(deliveryFee)
                      )}
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Coupon Discount</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                  {subtotal >= settings.freeShippingThreshold && !appliedCoupon && (
                    <div className="text-sm text-green-600 text-center py-2 bg-green-50 rounded">
                      🎉 You've qualified for free shipping!
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(total)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Place Order Button */}
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isSubmitting || items.length === 0}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  `Place Order - ${formatPrice(total)}`
                )}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                By placing this order, you agree to our terms of service and privacy policy.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}