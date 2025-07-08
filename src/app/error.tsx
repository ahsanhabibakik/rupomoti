'use client'

import { useEffect } from 'react'
import ErrorPage from '@/components/ErrorPage'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Page-level error:', error)
  }, [error])

  return (
    <ErrorPage
      error={error}
      reset={reset}
      message={error.message || 'An unexpected error occurred. Please try again.'}
      showReset={true}
      showHome={true}
      showShop={false}
    />
  )
} 