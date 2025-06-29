'use client'

import * as React from 'react'
import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light' | 'system'

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
  attribute?: string
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: 'dark' | 'light'
}

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
  resolvedTheme: 'light',
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  storageKey = 'theme',
  enableSystem = false, // Disable system theme detection for persistent light mode
  disableTransitionOnChange = false,
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'light' // Always default to light on server
    const stored = localStorage.getItem(storageKey) as Theme
    // Force light mode - ignore system or dark preferences
    return stored === 'light' || !stored ? 'light' : 'light'
  })

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove('light', 'dark')

    // Always resolve to light mode
    root.classList.add('light')
    
    // Set color-scheme for better browser integration
    root.style.colorScheme = 'light'
  }, [theme, enableSystem])

  const value = {
    theme: 'light' as Theme, // Always return light
    setTheme: () => {
      // Only allow light theme to be set
      const finalTheme = 'light'
      localStorage.setItem(storageKey, finalTheme)
      setTheme(finalTheme)
    },
    resolvedTheme: 'light' as const,
  }

  useEffect(() => {
    if (disableTransitionOnChange) {
      const css = document.createElement('style')
      css.appendChild(
        document.createTextNode(
          `*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}`
        )
      )
      document.head.appendChild(css)

      return () => {
        // Force reflow
        ;(() => window.getComputedStyle(document.body))()

        // Wait for next tick before removing
        setTimeout(() => {
          document.head.removeChild(css)
        }, 1)
      }
    }
  }, [disableTransitionOnChange])

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider')

  return context
}
