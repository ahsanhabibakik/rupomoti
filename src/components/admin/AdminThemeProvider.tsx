'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useTheme } from '@/components/theme-provider'
import { toast } from 'sonner'

type AdminThemeContextType = {
  canChangeTheme: boolean
  isVerified: boolean
  adminTheme: 'light' | 'dark'
  requestThemeChange: (theme: 'light' | 'dark') => Promise<void>
  verifyAccess: () => Promise<boolean>
  customColors: Record<string, string>
  updateCustomColors: (colors: Record<string, string>) => void
}

const AdminThemeContext = createContext<AdminThemeContextType | null>(null)

export function AdminThemeProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const [isVerified, setIsVerified] = useState(false)
  const [verificationExpiry, setVerificationExpiry] = useState<number | null>(null)
  const [adminTheme, setAdminTheme] = useState<'light' | 'dark'>('light')
  const [customColors, setCustomColors] = useState<Record<string, string>>({})

  const isSuperAdmin = session?.user?.role === 'SUPER_ADMIN'
  const isDev = process.env.NODE_ENV === 'development'
  const canChangeTheme = isSuperAdmin || isDev

  // Initialize admin theme and custom colors from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('admin-theme-preference') as 'light' | 'dark'
    const savedColors = localStorage.getItem('admin-custom-colors')
    
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      setAdminTheme(savedTheme)
    }
    
    if (savedColors) {
      try {
        const colors = JSON.parse(savedColors)
        setCustomColors(colors)
        applyCustomColors(colors)
      } catch (error) {
        console.error('Failed to parse custom colors:', error)
      }
    } else {
      // Apply default colors on first load
      const defaultColors = {
        'color-primary': '#4A2E21',
        'color-secondary': '#C8B38A',
        'color-accent': '#E8CBAF',
        'color-success': '#10B981',
        'color-warning': '#F59E0B',
        'color-danger': '#EF4444',
        'color-info': '#3B82F6',
        'color-purple': '#8B5CF6',
      }
      setCustomColors(defaultColors)
      applyCustomColors(defaultColors)
    }
    
    // Apply the theme immediately
    applyAdminTheme(savedTheme || 'light')
  }, [])

  const applyAdminTheme = (theme: 'light' | 'dark') => {
    const adminContainer = document.querySelector('[data-admin-theme-container]')
    if (adminContainer) {
      adminContainer.classList.remove('admin-light', 'admin-dark')
      adminContainer.classList.add(`admin-${theme}`)
    }
  }

  const applyCustomColors = (colors: Record<string, string>) => {
    const root = document.documentElement
    Object.entries(colors).forEach(([key, value]) => {
      if (value) {
        root.style.setProperty(`--${key}`, value)
      }
    })
  }

  // Check if verification is still valid
  useEffect(() => {
    if (verificationExpiry && Date.now() > verificationExpiry) {
      setIsVerified(false)
      setVerificationExpiry(null)
    }
  }, [verificationExpiry])

  const verifyAccess = async (): Promise<boolean> => {
    if (isDev) {
      setIsVerified(true)
      return true
    }

    if (!isSuperAdmin) {
      return false
    }

    // Simulate 2FA verification - silent for theme changes
    return new Promise((resolve) => {
      setTimeout(() => {
        // In real implementation, this would validate OTP from backend
        const mockOtpValid = true
        
        if (mockOtpValid) {
          setIsVerified(true)
          // Set verification to expire in 10 minutes
          setVerificationExpiry(Date.now() + 10 * 60 * 1000)
          resolve(true)
        } else {
          resolve(false)
        }
      }, 500) // Reduced delay for better UX
    })
  }

  const requestThemeChange = async (newTheme: 'light' | 'dark'): Promise<void> => {
    if (!canChangeTheme) {
      return
    }

    // Check if verification is needed and valid
    if (!isDev && !isVerified) {
      const verified = await verifyAccess()
      if (!verified) return
    }

    // Update internal state
    setAdminTheme(newTheme)

    // Apply theme change only to admin areas via CSS class
    applyAdminTheme(newTheme)
    
    // Store admin theme preference separately from main site
    try {
      localStorage.setItem('admin-theme-preference', newTheme)
    } catch (error) {
      console.error('Failed to save admin theme preference:', error)
    }
  }

  const updateCustomColors = (colors: Record<string, string>) => {
    if (!canChangeTheme) return
    
    setCustomColors(colors)
    applyCustomColors(colors)
    
    try {
      localStorage.setItem('admin-custom-colors', JSON.stringify(colors))
    } catch (error) {
      console.error('Failed to save custom colors:', error)
    }
  }

  const value: AdminThemeContextType = {
    canChangeTheme,
    isVerified,
    adminTheme,
    requestThemeChange,
    verifyAccess,
    customColors,
    updateCustomColors,
  }

  return (
    <AdminThemeContext.Provider value={value}>
      {children}
    </AdminThemeContext.Provider>
  )
}

export function useAdminTheme() {
  const context = useContext(AdminThemeContext)
  if (!context) {
    throw new Error('useAdminTheme must be used within AdminThemeProvider')
  }
  return context
}
