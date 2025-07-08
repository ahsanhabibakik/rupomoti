'use client'

import { Inter } from 'next/font/google'
import ErrorPage from '@/components/ErrorPage'
import { useEffect } from 'react'

// Use the same font as the main layout
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to console (in production you'd send to a monitoring service)
    console.error('Global error:', error)
  }, [error])

  return (
    <html lang="en" className="light" data-theme="light" style={{colorScheme: 'light'}}>
      <body className={inter.className}>
        <div className="flex min-h-screen flex-col">
          <main className="flex-1">
            <ErrorPage
              error={error}
              reset={reset}
              title="Oops! Something went wrong"
              message="We apologize for the inconvenience. Our team has been notified and is working to fix this issue."
              showReset={true}
              showHome={true}
              showShop={true}
            />
          </main>
        </div>
      </body>
    </html>
  )
}
