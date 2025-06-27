'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Package, CreditCard, Banknote, MapPin, User, Phone, MapPinIcon, MessageSquare, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { DialogTitle } from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatPrice } from '@/lib/utils'
import Image from 'next/image'
import { useAppSelector, useAppDispatch } from '@/redux/hooks'
import { selectCartItems, clearCart } from '@/redux/slices/cartSlice'
import { showToast } from '@/lib/toast'
import { useSession } from 'next-auth/react'

interface CheckoutModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

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
  'OUTSIDE_DHAKA': {
    name: 'Outside Dhaka',
    fee: 90,
    description: 'Outside Dhaka division',
    icon: MapPin,
  },
  'PERIPHERAL_DHAKA': {
    name: 'Peripheral Dhaka',
    fee: 120,
    description: 'Near Dhaka (Savar, Gazipur, Narayanganj)',
    icon: MapPinIcon,
  },
}

const PAYMENT_METHODS = [
  {
    id: 'CASH_ON_DELIVERY',
    name: 'Cash on Delivery',
    description: 'Pay when you receive your order',
    icon: Banknote,
  },
  {
    id: 'BANK_TRANSFER',
    name: 'Bank Transfer',
    description: 'Transfer to our bank account',
    icon: CreditCard,
  },
]

// Add mock data for city, zone, area
const CITIES = [
  { value: 'dhaka', label: 'Dhaka' },
  { value: 'chittagong', label: 'Chittagong' },
  { value: 'rajshahi', label: 'Rajshahi' },
  { value: 'khulna', label: 'Khulna' },
  { value: 'barishal', label: 'Barishal' },
  { value: 'sylhet', label: 'Sylhet' },
  { value: 'rangpur', label: 'Rangpur' },
  { value: 'mymensingh', label: 'Mymensingh' },
]
const ZONES = [
  { value: 'zone1', label: 'Zone 1' },
  { value: 'zone2', label: 'Zone 2' },
  { value: 'zone3', label: 'Zone 3' },
]
const AREAS = [
  { value: 'area1', label: 'Area 1' },
  { value: 'area2', label: 'Area 2' },
  { value: 'area3', label: 'Area 3' },
]

interface FormData {
  name: string
  phone: string
  email: string
  city: string
  zone: string
  area: string
  address: string
  note: string
}

interface FormErrors {
  name?: string
  phone?: string
  email?: string
  city?: string
  zone?: string
  area?: string
  address?: string
  note?: string
}

export function CheckoutModal({ open, onOpenChange }: CheckoutModalProps) {
  const dispatch = useAppDispatch()
  const { data: session } = useSession()
  const items = useAppSelector(selectCartItems)
  const [deliveryZone, setDeliveryZone] = useState<DeliveryZoneKey>('INSIDE_DHAKA')
  const [paymentMethod, setPaymentMethod] = useState('CASH_ON_DELIVERY')
  const [addresses, setAddresses] = useState<any[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string>('')
  const [formData, setFormData] = useState<FormData>({
    name: session?.user?.name || '',
    phone: '',
    email: session?.user?.email || '',
    city: '',
    zone: '',
    area: '',
    address: '',
    note: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load user's saved addresses
  useEffect(() => {
    if (session?.user && open) {
      fetch('/api/addresses')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setAddresses(data)
            // Auto-select default address if available
            const defaultAddress = data.find(addr => addr.isDefault)
            if (defaultAddress) {
              setSelectedAddressId(defaultAddress.id)
              setFormData(prev => ({
                ...prev,
                name: defaultAddress.name,
                phone: defaultAddress.phone,
                city: defaultAddress.city,
                address: `${defaultAddress.street}, ${defaultAddress.city}, ${defaultAddress.state} ${defaultAddress.postalCode}`,
              }))
            }
          }
        })
        .catch(err => console.error('Failed to load addresses:', err))
    }
  }, [session, open])

  // Handle address selection
  const handleAddressSelect = (addressId: string) => {
    setSelectedAddressId(addressId)
    const address = addresses.find(addr => addr.id === addressId)
    if (address) {
      setFormData(prev => ({
        ...prev,
        name: address.name,
        phone: address.phone,
        city: address.city,
        address: `${address.street}, ${address.city}, ${address.state} ${address.postalCode}`,
      }))
    }
  }

  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0)
  const deliveryFee = DELIVERY_ZONES[deliveryZone].fee
  const total = subtotal + deliveryFee

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
    else if (!/^([+]8801|01)[3-9]\d{8}$/.test(formData.phone.trim())) newErrors.phone = 'Please enter a valid Bangladeshi phone number'
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email.trim())) newErrors.email = 'Invalid email address'
    if (!formData.address.trim()) newErrors.address = 'Delivery address is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
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
      const orderData = {
        recipientName: formData.name.trim(),
        recipientPhone: formData.phone.trim(),
        recipientEmail: formData.email.trim() || '',
        recipientCity: formData.city || '',
        recipientZone: formData.zone || '',
        recipientArea: formData.area || '',
        deliveryAddress: formData.address.trim(),
        orderNote: formData.note.trim() || '',
        deliveryZone,
        items: items.map(item => ({
          productId: item.id,
          name:       item.name,
          price:      item.price,
          quantity:   item.quantity,
          image:      item.image,
        })),
        subtotal,
        deliveryFee,
        total,
        paymentMethod,
        userId: session?.user?.id || null,
        orderNumber: generateOrderNumber(),
      };
      
      console.log("orderData", orderData);

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Failed to create order')
      dispatch(clearCart())
      onOpenChange(false)
      showToast.success(`Order #${orderData.orderNumber} placed successfully! We'll contact you soon.`)
      setFormData({
        name: session?.user?.name || '',
        phone: '',
        email: session?.user?.email || '',
        city: '',
        zone: '',
        area: '',
        address: '',
        note: '',
      })
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

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => onOpenChange(false)}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl bg-white rounded-lg shadow-xl z-50 max-h-[90vh] overflow-hidden"
          >
            <DialogTitle className="sr-only">Checkout</DialogTitle>
            <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-pearl-500 to-pearl-600 text-white">
              <h2 className="text-xl font-semibold">Complete Your Order</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="text-white hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column - Order Details */}
                  <div className="space-y-6">
                    {/* Order Items */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Package className="h-5 w-5 text-pearl-600" />
                        Order Items ({items.length})
                      </h3>
                      <div className="space-y-3 max-h-64 overflow-y-auto bg-gray-50 rounded-lg p-4">
                        {items.map((item: any) => (
                          <div
                            key={item.id}
                            className="flex items-center space-x-4 p-3 bg-white rounded-lg shadow-sm"
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
                              <h4 className="text-sm font-medium line-clamp-2">
                                {item.name}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {formatPrice(item.price)} × {item.quantity}
                              </p>
                            </div>
                            <div className="text-sm font-medium text-pearl-600">
                              {formatPrice(item.price * item.quantity)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Delivery Zone Selection */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-pearl-600" />
                        Delivery Zone
                      </h3>
                      <RadioGroup
                        value={deliveryZone}
                        onValueChange={(value) => setDeliveryZone(value as DeliveryZoneKey)}
                        className="grid grid-cols-1 gap-4"
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
                              className="flex items-center justify-between rounded-lg border-2 border-gray-200 bg-white p-4 hover:bg-gray-50 cursor-pointer peer-data-[state=checked]:border-pearl-600 peer-data-[state=checked]:bg-pearl-50"
                            >
                              <div className="flex items-center space-x-3">
                                <zone.icon className="h-5 w-5 text-pearl-600" />
                                <div>
                                  <p className="font-medium">{zone.name}</p>
                                  <p className="text-sm text-gray-600">{zone.description}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-pearl-600">৳{zone.fee}</p>
                              </div>
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    {/* Payment Method */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-pearl-600" />
                        Payment Method
                      </h3>
                      <RadioGroup
                        value={paymentMethod}
                        onValueChange={setPaymentMethod}
                        className="grid grid-cols-1 gap-4"
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
                              className="flex items-center space-x-3 rounded-lg border-2 border-gray-200 bg-white p-4 hover:bg-gray-50 cursor-pointer peer-data-[state=checked]:border-pearl-600 peer-data-[state=checked]:bg-pearl-50"
                            >
                              <method.icon className="h-5 w-5 text-pearl-600" />
                              <div>
                                <p className="font-medium">{method.name}</p>
                                <p className="text-sm text-gray-600">{method.description}</p>
                              </div>
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  </div>

                  {/* Right Column - Customer Details & Summary */}
                  <div className="space-y-6">
                    {/* Customer Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <User className="h-5 w-5 text-pearl-600" />
                        Customer Information
                      </h3>
                      
                      {/* Saved Addresses Selection */}
                      {session?.user && addresses.length > 0 && (
                        <div className="mb-4">
                          <Label className="text-sm font-medium mb-2 block">Use Saved Address</Label>
                          <Select
                            value={selectedAddressId}
                            onValueChange={handleAddressSelect}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a saved address" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">Enter address manually</SelectItem>
                              {addresses.map((address) => (
                                <SelectItem key={address.id} value={address.id}>
                                  <div className="flex flex-col">
                                    <span className="font-medium">{address.name}</span>
                                    <span className="text-sm text-gray-600">
                                      {address.street}, {address.city}, {address.state} {address.postalCode}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="name" className="flex items-center text-sm font-medium text-gray-700">
                            <User className="w-4 h-4 mr-2" /> Full Name
                          </Label>
                          <Input
                            id="name"
                            placeholder="e.g. Jannatul Ferdous"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            className={`mt-1 ${errors.name ? 'border-red-500' : ''}`}
                            required
                          />
                          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>
                        <div>
                          <Label htmlFor="phone" className="text-sm font-medium">Phone Number *</Label>
                          <Input id="phone" type="tel" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} className={`mt-1 ${errors.phone ? 'border-red-500' : ''}`} placeholder="01XXXXXXXXX" disabled={isSubmitting} />
                          {errors.phone && (<p className="text-sm text-red-500 mt-1">{errors.phone}</p>)}
                        </div>
                        <div>
                          <Label htmlFor="email" className="text-sm font-medium">Email (optional)</Label>
                          <Input id="email" type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} className={`mt-1 ${errors.email ? 'border-red-500' : ''}`} placeholder="Enter your email" disabled={isSubmitting} />
                          {errors.email && (<p className="text-sm text-red-500 mt-1">{errors.email}</p>)}
                        </div>
                        <div>
                          <Label htmlFor="city" className="text-sm font-medium">City *</Label>
                          <Select onValueChange={(value) => handleInputChange('city', value)} value={formData.city} disabled={isSubmitting}>
                            <SelectTrigger className={`mt-1 w-full ${errors.city ? 'border-red-500' : ''}`}>
                              <SelectValue placeholder="Select city" />
                            </SelectTrigger>
                            <SelectContent>
                              {CITIES.map(city => <SelectItem key={city.value} value={city.value}>{city.label}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          {errors.city && (<p className="text-sm text-red-500 mt-1">{errors.city}</p>)}
                        </div>
                        <div>
                          <Label htmlFor="zone" className="text-sm font-medium">Zone *</Label>
                          <Select onValueChange={(value) => handleInputChange('zone', value)} value={formData.zone} disabled={isSubmitting}>
                            <SelectTrigger className={`mt-1 w-full ${errors.zone ? 'border-red-500' : ''}`}>
                              <SelectValue placeholder="Select zone" />
                            </SelectTrigger>
                            <SelectContent>
                              {ZONES.map(zone => <SelectItem key={zone.value} value={zone.value}>{zone.label}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          {errors.zone && (<p className="text-sm text-red-500 mt-1">{errors.zone}</p>)}
                        </div>
                        <div>
                          <Label htmlFor="area" className="text-sm font-medium">Area *</Label>
                          <Select onValueChange={(value) => handleInputChange('area', value)} value={formData.area} disabled={isSubmitting}>
                            <SelectTrigger className={`mt-1 w-full ${errors.area ? 'border-red-500' : ''}`}>
                              <SelectValue placeholder="Select area" />
                            </SelectTrigger>
                            <SelectContent>
                              {AREAS.map(area => <SelectItem key={area.value} value={area.value}>{area.label}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          {errors.area && (<p className="text-sm text-red-500 mt-1">{errors.area}</p>)}
                        </div>
                        <div>
                          <Label htmlFor="address" className="text-sm font-medium">Delivery Address *</Label>
                          <Textarea id="address" value={formData.address} onChange={(e) => handleInputChange('address', e.target.value)} className={`mt-1 ${errors.address ? 'border-red-500' : ''}`} placeholder="Enter your complete delivery address" rows={3} disabled={isSubmitting} />
                          {errors.address && (<p className="text-sm text-red-500 mt-1">{errors.address}</p>)}
                        </div>
                        <div>
                          <Label htmlFor="note" className="text-sm font-medium">Order Note (Optional)</Label>
                          <Textarea id="note" value={formData.note} onChange={(e) => handleInputChange('note', e.target.value)} className="mt-1" placeholder="Any special instructions for delivery" rows={2} disabled={isSubmitting} />
                        </div>
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div className="space-y-4 bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold">Order Summary</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Subtotal ({items.length} items)</span>
                          <span>{formatPrice(subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Delivery Fee</span>
                          <span>{formatPrice(deliveryFee)}</span>
                        </div>
                        <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                          <span>Total</span>
                          <span className="text-pearl-600">{formatPrice(total)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Place Order Button */}
                    <Button
                      type="submit"
                      className="w-full bg-pearl-600 hover:bg-pearl-700 text-white py-3 text-lg font-semibold"
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
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}