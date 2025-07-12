'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function AuthError() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Authentication Error
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {error === 'CredentialsSignin' 
              ? 'Invalid email or password. Please try again.'
              : 'An error occurred during authentication.'
            }
          </p>
        </div>
        <div className="text-center">
          <Link href="/signin">
            <Button>
              Try Again
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
