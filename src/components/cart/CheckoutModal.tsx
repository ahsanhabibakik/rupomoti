'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogOverlay, DialogPortal } from '@/components/ui/dialog'
import { Truck, CreditCard, Banknote, Smartphone, User, MapPin, StickyNote, CheckCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'

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
  {
    label: 'bKash',
    value: 'bkash',
    icon: <Smartphone className="w-5 h-5 text-warm-oyster-gold" />,
  },
  {
    label: 'Bank Transfer',
    value: 'bank',
    icon: <CreditCard className="w-5 h-5 text-warm-oyster-gold" />,
  },
  {
    label: 'Cash on Delivery',
    value: 'cod',
    icon: <Banknote className="w-5 h-5 text-warm-oyster-gold" />,
  },
]

export function CheckoutModal({ open, onOpenChange }: CheckoutModalProps) {
  const [step, setStep] = useState(1)
  const [delivery, setDelivery] = useState('dhaka')
  const [payment, setPayment] = useState('cod')
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [submitted, setSubmitted] = useState(false)

  const onSubmit = (data) => {
    setSubmitted(true)
    setStep(3)
    // Here you would send order to backend
  }

  const progress = [
    { label: 'Delivery', active: step === 1 || step > 1 },
    { label: 'Details', active: step === 2 || step > 2 },
    { label: 'Done', active: step === 3 },
  ]

  if (typeof window === 'undefined') {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 bg-black/80 z-[1000]" />
        <DialogContent className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-[calc(100%-2rem)] sm:w-full max-w-md h-[calc(100vh-4rem)] sm:h-auto sm:max-h-[90vh] bg-pearl-white p-0 rounded-2xl shadow-2xl overflow-hidden z-[1001]">
          {/* Progress Steps */}
          <div className="sticky top-0 bg-pearl-white border-b px-6 py-4">
            <div className="flex justify-between items-center">
              {progress.map((p, i) => (
                <div key={p.label} className="flex-1 flex flex-col items-center">
                  <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-lg mb-1 ${p.active ? 'bg-warm-oyster-gold text-cocoa-brown' : 'bg-mink-taupe text-pearl-white'}`}>
                    {i+1}
                  </div>
                  <span className={`text-xs font-medium ${p.active ? 'text-cocoa-brown' : 'text-mink-taupe'}`}>
                    {p.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto flex-1 h-[calc(100%-5rem)]">
            {step === 1 && (
              <div className="p-6">
                <form onSubmit={e => { e.preventDefault(); setStep(2) }} className="space-y-6">
                  <div>
                    <label className="block text-cocoa-brown font-semibold mb-2">Delivery Location</label>
                    <div className="flex flex-col gap-2">
                      {DELIVERY_OPTIONS.map(opt => (
                        <label key={opt.value} className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${delivery === opt.value ? 'border-warm-oyster-gold bg-champagne-sheen/40' : 'border-mink-taupe bg-pearl-white'}` }>
                          <Truck className="w-5 h-5 text-warm-oyster-gold" />
                          <input type="radio" name="delivery" value={opt.value} checked={delivery === opt.value} onChange={() => setDelivery(opt.value)} className="accent-warm-oyster-gold" />
                          <span className="flex-1 text-cocoa-brown font-medium">{opt.label}</span>
                          <span className="text-cocoa-brown font-bold">৳{opt.price}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-cocoa-brown font-semibold mb-2">Payment Method</label>
                    <div className="flex flex-col gap-2">
                      {PAYMENT_OPTIONS.map(opt => (
                        <label key={opt.value} className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${payment === opt.value ? 'border-warm-oyster-gold bg-champagne-sheen/40' : 'border-mink-taupe bg-pearl-white'}` }>
                          {opt.icon}
                          <input type="radio" name="payment" value={opt.value} checked={payment === opt.value} onChange={() => setPayment(opt.value)} className="accent-warm-oyster-gold" />
                          <span className="flex-1 text-cocoa-brown font-medium">{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <button type="submit" className="w-full py-3 bg-warm-oyster-gold text-cocoa-brown font-bold rounded-lg shadow-lg border-2 border-warm-oyster-gold hover:bg-champagne-sheen transition-colors text-base">Next</button>
                </form>
              </div>
            )}

            {step === 2 && (
              <div className="p-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-cocoa-brown font-semibold mb-1">Name</label>
                      <input {...register('name', { required: 'Name is required' })} className="w-full px-3 py-2 border-2 border-warm-oyster-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-warm-oyster-gold text-cocoa-brown" placeholder="Full Name" />
                      {errors.name && <span className="text-rose-gold-accent text-xs">{errors.name.message}</span>}
                    </div>
                    <div>
                      <label className="block text-cocoa-brown font-semibold mb-1">Phone</label>
                      <input {...register('phone', { required: 'Phone is required', pattern: { value: /^01[3-9]\d{8}$/, message: 'Enter a valid Bangladeshi phone number' } })} className="w-full px-3 py-2 border-2 border-warm-oyster-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-warm-oyster-gold text-cocoa-brown" placeholder="01XXXXXXXXX" />
                      {errors.phone && <span className="text-rose-gold-accent text-xs">{errors.phone.message}</span>}
                    </div>
                    <div>
                      <label className="block text-cocoa-brown font-semibold mb-1">Delivery Address</label>
                      <textarea {...register('address', { required: 'Address is required' })} className="w-full px-3 py-2 border-2 border-warm-oyster-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-warm-oyster-gold text-cocoa-brown" placeholder="Full delivery address" rows={3} />
                      {errors.address && <span className="text-rose-gold-accent text-xs">{errors.address.message}</span>}
                    </div>
                    <div>
                      <label className="block text-cocoa-brown font-semibold mb-1">Order Note <span className="text-mink-taupe">(optional)</span></label>
                      <textarea {...register('note')} className="w-full px-3 py-2 border-2 border-mink-taupe rounded-lg focus:outline-none focus:ring-2 focus:ring-mink-taupe text-cocoa-brown" placeholder="Any special instructions?" rows={2} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setStep(1)} className="flex-1 py-3 bg-mink-taupe text-pearl-white font-bold rounded-lg border-2 border-mink-taupe hover:bg-cocoa-brown transition-colors text-base">Back</button>
                    <button type="submit" className="flex-1 py-3 bg-warm-oyster-gold text-cocoa-brown font-bold rounded-lg shadow-lg border-2 border-warm-oyster-gold hover:bg-champagne-sheen transition-colors text-base">Confirm Order</button>
                  </div>
                </form>
              </div>
            )}

            {step === 3 && (
              <div className="p-8 flex flex-col items-center justify-center text-center">
                <CheckCircle className="w-16 h-16 text-warm-oyster-gold mb-4" />
                <h2 className="text-2xl font-bold text-cocoa-brown mb-2">Thank you for your order!</h2>
                <p className="text-mink-taupe mb-4">
                  We've received your order and will contact you soon. You can track your order from your account.
                </p>
                <button 
                  onClick={() => { setStep(1); onOpenChange(false); }} 
                  className="w-full py-3 bg-warm-oyster-gold text-cocoa-brown font-bold rounded-lg shadow-lg border-2 border-warm-oyster-gold hover:bg-champagne-sheen transition-colors text-base"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  )
}