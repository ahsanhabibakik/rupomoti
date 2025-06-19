'use client'

import { Navbar } from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { CartDrawer } from "@/components/cart/CartDrawer"
import { useAppSelector, useAppDispatch } from "@/redux/hooks"
import { toggleCart } from "@/redux/slices/cartSlice"

export function RootLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const isCartOpen = useAppSelector((state) => state.cart.isCartOpen)
  const dispatch = useAppDispatch()

  return (
    <ErrorBoundary fallback={<div>Something went wrong. Please try again later.</div>}>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <ErrorBoundary fallback={<div>Something went wrong. Please try again later.</div>}>
            {children}
          </ErrorBoundary>
        </main>
        <Footer />
        <CartDrawer open={isCartOpen} onOpenChange={(open) => dispatch(toggleCart())} />
      </div>
    </ErrorBoundary>
  )
} 