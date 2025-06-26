'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogOverlay, DialogPortal } from '@/components/ui/dialog'
import { Truck, CreditCard, Banknote, Smartphone, CheckCircle } from 'lucide-react'
import { useForm, FieldValues, SubmitHandler } from 'react-hook-form'
import { useAppSelector, useAppDispatch } from '@/redux/hooks'
import { clearCart } from '@/redux/slices/cartSlice'

interface CheckoutModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const DELIVERY_OPTIONS = [
  { label: 'Inside Dhaka', value: 'dhaka', price: 60 },
  { label: 'Near Dhaka', value: 'near_dhaka', price: 90 },
  { label: 'Outside Dhaka', value: 'outside_dhaka', price: 120 },
]

const PAYMENT_OPTIONS = [
  { label: 'bKash', value: 'bkash', icon: <Smartphone className="w-5 h-5 text-yellow-500" /> },
  { label: 'Bank Transfer', value: 'bank', icon: <CreditCard className="w-5 h-5 text-yellow-500" /> },
  { label: 'Cash on Delivery', value: 'cod', icon: <Banknote className="w-5 h-5 text-yellow-500" /> },
]

export function CheckoutModal({ open, onOpenChange }: CheckoutModalProps) {
  const dispatch = useAppDispatch()
  const items = useAppSelector((state) => state.cart.items)
  const cartTotal = items.reduce((sum, item) => {
    const price = item.salePrice && item.salePrice > 0 ? item.salePrice : item.price
    return sum + price * item.quantity
  }, 0)
  const discount = useAppSelector((state) => state.cart.discount)
  const shippingCost = useAppSelector((state) => state.cart.shippingCost)
  
  const [delivery, setDelivery] = useState('dhaka')
  const [payment, setPayment] = useState('cod')
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [submitted, setSubmitted] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const subtotal = cartTotal
  const deliveryCharge = DELIVERY_OPTIONS.find(opt => opt.value === delivery)?.price || 0
  const total = Math.round(subtotal - discount + deliveryCharge)

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    try {
      setErrorMessage(null)
      const orderNumber = 'ORD-' + Date.now()

      const paymentMethodMap = {
        cod: 'CASH_ON_DELIVERY',
        bkash: 'BKASH',
        bank: 'BANK_TRANSFER',
      }
      const deliveryZoneMap = {
        dhaka: 'INSIDE_DHAKA',
        near_dhaka: 'PERIPHERAL_DHAKA',
        outside_dhaka: 'OUTSIDE_DHAKA',
      } as const
      const orderItems = items.map(item => ({
        productId: (item as any).productId || item.id,
        price: typeof (item as any).salePrice === 'number' && (item as any).salePrice > 0
          ? Math.round((item as any).salePrice)
          : Math.round(item.price),
        quantity: item.quantity,
      }))
      
      const fullOrder = {
        orderNumber,
        recipientName: data.name,
        recipientPhone: data.phone,
        deliveryAddress: data.address,
        items: orderItems,
        subtotal: Math.round(subtotal),
        discount: Math.round(discount),
        deliveryFee: Math.round(deliveryCharge),
        total,
        deliveryZone: deliveryZoneMap[delivery as keyof typeof deliveryZoneMap] || 'INSIDE_DHAKA',
        orderNote: data.note || '',
        paymentMethod: paymentMethodMap[payment as keyof typeof paymentMethodMap] || 'CASH_ON_DELIVERY',
      }
      
      console.log("orderData", fullOrder);

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullOrder),
      })
      if (response.ok) {
        dispatch(clearCart())
        setSubmitted(true)
      } else {
        const result = await response.json()
        setErrorMessage(result.error || 'Failed to submit order')
      }
    } catch (error) {
      setErrorMessage('Failed to submit order. Please try again.')
      console.error('Error submitting order:', error)
    }
  }

  if (typeof window === 'undefined') return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 bg-black/20 z-[1000]" />
        <DialogContent className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md sm:max-w-lg max-h-[90vh] overflow-y-auto bg-white p-6 rounded-2xl shadow-lg z-[1001]">
          {!submitted ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {errorMessage && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-2 text-sm">
                  {errorMessage}
                </div>
              )}
              {/* Ordered Product Summary */}
              <div className="space-y-2">
                <h3 className="font-bold text-lg text-gray-800">Order Summary</h3>
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm text-gray-700">
                    <span>{item.name} x {item.quantity}</span>
                    <span>৳{Math.round((typeof (item as any).salePrice === 'number' && (item as any).salePrice > 0 ? (item as any).salePrice : item.price) * item.quantity)}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm text-gray-700">
                  <span>Subtotal</span>
                  <span>৳{Math.round(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm font-bold text-green-600">
                    <span>You saved</span>
                    <span>৳{Math.round(discount)}!</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-gray-700">
                  <span>Delivery Charge</span>
                  <span>৳{Math.round(deliveryCharge)}</span>
                </div>
                <div className="flex justify-between font-bold text-md text-gray-900 border-t pt-2">
                  <span>Total</span>
                  <span>৳{total}</span>
                </div>
              </div>

              {/* Delivery Options */}
              <div>
                <h3 className="font-bold text-lg text-gray-800 mb-2">Delivery Area</h3>
                <div className="space-y-2">
                  {DELIVERY_OPTIONS.map(opt => (
                    <label key={opt.value} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${delivery === opt.value ? 'border-yellow-500 bg-yellow-100' : 'border-gray-300 bg-white'}` }>
                      <Truck className="w-5 h-5 text-yellow-500" />
                      <input type="radio" name="delivery" value={opt.value} checked={delivery === opt.value} onChange={() => setDelivery(opt.value)} className="accent-yellow-500" />
                      <span className="flex-1 font-medium text-gray-800">{opt.label}</span>
                      <span className="font-bold text-gray-700">৳{opt.price}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <h3 className="font-bold text-lg text-gray-800 mb-2">Payment Method</h3>
                <div className="space-y-2">
                  {PAYMENT_OPTIONS.map(opt => (
                    <label key={opt.value} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${payment === opt.value ? 'border-yellow-500 bg-yellow-100' : 'border-gray-300 bg-white'}` }>
                      {opt.icon}
                      <input type="radio" name="payment" value={opt.value} checked={payment === opt.value} onChange={() => setPayment(opt.value)} className="accent-yellow-500" />
                      <span className="flex-1 font-medium text-gray-800">{opt.label}</span>
                    </label>
                  ))}
                </div>
                {(payment === 'bkash' || payment === 'bank') && (
                  <p className="text-sm mt-2 text-gray-700 border p-2 rounded bg-gray-50">
                    {payment === 'bkash' ? 'Please send payment to bKash: 01XXXXXXXXX' : 'Please transfer to Bank Account: XXXX-XXXX-XXXX'}
                  </p>
                )}
              </div>

              {/* Contact & Address Info */}
              <div className="space-y-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Name</label>
                  <input {...register('name', { required: 'Name is required' })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400" placeholder="Your full name" />
                  {typeof errors.name?.message === 'string' && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Phone</label>
                  <input {...register('phone', { required: 'Phone is required' })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400" placeholder="01XXXXXXXXX" />
                  {typeof errors.phone?.message === 'string' && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Address</label>
                  <textarea {...register('address', { required: 'Address is required' })} rows={2} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400" placeholder="Full delivery address" />
                  {typeof errors.address?.message === 'string' && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Note (Optional)</label>
                  <textarea {...register('note')} rows={2} className="w-full px-4 py-2 border rounded-lg focus:ring-1 focus:ring-gray-300" placeholder="Any special note" />
                </div>
              </div>

              <button type="submit" className="w-full py-3 bg-yellow-500 text-white font-bold rounded-lg hover:bg-yellow-600 transition-colors text-base">
                Confirm Order — ৳{total}
              </button>
            </form>
          ) : (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Thank you for your order!</h2>
              <p className="text-gray-600 mb-6">We will contact you shortly to confirm your order.</p>
              <button onClick={() => { setSubmitted(false); onOpenChange(false) }} className="px-6 py-3 bg-yellow-500 text-white font-bold rounded-lg hover:bg-yellow-600 transition">Close</button>
            </div>
          )}
        </DialogContent>
      </DialogPortal>
    </Dialog>
  )
}
