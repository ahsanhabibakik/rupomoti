'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingBag, Trash2, Plus, Minus, Tag, Truck, Clock, ArrowRight } from 'lucide-react'
import { useAppSelector, useAppDispatch } from '@/redux/hooks'
import {
  selectCartItems,
  removeFromCart,
  updateQuantity,
  clearCart,
  toggleCart,
  applyCoupon as applyCouponAction,
  setShippingCost as setShippingCostAction,
  saveForLater,
  moveToCart,
  removeFromSaved,
} from '@/redux/slices/cartSlice'
import Link from 'next/link'
import Image from 'next/image'
import dynamic from 'next/dynamic'

const CheckoutModal = dynamic(() => import('../checkout/CheckoutModal-new').then(mod => mod.CheckoutModal), {
  ssr: false,
})

interface CartDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const items = useAppSelector(selectCartItems)
  const savedForLater = useAppSelector((state) => state.cart.savedForLater) || []
  const cartTotal = useAppSelector((state) => state.cart.total)
  const shippingCost = useAppSelector((state) => state.cart.shippingCost)
  const discount = useAppSelector((state) => state.cart.discount)
  const couponCode = useAppSelector((state) => state.cart.couponCode)
  const [inputCouponCode, setInputCouponCode] = useState('')
  const [freeShippingThreshold] = useState(50000) // Free shipping above 50,000 BDT
  const [showAddedToCart, setShowAddedToCart] = useState({})
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)

  useEffect(() => {
    // Calculate shipping cost based on cart total
    if (cartTotal >= freeShippingThreshold) {
      dispatch(setShippingCostAction(0))
    } else {
      dispatch(setShippingCostAction(100)) // Standard shipping cost
    }
  }, [cartTotal, freeShippingThreshold, dispatch])

  const applyCoupon = () => {
    if (inputCouponCode.toLowerCase() === 'welcome10') {
      dispatch(
        applyCouponAction({
          code: inputCouponCode,
          discount: cartTotal * 0.1, // 10% discount
        })
      )
    }
  }

  const getFinalTotal = () => {
    const finalTotal = (cartTotal || 0) - (discount || 0) + (shippingCost || 0);
    return isNaN(finalTotal) ? 0 : finalTotal;
  }

  const getAmountNeededForFreeShipping = () => {
    const amountNeeded = freeShippingThreshold - (cartTotal || 0);
    return amountNeeded > 0 ? amountNeeded : 0
  }

  const handleSaveForLater = (itemId: string) => {
    dispatch(saveForLater(itemId))
    setShowAddedToCart({ ...showAddedToCart, [itemId]: true })
    setTimeout(() => {
      setShowAddedToCart({ ...showAddedToCart, [itemId]: false })
    }, 2000)
  }

  const handleCheckoutClick = () => {
    onOpenChange(false) // Close cart drawer first
    setTimeout(() => {
      setShowCheckoutModal(true) // Then show checkout modal
    }, 300) // Wait for cart drawer animation to complete
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            {/* Overlay with blur effect */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-cocoa-brown/30 backdrop-blur-sm z-[998] transition-opacity duration-300"
              onClick={() => onOpenChange(false)}
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 20 }}
              className="fixed right-0 top-0 h-full w-full sm:w-96 bg-pearl-white shadow-xl z-[999]"
              style={{ backgroundColor: '#fff', opacity: 1 }}
            >
              <div className="h-full flex flex-col">
                {/* Header with gradient background */}
                <div className="p-4 bg-gradient-to-r from-warm-oyster-gold to-champagne-sheen text-cocoa-brown flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Shopping Cart</h2>
                  <button
                    onClick={() => onOpenChange(false)}
                    className="p-2 hover:bg-cocoa-brown/10 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-4">
                  {items.length === 0 && (savedForLater?.length || 0) === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                      <ShoppingBag className="w-16 h-16 text-champagne-sheen mb-4" />
                      <p className="text-mink-taupe">Your cart is empty</p>
                      <Link
                        href="/shop"
                        className="mt-4 text-warm-oyster-gold hover:text-cocoa-brown font-medium"
                        onClick={() => onOpenChange(false)}
                      >
                        Continue Shopping
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Cart Items */}
                      {items.length > 0 && (
                        <div>
                          <h3 className="font-medium text-cocoa-brown mb-4">Cart Items</h3>
                          {items.map((item) => (
                            <div
                              key={item.id}
                              className="flex gap-4 p-4 bg-champagne-sheen/40 rounded-lg relative group hover:shadow-md transition-all duration-300 mb-4"
                            >
                              <div className="relative w-20 h-20 flex-shrink-0">
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  fill
                                  className="object-cover rounded-lg"
                                />
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between">
                                  <h3 className="font-medium text-cocoa-brown">{item.name}</h3>
                                  <button
                                    onClick={() => dispatch(removeFromCart(item.id))}
                                    className="text-mink-taupe hover:text-rose-gold-accent transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                                <p className="text-sm text-mink-taupe mb-2">
                                  ৳{item.price.toLocaleString()}
                                </p>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() =>
                                      dispatch(
                                        updateQuantity({
                                          id: item.id,
                                          quantity: item.quantity - 1,
                                        })
                                      )
                                    }
                                    className="p-2 hover:bg-pearl-white rounded-lg border border-warm-oyster-gold text-cocoa-brown hover:text-warm-oyster-gold transition-colors"
                                  >
                                    <Minus className="w-4 h-4" />
                                  </button>
                                  <span className="w-8 text-center font-medium text-cocoa-brown">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() =>
                                      dispatch(
                                        updateQuantity({
                                          id: item.id,
                                          quantity: item.quantity + 1,
                                        })
                                      )
                                    }
                                    className="p-2 hover:bg-pearl-white rounded-lg border border-warm-oyster-gold text-cocoa-brown hover:text-warm-oyster-gold transition-colors"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                </div>
                                <button
                                  onClick={() => handleSaveForLater(item.id)}
                                  className="mt-2 text-sm text-rose-gold-accent hover:text-cocoa-brown flex items-center gap-1 transition-colors"
                                >
                                  <Clock className="w-4 h-4" />
                                  Save for later
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Saved for Later Items */}
                      {savedForLater && savedForLater.length > 0 && (
                        <div>
                          <h3 className="font-medium text-cocoa-brown mb-4">Saved for Later</h3>
                          {savedForLater.map((item) => (
                            <div
                              key={item.id}
                              className="flex gap-4 p-4 bg-champagne-sheen/40 rounded-lg relative group hover:shadow-md transition-all duration-300 mb-4"
                            >
                              <div className="relative w-20 h-20 flex-shrink-0">
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  fill
                                  className="object-cover rounded-lg"
                                />
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between">
                                  <h3 className="font-medium text-cocoa-brown">{item.name}</h3>
                                  <button
                                    onClick={() => dispatch(removeFromSaved(item.id))}
                                    className="text-mink-taupe hover:text-rose-gold-accent transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                                <p className="text-sm text-mink-taupe mb-2">
                                  ৳{item.price.toLocaleString()}
                                </p>
                                <button
                                  onClick={() => dispatch(moveToCart(item.id))}
                                  className="text-sm text-warm-oyster-gold hover:text-cocoa-brown flex items-center gap-1 transition-colors"
                                >
                                  <ArrowRight className="w-4 h-4" />
                                  Move to cart
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer - Only show when there are items */}
                {items.length > 0 && (
                  <div className="border-t p-4 space-y-4">
                    {/* Coupon Code */}
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="Enter coupon code"
                        value={inputCouponCode}
                        onChange={(e) => setInputCouponCode(e.target.value)}
                        className="flex-1 px-2 py-1 border border-warm-oyster-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-warm-oyster-gold text-sm"
                      />
                      <button
                        onClick={applyCoupon}
                        className="px-4 py-1 bg-warm-oyster-gold text-cocoa-brown font-bold border-2 border-warm-oyster-gold rounded-lg shadow-sm hover:bg-champagne-sheen transition-colors text-sm"
                      >
                        Apply
                      </button>
                    </div>

                    {/* Free Shipping Progress */}
                    {getAmountNeededForFreeShipping() > 0 && (
                      <div className="bg-soft-mist-blue p-3 rounded-lg">
                        <div className="flex items-center gap-2 text-cocoa-brown">
                          <Truck className="w-5 h-5" />
                          <p className="text-sm">
                            Add ৳{getAmountNeededForFreeShipping().toLocaleString()} more
                            for free shipping
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Order Summary */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-mink-taupe">Subtotal</span>
                        <span className="font-medium">৳{cartTotal.toLocaleString()}</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-mink-taupe">Discount</span>
                          <span className="font-medium text-rose-gold-accent">
                            -৳{discount.toLocaleString()}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-mink-taupe">Shipping</span>
                        <span className="font-medium">
                          {shippingCost === 0 ? (
                            <span className="text-green-600">Free</span>
                          ) : (
                            `৳${shippingCost.toLocaleString()}`
                          )}
                        </span>
                      </div>
                      <div className="border-t pt-2 flex justify-between font-medium">
                        <span>Total</span>
                        <span>৳{getFinalTotal().toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Checkout Button - premium look */}
                    <button
                      onClick={handleCheckoutClick}
                      className="w-full py-3 bg-warm-oyster-gold text-cocoa-brown font-bold text-base rounded-lg shadow-lg border-2 border-warm-oyster-gold hover:bg-champagne-sheen transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mb-2"
                      disabled={items.length === 0}
                    >
                      <span>Proceed to Checkout</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>

                    {/* Continue Shopping - centered, gold, underlined */}
                    <div className="flex justify-center">
                      <Link
                        href="/shop"
                        className="text-warm-oyster-gold text-sm underline hover:text-cocoa-brown transition-colors mt-1 mb-0 text-center"
                        style={{ padding: 0, margin: 0 }}
                      >
                        Continue Shopping
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Render CheckoutModal */}
      {typeof window !== 'undefined' && (
        <div id="modal-root">
          <CheckoutModal
            open={showCheckoutModal}
            onOpenChange={setShowCheckoutModal}
          />
        </div>
      )}
    </>
  )
} 