'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useEffect } from 'react'

interface ErrorPageProps {
  error?: Error
  reset?: () => void
  title?: string
  message?: string
  showReset?: boolean
  showHome?: boolean
  showShop?: boolean
}

const ErrorPage = ({
  error,
  reset,
  title = "Something went wrong",
  message = "We&apos;re having trouble loading this page. Please try again later.",
  showReset = true,
  showHome = true,
  showShop = false
}: ErrorPageProps) => {
  
  useEffect(() => {
    // Log the error to console (in production you'd send to a monitoring service)
    if (error) {
      console.error('Error page caught:', error)
    }
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-4 text-center">
      <div className="w-full max-w-md space-y-6">
        <h2 className="text-3xl font-bold text-gray-800">{title}</h2>
        <p className="text-gray-600 text-lg">{message}</p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
          {showReset && reset && (
            <Button 
              onClick={reset}
              variant="default"
              className="w-full sm:w-auto"
            >
              Try again
            </Button>
          )}
          
          {showHome && (
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href="/">Return to home</Link>
            </Button>
          )}
          
          {showShop && (
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href="/shop">Browse products</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ErrorPage
