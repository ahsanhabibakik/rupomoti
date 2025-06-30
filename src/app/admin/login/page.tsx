'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Immediate redirect without delay - use replace for faster navigation
    router.replace('/signin?callbackUrl=/admin')
  }, [router])

  // Minimal loading UI for fastest perceived performance
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-3">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent mx-auto"></div>
        <p className="text-sm text-muted-foreground">Redirecting to admin login...</p>
      </div>
    </div>
  )
}