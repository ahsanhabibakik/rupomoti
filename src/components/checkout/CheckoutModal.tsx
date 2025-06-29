'use client'

import React, { useState, useEffect } from 'react'
import { X, Package, CreditCard, Banknote, MapPin, User, Plus, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
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
}> = {
  'INSIDE_DHAKA': {
    name: 'Inside Dhaka',
    fee: 60,
    description: 'Dhaka City Corporation area',
  },
  'OUTSIDE_DHAKA': {
    name: 'Outside Dhaka',
    fee: 90,
    description: 'Outside Dhaka division',
  },
  'PERIPHERAL_DHAKA': {
    name: 'Peripheral Dhaka',
    fee: 120,
    description: 'Near Dhaka (Savar, Gazipur, Narayanganj)',
  },
}

const PAYMENT_METHODS = [
  {
    id: 'CASH_ON_DELIVERY',
    name: 'Cash on Delivery',
    description: 'Pay when you receive your order',
  },
  {
    id: 'BANK_TRANSFER',
    name: 'Bank Transfer',
    description: 'Transfer to our bank account',
  },
]

// Location data for Bangladesh
const DISTRICTS = [
  { value: 'dhaka', label: 'Dhaka' },
  { value: 'chittagong', label: 'Chittagong' },
  { value: 'rajshahi', label: 'Rajshahi' },
  { value: 'khulna', label: 'Khulna' },
  { value: 'barishal', label: 'Barishal' },
  { value: 'sylhet', label: 'Sylhet' },
  { value: 'rangpur', label: 'Rangpur' },
  { value: 'mymensingh', label: 'Mymensingh' },
]

const UPAZILAS: Record<string, Array<{ value: string, label: string }>> = {
  dhaka: [
    { value: 'dhanmondi', label: 'Dhanmondi' },
    { value: 'gulshan', label: 'Gulshan' },
    { value: 'uttara', label: 'Uttara' },
    { value: 'old-dhaka', label: 'Old Dhaka' },
  ],
  chittagong: [
    { value: 'agrabad', label: 'Agrabad' },
    { value: 'kotwali', label: 'Kotwali' },
    { value: 'pahartali', label: 'Pahartali' },
  ],
  // Add more as needed
}

interface FormData {
  name: string
  phone: string
  email: string
  district: string
  upazila: string
  address: string
  note: string
}

interface FormErrors {
  name?: string
  phone?: string
  email?: string
  district?: string
  upazila?: string
  address?: string
  note?: string
}

interface SavedAddress {
  id: string
  name: string
  phone: string
  street: string
  city: string
  state: string
  postalCode: string
  isDefault: boolean
}

export function CheckoutModal({ open, onOpenChange }: CheckoutModalProps) {
  const dispatch = useAppDispatch()
  const { data: session } = useSession()
  const items = useAppSelector(selectCartItems)
  const [deliveryZone, setDeliveryZone] = useState<DeliveryZoneKey>('INSIDE_DHAKA')
  const [paymentMethod, setPaymentMethod] = useState('CASH_ON_DELIVERY')
  const [addresses, setAddresses] = useState<SavedAddress[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string>('manual')
  const [showAddressDetails, setShowAddressDetails] = useState(false)
  const [availableUpazilas, setAvailableUpazilas] = useState<Array<{ value: string, label: string }>>([])
  const [formData, setFormData] = useState<FormData>({
    name: session?.user?.name || '',
    phone: '',
    email: session?.user?.email || '',
    district: '',
    upazila: '',
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
                address: `${defaultAddress.street}, ${defaultAddress.city}, ${defaultAddress.state} ${defaultAddress.postalCode}`,
              }))
            }
          }
        })
        .catch(err => console.error('Failed to load addresses:', err))
    }
  }, [session, open])

  // Update available upazilas when district changes
  useEffect(() => {
    if (formData.district && UPAZILAS[formData.district]) {
      setAvailableUpazilas(UPAZILAS[formData.district])
    } else {
      setAvailableUpazilas([])
    }
    // Reset upazila when district changes
    if (formData.upazila && (!UPAZILAS[formData.district] || !UPAZILAS[formData.district].find(u => u.value === formData.upazila))) {
      setFormData(prev => ({ ...prev, upazila: '' }))
    }
  }, [formData.district, formData.upazila])

  // Handle address selection
  const handleAddressSelect = (addressId: string) => {
    setSelectedAddressId(addressId)
    if (addressId === 'manual') {
      // Manual address entry
      setFormData(prev => ({
        ...prev,
        name: session?.user?.name || '',
        phone: '',
        address: '',
        district: '',
        upazila: '',
      }))
      setShowAddressDetails(true)
    } else {
      const address = addresses.find(addr => addr.id === addressId)
      if (address) {
        setFormData(prev => ({
          ...prev,
          name: address.name,
          phone: address.phone,
          address: `${address.street}, ${address.city}, ${address.state} ${address.postalCode}`,
        }))
        setShowAddressDetails(false)
      }
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
    if (showAddressDetails) {
      if (!formData.district) newErrors.district = 'District is required'
      if (!formData.upazila) newErrors.upazila = 'Upazila is required'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
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
        recipientCity: formData.district || '',
        recipientZone: formData.upazila || '',
        recipientArea: '',
        deliveryAddress: formData.address.trim(),
        orderNote: formData.note.trim() || '',
        deliveryZone,
        items: items.map(item => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        subtotal,
        deliveryFee,
        total,
        paymentMethod,
        userId: session?.user?.id || null,
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Failed to create order')
      dispatch(clearCart())
      onOpenChange(false)
      showToast.success(`Order #${result.order.orderNumber} placed successfully! We'll contact you soon.`)
      setFormData({
        name: session?.user?.name || '',
        phone: '',
        email: session?.user?.email || '',
        district: '',
        upazila: '',
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

  const isFormValid = formData.name && formData.phone && formData.address && 
    (!showAddressDetails || (formData.district && formData.upazila)) &&
    Object.keys(errors).length === 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto bg-white rounded-lg shadow-xl max-h-[95vh] overflow-hidden">
        <DialogTitle className="sr-only">Checkout</DialogTitle>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b bg-gradient-to-r from-pearl-500 to-pearl-600 text-white">
          <h2 className="text-lg sm:text-xl font-semibold">Complete Your Order</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="text-white hover:bg-white/10 h-8 w-8 sm:h-10 sm:w-10"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>

        <div className="flex flex-col h-full max-h-[calc(95vh-80px)] overflow-hidden">
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-4 sm:p-6">
              <div className="space-y-6">
                
                {/* Order Summary Card */}
                <Card className="border-pearl-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Package className="h-5 w-5 text-pearl-600" />
                      Order Summary ({items.length} items)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Items List */}
                    <div className="space-y-3 max-h-48 overflow-y-auto">
                      {items.map((item: any) => (
                        <div
                          key={item.id}
                          className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="relative h-12 w-12 sm:h-16 sm:w-16 flex-shrink-0">
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

                    {/* Price Breakdown */}
                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal</span>
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
                  </CardContent>
                </Card>

                {/* Delivery Zone Selection */}
                <Card className="border-pearl-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-pearl-600" />
                      Delivery Zone
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-3">
                      {(Object.entries(DELIVERY_ZONES) as [DeliveryZoneKey, typeof DELIVERY_ZONES[DeliveryZoneKey]][]).map(([id, zone]) => (
                        <div key={id}>
                          <input
                            type="radio"
                            id={id}
                            name="deliveryZone"
                            value={id}
                            checked={deliveryZone === id}
                            onChange={(e) => setDeliveryZone(e.target.value as DeliveryZoneKey)}
                            className="sr-only peer"
                          />
                          <Label
                            htmlFor={id}
                            className="flex items-center justify-between rounded-lg border-2 border-gray-200 bg-white p-4 hover:bg-gray-50 cursor-pointer peer-checked:border-pearl-600 peer-checked:bg-pearl-50 transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <MapPin className="h-5 w-5 text-pearl-600" />
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
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Method Selection */}
                <Card className="border-pearl-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-pearl-600" />
                      Payment Method
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-3">
                      {PAYMENT_METHODS.map((method) => (
                        <div key={method.id}>
                          <input
                            type="radio"
                            id={method.id}
                            name="paymentMethod"
                            value={method.id}
                            checked={paymentMethod === method.id}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="sr-only peer"
                          />
                          <Label
                            htmlFor={method.id}
                            className="flex items-center space-x-3 rounded-lg border-2 border-gray-200 bg-white p-4 hover:bg-gray-50 cursor-pointer peer-checked:border-pearl-600 peer-checked:bg-pearl-50 transition-colors"
                          >
                            {method.id === 'CASH_ON_DELIVERY' ? (
                              <Banknote className="h-5 w-5 text-pearl-600" />
                            ) : (
                              <CreditCard className="h-5 w-5 text-pearl-600" />
                            )}
                            <div>
                              <p className="font-medium">{method.name}</p>
                              <p className="text-sm text-gray-600">{method.description}</p>
                            </div>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Address & Customer Information */}
                <Card className="border-pearl-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5 text-pearl-600" />
                      Delivery Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    
                    {/* Saved Addresses Selection */}
                    {session?.user && addresses.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Choose Address</Label>
                        <Select
                          value={selectedAddressId}
                          onValueChange={handleAddressSelect}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a saved address" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="manual">
                              <div className="flex items-center gap-2">
                                <Plus className="h-4 w-4" />
                                Enter address manually
                              </div>
                            </SelectItem>
                            {addresses.map((address) => (
                              <SelectItem key={address.id} value={address.id}>
                                <div className="flex flex-col">
                                  <span className="font-medium">{address.name}</span>
                                  <span className="text-sm text-gray-600 truncate">
                                    {address.street}, {address.city}, {address.state}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Basic Information */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name" className="text-sm font-medium">Full Name *</Label>
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
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className={`mt-1 ${errors.phone ? 'border-red-500' : ''}`}
                          placeholder="01XXXXXXXXX"
                          disabled={isSubmitting}
                        />
                        {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-sm font-medium">Email (optional)</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={`mt-1 ${errors.email ? 'border-red-500' : ''}`}
                        placeholder="Enter your email"
                        disabled={isSubmitting}
                      />
                      {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
                    </div>

                    {/* Address Input */}
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="address" className="text-sm font-medium">Delivery Address *</Label>
                        <div className="relative">
                          <Textarea
                            id="address"
                            value={formData.address}
                            onChange={(e) => handleInputChange('address', e.target.value)}
                            className={`mt-1 ${errors.address ? 'border-red-500' : ''}`}
                            placeholder="Enter your complete delivery address"
                            rows={2}
                            disabled={isSubmitting}
                          />
                          {!selectedAddressId && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setShowAddressDetails(!showAddressDetails)}
                              className="absolute top-2 right-2 text-xs h-7"
                            >
                              {showAddressDetails ? (
                                <>
                                  <ChevronUp className="h-3 w-3 mr-1" />
                                  Less
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="h-3 w-3 mr-1" />
                                  Add Details
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                        {errors.address && <p className="text-sm text-red-500 mt-1">{errors.address}</p>}
                      </div>

                      {/* Expanded Address Details */}
                      {showAddressDetails && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-200">
                          <div>
                            <Label htmlFor="district" className="text-sm font-medium">District *</Label>
                            <Select
                              onValueChange={(value) => handleInputChange('district', value)}
                              value={formData.district}
                              disabled={isSubmitting}
                            >
                              <SelectTrigger className={`mt-1 w-full ${errors.district ? 'border-red-500' : ''}`}>
                                <SelectValue placeholder="Select district" />
                              </SelectTrigger>
                              <SelectContent>
                                {DISTRICTS.map(district => (
                                  <SelectItem key={district.value} value={district.value}>
                                    {district.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {errors.district && <p className="text-sm text-red-500 mt-1">{errors.district}</p>}
                          </div>
                          <div>
                            <Label htmlFor="upazila" className="text-sm font-medium">Upazila *</Label>
                            <Select
                              onValueChange={(value) => handleInputChange('upazila', value)}
                              value={formData.upazila}
                              disabled={isSubmitting || !formData.district}
                            >
                              <SelectTrigger className={`mt-1 w-full ${errors.upazila ? 'border-red-500' : ''}`}>
                                <SelectValue placeholder="Select upazila" />
                              </SelectTrigger>
                              <SelectContent>
                                {availableUpazilas.map(upazila => (
                                  <SelectItem key={upazila.value} value={upazila.value}>
                                    {upazila.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {errors.upazila && <p className="text-sm text-red-500 mt-1">{errors.upazila}</p>}
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="note" className="text-sm font-medium">Order Note (Optional)</Label>
                      <Textarea
                        id="note"
                        value={formData.note}
                        onChange={(e) => handleInputChange('note', e.target.value)}
                        className="mt-1"
                        placeholder="Any special instructions for delivery"
                        rows={2}
                        disabled={isSubmitting}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </form>
          </div>

          {/* Fixed Bottom Section */}
          <div className="border-t bg-white p-4 sm:p-6">
            <Button
              onClick={handleSubmit}
              className="w-full bg-pearl-600 hover:bg-pearl-700 text-white py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting || items.length === 0 || !isFormValid}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Placing Order...
                </>
              ) : (
                `Confirm Order - ${formatPrice(total)}`
              )}
            </Button>
            <p className="text-xs text-gray-500 text-center mt-2">
              By placing this order, you agree to our terms of service and privacy policy.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
