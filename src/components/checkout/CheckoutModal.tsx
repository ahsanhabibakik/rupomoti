'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Phone, MapPin, Package, CreditCard, Star, ShoppingCart, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'

interface Product {
  id: string
  name: string
  price: number
  image: string
  rating?: number
  description?: string
  variants?: Array<{
    id: string
    name: string
    price: number
    image?: string
  }>
}

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  product?: Product
  onOrderComplete: (orderData: any) => void
}

const BANGLADESH_DIVISIONS = [
  'ঢাকা', 'চট্টগ্রাম', 'রাজশাহী', 'খুলনা', 'বরিশাল', 'সিলেট', 'রংপুর', 'ময়মনসিংহ'
]

export function CheckoutModal({ isOpen, onClose, product, onOrderComplete }: CheckoutModalProps) {
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    email: '',
    address: '',
    division: '',
    district: '',
    upazila: '',
    notes: '',
    paymentMethod: 'cod',
    quantity: 1,
    selectedVariant: null as any
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const orderData = {
        ...formData,
        product,
        orderId: `ORD-${Date.now()}`,
        total: calculateTotal(),
        createdAt: new Date().toISOString()
      }

      setOrderSuccess(true)
      setTimeout(() => {
        onOrderComplete(orderData)
        onClose()
        setOrderSuccess(false)
        setFormData({
          customerName: '',
          phone: '',
          email: '',
          address: '',
          division: '',
          district: '',
          upazila: '',
          notes: '',
          paymentMethod: 'cod',
          quantity: 1,
          selectedVariant: null
        })
      }, 2000)
    } catch (error) {
      console.error('Order submission failed:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const calculateTotal = () => {
    if (!product) return 0
    const basePrice = formData.selectedVariant?.price || product.price
    const subtotal = basePrice * formData.quantity
    const deliveryCharge = 60 // Fixed delivery charge
    return subtotal + deliveryCharge
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (!product) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-green-600">
            {orderSuccess ? 'অর্ডার সফল হয়েছে!' : 'অর্ডার করুন'}
          </DialogTitle>
        </DialogHeader>

        {orderSuccess ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">আপনার অর্ডার সফলভাবে গৃহীত হয়েছে!</h3>
            <p className="text-gray-600 mb-4">
              আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।
            </p>
            <Badge variant="outline" className="text-sm">
              অর্ডার নম্বর: ORD-{Date.now()}
            </Badge>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  পণ্যের তথ্য
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold">{product.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xl font-bold text-green-600">
                        ৳{formData.selectedVariant?.price || product.price}
                      </span>
                      {product.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm text-gray-600">{product.rating}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Variants */}
                    {product.variants && product.variants.length > 0 && (
                      <div className="mt-3">
                        <Label>ভ্যারিয়েন্ট নির্বাচন করুন:</Label>
                        <Select onValueChange={(value) => {
                          const variant = product.variants?.find(v => v.id === value)
                          handleInputChange('selectedVariant', variant)
                        }}>
                          <SelectTrigger>
                            <SelectValue placeholder="ভ্যারিয়েন্ট নির্বাচন করুন" />
                          </SelectTrigger>
                          <SelectContent>
                            {product.variants.map(variant => (
                              <SelectItem key={variant.id} value={variant.id}>
                                {variant.name} - ৳{variant.price}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    
                    {/* Quantity */}
                    <div className="mt-3">
                      <Label>পরিমাণ:</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleInputChange('quantity', Math.max(1, formData.quantity - 1))}
                        >
                          -
                        </Button>
                        <span className="w-12 text-center">{formData.quantity}</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleInputChange('quantity', formData.quantity + 1)}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  ব্যক্তিগত তথ্য
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">নাম *</Label>
                    <Input
                      id="name"
                      required
                      value={formData.customerName}
                      onChange={(e) => handleInputChange('customerName', e.target.value)}
                      placeholder="আপনার নাম লিখুন"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">মোবাইল নম্বর *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="01XXXXXXXXX"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">ইমেইল (ঐচ্ছিক)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="আপনার ইমেইল"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Address Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  ঠিকানা
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="address">পূর্ণ ঠিকানা *</Label>
                  <Textarea
                    id="address"
                    required
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="বাড়ি/ফ্ল্যাট নম্বর, রোড নম্বর, এলাকার নাম"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>বিভাগ *</Label>
                    <Select onValueChange={(value) => handleInputChange('division', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="বিভাগ নির্বাচন করুন" />
                      </SelectTrigger>
                      <SelectContent>
                        {BANGLADESH_DIVISIONS.map(division => (
                          <SelectItem key={division} value={division}>
                            {division}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="district">জেলা *</Label>
                    <Input
                      id="district"
                      required
                      value={formData.district}
                      onChange={(e) => handleInputChange('district', e.target.value)}
                      placeholder="জেলার নাম"
                    />
                  </div>
                  <div>
                    <Label htmlFor="upazila">উপজেলা/থানা</Label>
                    <Input
                      id="upazila"
                      value={formData.upazila}
                      onChange={(e) => handleInputChange('upazila', e.target.value)}
                      placeholder="উপজেলা/থানা"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes">অতিরিক্ত নোট</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="যেকোনো বিশেষ নির্দেশনা"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  পেমেন্ট পদ্ধতি
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="cod"
                      name="payment"
                      value="cod"
                      checked={formData.paymentMethod === 'cod'}
                      onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                    />
                    <Label htmlFor="cod" className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      ক্যাশ অন ডেলিভারি
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="bkash"
                      name="payment"
                      value="bkash"
                      checked={formData.paymentMethod === 'bkash'}
                      onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                    />
                    <Label htmlFor="bkash" className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-pink-500 rounded"></div>
                      বিকাশ
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="nagad"
                      name="payment"
                      value="nagad"
                      checked={formData.paymentMethod === 'nagad'}
                      onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                    />
                    <Label htmlFor="nagad" className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-orange-500 rounded"></div>
                      নগদ
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>অর্ডার সামারি</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>পণ্যের মূল্য ({formData.quantity}টি)</span>
                    <span>৳{((formData.selectedVariant?.price || product.price) * formData.quantity).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ডেলিভারি চার্জ</span>
                    <span>৳60.00</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>সর্বমোট</span>
                    <span className="text-green-600">৳{calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 text-lg font-semibold bg-green-600 hover:bg-green-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                </motion.div>
              ) : (
                <ShoppingCart className="h-5 w-5 mr-2" />
              )}
              {isSubmitting ? 'অর্ডার প্রক্রিয়াকরণ...' : 'অর্ডার নিশ্চিত করুন'}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default CheckoutModal
