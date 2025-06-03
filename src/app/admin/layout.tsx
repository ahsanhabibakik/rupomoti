'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

// In a real application, this would be handled by a proper auth system
const ADMIN_PASSWORD = 'rupomoti2024'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = () => {
      const password = localStorage.getItem('adminPassword')
      if (password !== ADMIN_PASSWORD) {
        const input = prompt('Please enter admin password:')
        if (input === ADMIN_PASSWORD) {
          localStorage.setItem('adminPassword', input)
          setIsAuthenticated(true)
        } else {
          router.push('/')
        }
      } else {
        setIsAuthenticated(true)
      }
    }

    checkAuth()
  }, [router])

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold">Rupomoti Admin</h1>
          <button
            onClick={() => {
              localStorage.removeItem('adminPassword')
              router.push('/')
            }}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Logout
          </button>
        </div>
      </header>
      <main className="container mx-auto px-4">{children}</main>
    </div>
  )
} 