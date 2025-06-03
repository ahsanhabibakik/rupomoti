'use client'

import { ReactNode } from 'react'
import { CartProvider } from '@/contexts/CartContext'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <CartProvider>
      {children}
    </CartProvider>
  )
} 