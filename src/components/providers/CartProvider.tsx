'use client'

import { ReactNode, useEffect } from 'react'
import { useAppDispatch } from '@/redux/hooks'

interface CartProviderProps {
  children: ReactNode
}

export function CartProvider({ children }: CartProviderProps) {
  const dispatch = useAppDispatch()

  useEffect(() => {
    // Initialize cart state if needed
    // This ensures the cart state is properly initialized
  }, [dispatch])

  return <>{children}</>
} 