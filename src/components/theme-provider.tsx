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
  systemTheme?: 'dark' | 'light'
}

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
  resolvedTheme: 'light',
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = 'light',
  storageKey = 'theme',
  attribute = 'class',
  enableSystem = false,
  disableTransitionOnChange = false,
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return defaultTheme
    
    // Force light mode for main site
    if (storageKey === 'main-site-theme') {
      return 'light'
    }
    
    try {
      const stored = localStorage.getItem(storageKey) as Theme
      return stored || defaultTheme
    } catch {
      return defaultTheme
    }
  })

  const [systemTheme, setSystemTheme] = useState<'dark' | 'light'>('light')

  // Listen for system theme changes
  useEffect(() => {
    if (!enableSystem) return

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    setSystemTheme(media.matches ? 'dark' : 'light')

    const listener = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light')
    }

    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [enableSystem])

  // Calculate resolved theme
  const resolvedTheme = theme === 'system' ? systemTheme : theme

  useEffect(() => {
    const root = window.document.documentElement

    // For main site, always force light mode
    if (storageKey === 'main-site-theme') {
      root.classList.remove('dark')
      root.classList.add('light')
      root.style.colorScheme = 'light'
      root.setAttribute('data-theme', 'light')
      return
    }

    root.classList.remove('light', 'dark')
    
    if (attribute === 'class') {
      root.classList.add(resolvedTheme)
    } else {
      root.setAttribute(attribute, resolvedTheme)
    }
    
    // Set color-scheme for better browser integration
    root.style.colorScheme = resolvedTheme
    root.setAttribute('data-theme', resolvedTheme)
  }, [resolvedTheme, attribute, storageKey])

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      // Prevent theme changes on main site
      if (storageKey === 'main-site-theme') {
        return
      }
      
      try {
        localStorage.setItem(storageKey, newTheme)
        setTheme(newTheme)
      } catch {
        // Handle localStorage errors gracefully
      }
    },
    resolvedTheme: storageKey === 'main-site-theme' ? 'light' : resolvedTheme,
    systemTheme,
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
