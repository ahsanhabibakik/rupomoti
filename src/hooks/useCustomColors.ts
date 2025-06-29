'use client'

import { useAdminTheme } from '@/components/admin/AdminThemeProvider'

/**
 * Hook to access custom theme colors in components
 * Can be used outside of admin context (returns empty object)
 */
export function useCustomColors() {
  try {
    const { customColors } = useAdminTheme()
    return customColors
  } catch {
    // Not in admin context, return empty object
    return {}
  }
}

/**
 * Hook to get a specific custom color with fallback
 */
export function useCustomColor(colorKey: string, fallback: string = '#000000') {
  const customColors = useCustomColors()
  return customColors[colorKey] || fallback
}

/**
 * Utility function to apply custom colors directly to CSS custom properties
 */
export function applyCustomColorsToRoot(colors: Record<string, string>) {
  if (typeof window === 'undefined') return

  const root = document.documentElement
  Object.entries(colors).forEach(([key, value]) => {
    if (value) {
      root.style.setProperty(`--${key}`, value)
    }
  })
}

/**
 * Utility function to reset custom colors to default
 */
export function resetCustomColorsToDefault() {
  if (typeof window === 'undefined') return

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

  applyCustomColorsToRoot(defaultColors)
}

/**
 * Hook to check if we're in admin context
 */
export function useIsAdminContext() {
  try {
    useAdminTheme()
    return true
  } catch {
    return false
  }
}
