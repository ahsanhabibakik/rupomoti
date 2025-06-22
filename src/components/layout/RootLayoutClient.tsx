'use client'

import { Navbar } from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { CartDrawer } from "@/components/cart/CartDrawer"
import { useAppSelector, useAppDispatch } from "@/redux/hooks"
import { toggleCart } from "@/redux/slices/cartSlice"
import { useEffect, useState } from "react"

function ClientContent({ children }: { children: React.ReactNode }) {
  const isCartOpen = useAppSelector((state) => state.cart.isCartOpen)
  const dispatch = useAppDispatch()

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <ErrorBoundary fallback={<div className="p-4">Something went wrong. Please try again later.</div>}>
          {children}
        </ErrorBoundary>
      </main>
      <Footer />
      <CartDrawer open={isCartOpen} onOpenChange={(open) => dispatch(toggleCart())} />
    </>
  )
}

export function RootLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      {isMounted ? (
        <ClientContent>{children}</ClientContent>
      ) : (
        <div className="min-h-screen flex flex-col">
          <div className="flex-1" />
        </div>
      )}
    </div>
  )
} 