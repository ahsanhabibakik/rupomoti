'use client'

import { useEffect, useState } from 'react'
import { Toaster } from '@/components/ui/toaster'

export function ToasterProvider() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    // Ensure all components are mounted before initializing the toaster
    const timer = setTimeout(() => {
      setIsMounted(true)
    }, 250)

    return () => clearTimeout(timer)
  }, [])

  if (!isMounted) {
    return null
  }

  return <Toaster />
}
