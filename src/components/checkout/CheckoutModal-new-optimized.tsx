'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { clearCart, selectCartItems } from '@/redux/slices/cartSlice'
import { showToast } from '@/lib/toast'
import { formatPrice } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Package,
  MapPin,
  CreditCard,
  User,
  X,
  Loader2,
  Phone,
  Mail,
  MapIcon,
  Trash2,
  ShoppingCart
} from 'lucide-react'
import Image from 'next/image'

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
  email?: string
  street: string
  city: string
  state: string
  postalCode: string
  isDefault: boolean
}

interface District {
  id: string
  name: string
}

interface Upazila {
  id: string
  name: string
}

export function CheckoutModal({ open, onOpenChange }: CheckoutModalProps) {
  const dispatch = useAppDispatch()
  const { data: session } = useSession()
  const items = useAppSelector(selectCartItems)
  
  // State management
  const [deliveryZone, setDeliveryZone] = useState<DeliveryZoneKey>('INSIDE_DHAKA')
  const [paymentMethod, setPaymentMethod] = useState('CASH_ON_DELIVERY')
  const [addresses, setAddresses] = useState<SavedAddress[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string>('manual')
  const [showAddressDetails, setShowAddressDetails] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Location API data
  const [districts, setDistricts] = useState<District[]>([])
  const [upazilas, setUpazilas] = useState<Upazila[]>([])
  const [loadingDistricts, setLoadingDistricts] = useState(false)
  const [loadingUpazilas, setLoadingUpazilas] = useState(false)
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    email: '',
    district: '',
    upazila: '',
    address: '',
    note: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})

  // Load districts from API
  const loadDistricts = useCallback(async () => {
    if (districts.length > 0) return // Already loaded
    
    setLoadingDistricts(true)
    try {
      const response = await fetch('/api/locations/districts')
      if (response.ok) {
        const data = await response.json()
        setDistricts(data.districts || [])
      }
    } catch (error) {
      console.error('Failed to load districts:', error)
      showToast.error('Failed to load districts')
    } finally {
      setLoadingDistricts(false)
    }
  }, [districts.length])

  // Load upazilas based on selected district
  const loadUpazilas = useCallback(async (districtName: string) => {
    if (!districtName) {
      setUpazilas([])
      return
    }
    
    setLoadingUpazilas(true)
    try {
      const response = await fetch(`/api/locations/upazilas?district=${encodeURIComponent(districtName)}`)
      if (response.ok) {
        const data = await response.json()
        setUpazilas(data.upazilas || [])
      }
    } catch (error) {
      console.error('Failed to load upazilas:', error)
      showToast.error('Failed to load areas')
    } finally {
      setLoadingUpazilas(false)
    }
  }, [])

  // Load user's saved addresses and auto-fill user data
  useEffect(() => {
    if (open) {
      // Load districts when modal opens
      loadDistricts()
      
      if (session?.user) {
        // Auto-fill basic user info immediately from session
        setFormData(prev => ({
          ...prev,
          name: session.user.name || '',
          email: session.user.email || '',
          phone: (session.user as any)?.phone || prev.phone,
        }))

        // Load saved addresses
        fetch('/api/addresses')
          .then(res => res.json())
          .then(data => {
            if (Array.isArray(data) && data.length > 0) {
              setAddresses(data)
              // Auto-select default address if available
              const defaultAddress = data.find(addr => addr.isDefault)
              if (defaultAddress) {
                setSelectedAddressId(defaultAddress.id)
                setFormData(prev => ({
                  ...prev,
                  name: defaultAddress.name || session.user.name || '',
                  phone: defaultAddress.phone || prev.phone,
                  email: defaultAddress.email || session.user.email || '',
                  address: `${defaultAddress.street}, ${defaultAddress.city}, ${defaultAddress.state} ${defaultAddress.postalCode}`,
                  district: defaultAddress.city || '',
                }))
                setShowAddressDetails(false)
                
                // Load upazilas for the default address district
                if (defaultAddress.city) {
                  loadUpazilas(defaultAddress.city)
                }
              }
            }
          })
          .catch(err => console.error('Failed to load addresses:', err))
      }
    }
  }, [session, open, loadDistricts, loadUpazilas])

  // Load upazilas when district changes
  useEffect(() => {
    if (formData.district) {
      const selectedDistrict = districts.find(d => d.id === formData.district)
      if (selectedDistrict) {
        loadUpazilas(selectedDistrict.name)
        // Reset upazila when district changes
        setFormData(prev => ({ ...prev, upazila: '' }))
      }
    } else {
      setUpazilas([])
    }
  }, [formData.district, districts, loadUpazilas])

  // Handle address selection
  const handleAddressSelect = (addressId: string) => {
    setSelectedAddressId(addressId)
    if (addressId === 'manual') {
      // Manual address entry
      setFormData(prev => ({
        ...prev,
        name: session?.user?.name || '',
        phone: (session?.user as any)?.phone || '',
        email: session?.user?.email || '',
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
          email: address.email || session?.user?.email || '',
          address: `${address.street}, ${address.city}, ${address.state} ${address.postalCode}`,
          district: districts.find(d => d.name.toLowerCase() === address.city.toLowerCase())?.id || '',
        }))
        setShowAddressDetails(false)
        
        // Load upazilas for this address
        if (address.city) {
          loadUpazilas(address.city)
        }
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
      if (!formData.upazila) newErrors.upazila = 'Area is required'
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
      const selectedDistrict = districts.find(d => d.id === formData.district)
      const selectedUpazila = upazilas.find(u => u.id === formData.upazila)
      
      const orderData = {
        recipientName: formData.name.trim(),
        recipientPhone: formData.phone.trim(),
        recipientEmail: formData.email.trim() || '',
        recipientCity: selectedDistrict?.name || '',
        recipientZone: selectedUpazila?.name || '',
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
      
      // Reset form
      setFormData({
        name: session?.user?.name || '',
        phone: '',
        email: session?.user?.email || '',
        district: '',
        upazila: '',
        address: '',
        note: '',
      })
      setSelectedAddressId('manual')
      setShowAddressDetails(true)
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
      <DialogContent className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl max-h-[95vh] overflow-hidden border-0">
        <DialogTitle className="sr-only">Checkout</DialogTitle>
        
        {/* Header - Improved with better spacing */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <Package className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold">Complete Your Order</h2>
              <p className="text-emerald-100 text-xs sm:text-sm">Review and confirm your purchase</p>
            </div>
          </div>
          {/* Removed extra close button as requested */}
        </div>

        <div className="flex flex-col h-full max-h-[calc(95vh-80px)] overflow-hidden bg-white">
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-3 sm:p-4 md:p-5">
              <div className="space-y-4 sm:space-y-5">
                
                {/* Order Summary Card - Mobile Optimized */}
                <Card className="border-emerald-200 shadow-sm bg-white hover:shadow-md transition-shadow duration-300">
                  <CardHeader className="pb-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-t-lg">
                    <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                      <Package className="h-4 w-4 sm:h-5 sm:w-5" />
                      Order Summary ({items.length} {items.length === 1 ? 'item' : 'items'})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-3 sm:pt-4">
                    <div className="space-y-2 max-h-32 sm:max-h-48 overflow-y-auto">
                      {items.map((item) => (
                        <div key={item.id} className="flex items-center gap-2 sm:gap-3 p-2 bg-gray-50 rounded-lg">
                          <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-md overflow-hidden flex-shrink-0">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs sm:text-sm font-medium text-gray-900 truncate">{item.name}</h4>
                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs sm:text-sm font-semibold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t pt-3 space-y-2 bg-gray-50 rounded-lg p-3">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal</span>
                        <span>{formatPrice(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Delivery</span>
                        <span>{formatPrice(deliveryFee)}</span>
                      </div>
                      <div className="flex justify-between text-base font-bold border-t pt-2">
                        <span>Total</span>
                        <span className="text-emerald-600">{formatPrice(total)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Delivery Zone Selection - Mobile Optimized */}
                <Card className="border-blue-200 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white">
                  <CardHeader className="pb-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
                    <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                      <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                      Delivery Zone
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-3 sm:pt-4">
                    <div className="space-y-3">
                      {Object.entries(DELIVERY_ZONES).map(([key, zone]) => (
                        <label key={key} className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
                          <input
                            type="radio"
                            name="deliveryZone"
                            value={key}
                            checked={deliveryZone === key}
                            onChange={(e) => setDeliveryZone(e.target.value as DeliveryZoneKey)}
                            className="h-4 w-4 text-blue-600"
                          />
                          <div className="flex-1">
                            <div className="flex justify-between items-center">
                              <span className="text-sm sm:text-base font-medium">{zone.name}</span>
                              <span className="text-sm sm:text-base font-bold text-blue-600">{formatPrice(zone.fee)}</span>
                            </div>
                            <p className="text-xs text-gray-500">{zone.description}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Method Selection - Mobile Optimized */}
                <Card className="border-purple-200 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-purple-50 via-white to-purple-50">
                  <CardHeader className="pb-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-t-lg shadow-md">
                    <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                      <CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />
                      Payment Method
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-3 sm:pt-4">
                    <div className="space-y-3">
                      {PAYMENT_METHODS.map((method) => (
                        <label key={method.id} className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-purple-50 transition-colors">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={method.id}
                            checked={paymentMethod === method.id}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="h-4 w-4 text-purple-600"
                          />
                          <div>
                            <span className="text-sm sm:text-base font-medium">{method.name}</span>
                            <p className="text-xs text-gray-500">{method.description}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Address & Customer Information - Mobile Optimized */}
                <Card className="border-orange-200 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-orange-50 via-white to-orange-50">
                  <CardHeader className="pb-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-lg shadow-md">
                    <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                      <User className="h-4 w-4 sm:h-5 sm:w-5" />
                      Delivery Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-3 sm:pt-4">
                    
                    {/* Saved Addresses Selection */}
                    {session?.user && addresses.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium">Choose Address</Label>
                        <div className="mt-2 space-y-2">
                          <label className="flex items-center space-x-2 p-2 border rounded-lg cursor-pointer hover:bg-orange-50">
                            <input
                              type="radio"
                              name="addressSelection"
                              value="manual"
                              checked={selectedAddressId === 'manual'}
                              onChange={() => handleAddressSelect('manual')}
                              className="h-4 w-4 text-orange-600"
                            />
                            <span className="text-sm">Enter new address</span>
                          </label>
                          {addresses.map((address) => (
                            <label key={address.id} className="flex items-center space-x-2 p-2 border rounded-lg cursor-pointer hover:bg-orange-50">
                              <input
                                type="radio"
                                name="addressSelection"
                                value={address.id}
                                checked={selectedAddressId === address.id}
                                onChange={() => handleAddressSelect(address.id)}
                                className="h-4 w-4 text-orange-600"
                              />
                              <div className="flex-1">
                                <span className="text-sm font-medium">{address.name}</span>
                                <p className="text-xs text-gray-500">{address.street}, {address.city}</p>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Customer Information Form - Mobile Optimized */}
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label htmlFor="name" className="text-sm font-medium flex items-center gap-1">
                          <User className="h-3 w-3" />
                          Full Name *
                        </Label>
                        <Input
                          id="name"
                          type="text"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className={`mt-1 transition-all duration-200 focus:ring-2 focus:ring-orange-200 focus:border-orange-500 ${errors.name ? 'border-red-500 bg-red-50' : 'bg-white hover:bg-gray-50'}`}
                          placeholder="Enter your full name"
                          disabled={isSubmitting}
                        />
                        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                      </div>

                      <div>
                        <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          Phone Number *
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className={`mt-1 transition-all duration-200 focus:ring-2 focus:ring-orange-200 focus:border-orange-500 ${errors.phone ? 'border-red-500 bg-red-50' : 'bg-white hover:bg-gray-50'}`}
                          placeholder="01XXXXXXXXX"
                          disabled={isSubmitting}
                        />
                        {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-sm font-medium flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={`mt-1 transition-all duration-200 focus:ring-2 focus:ring-orange-200 focus:border-orange-500 ${errors.email ? 'border-red-500 bg-red-50' : 'bg-white hover:bg-gray-50'}`}
                        placeholder="Enter your email"
                        disabled={isSubmitting}
                      />
                      {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                    </div>

                    {/* Location Selection - API Based */}
                    {showAddressDetails && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="district" className="text-sm font-medium flex items-center gap-1">
                              <MapIcon className="h-3 w-3" />
                              District *
                            </Label>
                            <Select 
                              value={formData.district} 
                              onValueChange={(value) => handleInputChange('district', value)}
                              disabled={isSubmitting || loadingDistricts}
                            >
                              <SelectTrigger className={`mt-1 ${errors.district ? 'border-red-500 bg-red-50' : 'bg-white hover:bg-gray-50'}`}>
                                <SelectValue placeholder={loadingDistricts ? "Loading..." : "Select district"} />
                              </SelectTrigger>
                              <SelectContent>
                                {districts.map((district) => (
                                  <SelectItem key={district.id} value={district.id}>
                                    {district.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {errors.district && <p className="text-xs text-red-500 mt-1">{errors.district}</p>}
                          </div>

                          <div>
                            <Label htmlFor="upazila" className="text-sm font-medium flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              Area/Upazila *
                            </Label>
                            <Select 
                              value={formData.upazila} 
                              onValueChange={(value) => handleInputChange('upazila', value)}
                              disabled={isSubmitting || loadingUpazilas || !formData.district}
                            >
                              <SelectTrigger className={`mt-1 ${errors.upazila ? 'border-red-500 bg-red-50' : 'bg-white hover:bg-gray-50'}`}>
                                <SelectValue placeholder={loadingUpazilas ? "Loading..." : "Select area"} />
                              </SelectTrigger>
                              <SelectContent>
                                {upazilas.map((upazila) => (
                                  <SelectItem key={upazila.id} value={upazila.id}>
                                    {upazila.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {errors.upazila && <p className="text-xs text-red-500 mt-1">{errors.upazila}</p>}
                          </div>
                        </div>
                      </div>
                    )}

                    <div>
                      <Label htmlFor="address" className="text-sm font-medium flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        Delivery Address *
                      </Label>
                      <Textarea
                        id="address"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        className={`mt-1 transition-all duration-200 focus:ring-2 focus:ring-orange-200 focus:border-orange-500 ${errors.address ? 'border-red-500 bg-red-50' : 'bg-white hover:bg-gray-50'}`}
                        placeholder="House/Flat no, Street, Landmark"
                        rows={2}
                        disabled={isSubmitting}
                      />
                      {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
                    </div>

                    <div>
                      <Label htmlFor="note" className="text-sm font-medium">Special Instructions (Optional)</Label>
                      <Textarea
                        id="note"
                        value={formData.note}
                        onChange={(e) => handleInputChange('note', e.target.value)}
                        className="mt-1 transition-all duration-200 focus:ring-2 focus:ring-orange-200 focus:border-orange-500 bg-white hover:bg-gray-50"
                        placeholder="Any special delivery instructions"
                        rows={2}
                        disabled={isSubmitting}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </form>
          </div>

          {/* Fixed Bottom Section - Improved positioning */}
          <div className="border-t bg-gradient-to-r from-white via-gray-50 to-white p-3 sm:p-4 shadow-lg backdrop-blur-sm">
            <div className="space-y-3">
              {/* Total Summary */}
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-emerald-50 via-emerald-100 to-emerald-50 rounded-xl border border-emerald-200 shadow-sm">
                <span className="text-base sm:text-lg font-semibold text-gray-800">Total Amount:</span>
                <span className="text-lg sm:text-xl font-bold text-emerald-700">{formatPrice(total)}</span>
              </div>
              
              {/* Order Button - Fixed positioning and better mobile optimization */}
              <Button
                onClick={handleSubmit}
                className="w-full bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-600 hover:from-emerald-700 hover:via-emerald-800 hover:to-emerald-700 text-white py-3 sm:py-4 text-base sm:text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:from-gray-400 disabled:to-gray-500 disabled:transform-none"
                disabled={isSubmitting || items.length === 0 || !isFormValid}
                size="lg"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="mr-3 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                    Processing Order...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Package className="mr-3 h-4 w-4 sm:h-5 sm:w-5" />
                    Confirm Order - {formatPrice(total)}
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
