'use client'

import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { CartProvider } from "@/contexts/CartContext"
import { Toaster } from "@/components/ui/toaster"
import { ErrorBoundary } from "@/components/ErrorBoundary"

export function RootLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ErrorBoundary fallback={<div>Something went wrong. Please try again later.</div>}>
      <CartProvider>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">
            <ErrorBoundary fallback={<div>Something went wrong. Please try again later.</div>}>
              {children}
            </ErrorBoundary>
          </main>
          <Footer />
        </div>
        <Toaster />
      </CartProvider>
    </ErrorBoundary>
  )
} 