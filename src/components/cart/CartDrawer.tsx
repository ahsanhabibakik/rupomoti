'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingCart, Trash2, Plus, Minus, ShoppingBag, Tag, Truck, Info, Heart, Clock, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatPrice } from '@/lib/utils'
import Image from 'next/image'
import { CheckoutModal } from '@/components/checkout/CheckoutModal'
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

interface CartDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const items = useAppSelector(selectCartItems)
  const savedForLater = useAppSelector((state) => state.cart.savedForLater)
  const cartTotal = useAppSelector((state) => state.cart.total)
  const shippingCost = useAppSelector((state) => state.cart.shippingCost)
  const discount = useAppSelector((state) => state.cart.discount)
  const couponCode = useAppSelector((state) => state.cart.couponCode)
  const [inputCouponCode, setInputCouponCode] = useState('')
  const [freeShippingThreshold] = useState(50000) // Free shipping above 50,000 BDT
  const [showAddedToCart, setShowAddedToCart] = useState({})
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false)

  useEffect(() => {
    // Calculate shipping cost based on cart total
    if (cartTotal >= freeShippingThreshold) {
      dispatch(setShippingCostAction(0))
    } else {
      dispatch(setShippingCostAction(100)) // Standard shipping cost
    }
  }, [cartTotal, freeShippingThreshold, dispatch])

  const applyCoupon = () => {
    // Simple coupon logic - you can enhance this
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
    return cartTotal - discount + shippingCost
  }

  const getAmountNeededForFreeShipping = () => {
    const amountNeeded = freeShippingThreshold - cartTotal
    return amountNeeded > 0 ? amountNeeded : 0
  }

  const handleSaveForLater = (itemId) => {
    dispatch(saveForLater(itemId))
    setShowAddedToCart({ ...showAddedToCart, [itemId]: true })
    setTimeout(() => {
      setShowAddedToCart({ ...showAddedToCart, [itemId]: false })
    }, 2000)
  }

  const handleCheckout = () => {
    if (items.length === 0) {
      return
    }
    setCheckoutModalOpen(true)
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
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[998] transition-opacity duration-300"
              onClick={() => onOpenChange(false)}
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 20 }}
              className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-xl z-[999]"
            >
              <div className="h-full flex flex-col">
                {/* Header with gradient background */}
                <div className="p-4 bg-gradient-to-r from-pearl-500 to-pearl-600 text-white flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Shopping Cart</h2>
                  <button
                    onClick={() => onOpenChange(false)}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Cart Items with improved styling */}
                <div className="flex-1 overflow-y-auto p-4">
                  {items.length === 0 && savedForLater.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                      <ShoppingBag className="w-16 h-16 text-gray-400 mb-4" />
                      <p className="text-gray-600">Your cart is empty</p>
                      <Link
                        href="/shop"
                        className="mt-4 text-pearl-600 hover:text-pearl-700 font-medium"
                        onClick={() => onOpenChange(false)}
                      >
                        Continue Shopping
                      </Link>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                      {/* Cart Items */}
                      {items.length > 0 && (
                        <div className="w-full">
                          <h3 className="font-medium text-gray-900 mb-4">
                            Cart Items
                          </h3>
                          {items.map((item) => (
                            <div
                              key={item.id}
                              className="flex gap-4 p-4 bg-gray-50 rounded-lg relative group hover:shadow-md transition-all duration-300 mb-4"
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
                                  <h3 className="font-medium text-gray-900">
                                    {item.name}
                                  </h3>
                                  <button
                                    onClick={() => dispatch(removeFromCart(item.id))}
                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">
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
                                    className="p-2 hover:bg-gray-200 rounded-lg border border-gray-300 text-gray-700 hover:text-gray-900 transition-colors"
                                  >
                                    <Minus className="w-4 h-4" />
                                  </button>
                                  <span className="w-8 text-center font-medium text-gray-900">
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
                                    className="p-2 hover:bg-gray-200 rounded-lg border border-gray-300 text-gray-700 hover:text-gray-900 transition-colors"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                </div>
                                <button
                                  onClick={() => handleSaveForLater(item.id)}
                                  className="mt-2 text-sm text-pearl-600 hover:text-pearl-700 flex items-center gap-1 transition-colors"
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
                      {savedForLater.length > 0 && (
                        <div>
                          <h3 className="font-medium text-gray-900 mb-4">
                            Saved for Later
                          </h3>
                          {savedForLater.map((item) => (
                            <div
                              key={item.id}
                              className="flex gap-4 p-4 bg-gray-50 rounded-lg relative group hover:shadow-md transition-all duration-300 mb-4"
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
                                  <h3 className="font-medium text-gray-900">
                                    {item.name}
                                  </h3>
                                  <button
                                    onClick={() => dispatch(removeFromSaved(item.id))}
                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">
                                  ৳{item.price.toLocaleString()}
                                </p>
                                <button
                                  onClick={() => dispatch(moveToCart(item.id))}
                                  className="mt-2 text-sm text-pearl-600 hover:text-pearl-700 flex items-center gap-1 transition-colors"
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
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter coupon code"
                        value={inputCouponCode}
                        onChange={(e) => setInputCouponCode(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pearl-500"
                      />
                      <button
                        onClick={applyCoupon}
                        className="px-4 py-2 bg-pearl-600 text-white rounded-lg hover:bg-pearl-700 transition-colors"
                      >
                        Apply
                      </button>
                    </div>

                    {/* Free Shipping Progress */}
                    {getAmountNeededForFreeShipping() > 0 && (
                      <div className="bg-pearl-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 text-pearl-800">
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
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-medium">৳{cartTotal.toLocaleString()}</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Discount</span>
                          <span className="font-medium text-green-600">
                            -৳{discount.toLocaleString()}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Shipping</span>
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

                    {/* Checkout Button */}
                    <button
                      onClick={handleCheckout}
                      className="w-full py-3 bg-pearl-600 text-white rounded-lg hover:bg-pearl-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={items.length === 0}
                    >
                      <span>Proceed to Checkout</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    {/* Continue Shopping */}
                    <button
                      onClick={() => onOpenChange(false)}
                      className="w-full py-3 border border-pearl-600 text-pearl-600 rounded-lg hover:bg-pearl-50 transition-colors"
                    >
                      Continue Shopping
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Checkout Modal */}
      <CheckoutModal 
        open={checkoutModalOpen} 
        onOpenChange={setCheckoutModalOpen}
      />
    </>
  )
} 