'use client'

import { Navbar } from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { CartDrawer } from "@/components/cart/CartDrawer"
import { useAppSelector, useAppDispatch } from "@/redux/hooks"
import { toggleCart } from "@/redux/slices/cartSlice"
import { usePathname } from 'next/navigation'

export function RootLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const isCartOpen = useAppSelector((state) => state.cart.isCartOpen)
  const dispatch = useAppDispatch()
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith('/admin')

  return (
    <ErrorBoundary fallback={<div>Something went wrong. Please try again later.</div>}>
      <div className="min-h-screen flex flex-col">
        {!isAdmin && <Navbar />}
        <main className="flex-1">
          <ErrorBoundary fallback={<div>Something went wrong. Please try again later.</div>}>
            {children}
          </ErrorBoundary>
        </main>
        {!isAdmin && <Footer />}
        <CartDrawer open={isCartOpen} onOpenChange={(open) => dispatch(toggleCart())} />
      </div>
    </ErrorBoundary>
  )
} 