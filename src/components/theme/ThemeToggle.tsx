'use client'

import { Button } from '@/components/ui/button'
import { Sun } from 'lucide-react'

export function ThemeToggle() {
  // Force light mode only - disable theme toggle
  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 w-8 px-0"
      disabled
      title="Light mode (fixed)"
    >
      <Sun className="h-[1.2rem] w-[1.2rem]" />
      <span className="sr-only">Light mode (fixed)</span>
    </Button>
  )
}

export function SimpleThemeToggle() {
  // Force light mode only - disable theme toggle
  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 w-8 px-0"
      disabled
      title="Light mode (fixed)"
    >
      <Sun className="h-[1.2rem] w-[1.2rem]" />
      <span className="sr-only">Light mode (fixed)</span>
    </Button>
  )
}
