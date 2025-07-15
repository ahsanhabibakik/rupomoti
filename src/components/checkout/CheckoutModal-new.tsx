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
      showToast.success(`Order #${result.order.orderNumber} placed successfully! We&apos;ll contact you soon.`)
      setFormData({
        name: session?.user?.name || '',
        phone: '',
        email: session?.user?.email || '',
        district: '',
        upazila: '',
        address: '',
        note: '',
      })
    } catch (error: unknown) {
      console.error('Error creating order:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to place order. Please try again.'
      showToast.error(errorMessage)
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
      <DialogContent className="w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto bg-white rounded-xl shadow-2xl max-h-[95vh] overflow-hidden border border-slate-200">
        <DialogTitle className="sr-only">Checkout</DialogTitle>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-600 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Complete Your Order</h2>
              <p className="text-emerald-100 text-sm">Review and confirm your purchase</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="text-white hover:bg-white/10 h-10 w-10 rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex flex-col h-full max-h-[calc(95vh-80px)] overflow-hidden bg-white">
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-4 sm:p-6">
              <div className="space-y-6">
                
                {/* Order Summary Card */}
                <Card className="border-emerald-200 shadow-sm bg-white hover:shadow-md transition-shadow duration-300">
                  <CardHeader className="pb-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-t-lg">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Order Summary ({items.length} {items.length === 1 ? 'item' : 'items'})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4">
                    {/* Items List */}
                    <div className="space-y-3 max-h-48 overflow-y-auto">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 border border-gray-100"
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
                            <h4 className="text-sm font-medium line-clamp-2 text-gray-900">
                              {item.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {formatPrice(item.price)} × {item.quantity}
                            </p>
                          </div>
                          <div className="text-sm font-medium text-emerald-600">
                            {formatPrice(item.price * item.quantity)}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Price Breakdown */}
                    <div className="border-t pt-4 space-y-2 bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-medium">{formatPrice(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Delivery Fee</span>
                        <span className="font-medium">{formatPrice(deliveryFee)}</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                        <span>Total</span>
                        <span className="text-emerald-600">{formatPrice(total)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Delivery Zone Selection */}
                <Card className="border-blue-200 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white">
                  <CardHeader className="pb-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Delivery Zone
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-1 gap-3">
                      {(Object.entries(DELIVERY_ZONES) as [DeliveryZoneKey, typeof DELIVERY_ZONES[DeliveryZoneKey]][]).map(([id, zone]) => (
                        <div key={id} className="relative">
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
                            className={`flex items-center justify-between rounded-lg border-2 p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                              deliveryZone === id 
                                ? 'border-blue-600 bg-blue-50 shadow-sm ring-2 ring-blue-200' 
                                : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                deliveryZone === id ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                              }`}>
                                {deliveryZone === id && (
                                  <div className="w-2 h-2 rounded-full bg-white"></div>
                                )}
                              </div>
                              <MapPin className={`h-5 w-5 ${deliveryZone === id ? 'text-blue-600' : 'text-gray-400'}`} />
                              <div>
                                <p className={`font-medium ${deliveryZone === id ? 'text-blue-800' : 'text-gray-800'}`}>
                                  {zone.name}
                                </p>
                                <p className="text-sm text-gray-600">{zone.description}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`font-semibold ${deliveryZone === id ? 'text-blue-700' : 'text-gray-700'}`}>
                                ৳{zone.fee}
                              </p>
                              {deliveryZone === id && (
                                <p className="text-xs text-blue-600">✓ Selected</p>
                              )}
                            </div>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Method Selection */}
                <Card className="border-purple-200 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-purple-50 via-white to-purple-50">
                  <CardHeader className="pb-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-t-lg shadow-md">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Payment Method
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-1 gap-3">
                      {PAYMENT_METHODS.map((method) => (
                        <div key={method.id} className="relative">
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
                            className={`flex items-center space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                              paymentMethod === method.id 
                                ? 'border-purple-600 bg-purple-50 shadow-sm ring-2 ring-purple-200' 
                                : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-gray-50'
                            }`}
                          >
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              paymentMethod === method.id ? 'border-purple-600 bg-purple-600' : 'border-gray-300'
                            }`}>
                              {paymentMethod === method.id && (
                                <div className="w-2 h-2 rounded-full bg-white"></div>
                              )}
                            </div>
                            {method.id === 'CASH_ON_DELIVERY' ? (
                              <Banknote className={`h-5 w-5 ${paymentMethod === method.id ? 'text-purple-600' : 'text-gray-400'}`} />
                            ) : (
                              <CreditCard className={`h-5 w-5 ${paymentMethod === method.id ? 'text-purple-600' : 'text-gray-400'}`} />
                            )}
                            <div className="flex-1">
                              <p className={`font-medium ${paymentMethod === method.id ? 'text-purple-800' : 'text-gray-800'}`}>
                                {method.name}
                              </p>
                              <p className="text-sm text-gray-600">{method.description}</p>
                              {paymentMethod === method.id && (
                                <p className="text-xs text-purple-600 mt-1">✓ Selected</p>
                              )}
                            </div>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Address & Customer Information */}
                <Card className="border-orange-200 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-orange-50 via-white to-orange-50">
                  <CardHeader className="pb-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-lg shadow-md">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Delivery Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4">
                    
                    {/* Saved Addresses Selection */}
                    {session?.user && addresses.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Choose Address</Label>
                        <Select
                          value={selectedAddressId}
                          onValueChange={handleAddressSelect}
                        >
                          <SelectTrigger className="w-full transition-all duration-200 focus:ring-2 focus:ring-orange-200 focus:border-orange-500 bg-white hover:bg-gray-50">
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
                          className={`mt-1 transition-all duration-200 focus:ring-2 focus:ring-orange-200 focus:border-orange-500 ${errors.name ? 'border-red-500 bg-red-50' : 'bg-white hover:bg-gray-50'}`}
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
                          className={`mt-1 transition-all duration-200 focus:ring-2 focus:ring-orange-200 focus:border-orange-500 ${errors.phone ? 'border-red-500 bg-red-50' : 'bg-white hover:bg-gray-50'}`}
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
                        className={`mt-1 transition-all duration-200 focus:ring-2 focus:ring-orange-200 focus:border-orange-500 ${errors.email ? 'border-red-500 bg-red-50' : 'bg-white hover:bg-gray-50'}`}
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
                            className={`mt-1 transition-all duration-200 focus:ring-2 focus:ring-orange-200 focus:border-orange-500 ${errors.address ? 'border-red-500 bg-red-50' : 'bg-white hover:bg-gray-50'}`}
                            placeholder="Enter your complete delivery address"
                            rows={2}
                            disabled={isSubmitting}
                          />
                          {selectedAddressId === 'manual' && (
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
                              <SelectTrigger className={`mt-1 w-full transition-all duration-200 focus:ring-2 focus:ring-orange-200 focus:border-orange-500 ${errors.district ? 'border-red-500 bg-red-50' : 'bg-white hover:bg-gray-50'}`}>
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
                              <SelectTrigger className={`mt-1 w-full transition-all duration-200 focus:ring-2 focus:ring-orange-200 focus:border-orange-500 ${errors.upazila ? 'border-red-500 bg-red-50' : 'bg-white hover:bg-gray-50'}`}>
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
                        className="mt-1 transition-all duration-200 focus:ring-2 focus:ring-orange-200 focus:border-orange-500 bg-white hover:bg-gray-50"
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
          <div className="border-t bg-gradient-to-r from-white via-gray-50 to-white p-4 sm:p-6 shadow-lg backdrop-blur-sm">
            <div className="space-y-3">
              {/* Total Summary */}
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-emerald-50 via-emerald-100 to-emerald-50 rounded-xl border border-emerald-200 shadow-sm">
                <span className="text-lg font-semibold text-gray-800">Total Amount:</span>
                <span className="text-xl font-bold text-emerald-700">{formatPrice(total)}</span>
              </div>
              
              {/* Order Button */}
              <Button
                onClick={handleSubmit}
                className="w-full bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-600 hover:from-emerald-700 hover:via-emerald-800 hover:to-emerald-700 text-white py-4 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:from-gray-400 disabled:to-gray-500 disabled:transform-none"
                disabled={isSubmitting || items.length === 0 || !isFormValid}
                size="lg"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    <span className="font-semibold">Placing Your Order...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Package className="mr-3 h-5 w-5" />
                    <span className="font-bold">Confirm Order - {formatPrice(total)}</span>
                  </div>
                )}
              </Button>
              
              {/* Terms */}
              <p className="text-xs text-gray-500 text-center leading-relaxed">
                By placing this order, you agree to our{' '}
                <span className="text-emerald-600 underline cursor-pointer hover:text-emerald-700">terms of service</span> and{' '}
                <span className="text-emerald-600 underline cursor-pointer hover:text-emerald-700">privacy policy</span>.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
