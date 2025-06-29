'use client'

import { useAdminTheme } from './AdminThemeProvider'
import { Button } from '@/components/ui/button'
import { Sun, Moon, Settings } from 'lucide-react'
import { toast } from 'sonner'

export function AdminThemeToggle() {
  const { adminTheme, canChangeTheme, requestThemeChange } = useAdminTheme()

  const handleToggle = async () => {
    if (!canChangeTheme) {
      toast.error('You do not have permission to change the theme.')
      return
    }

    const newTheme = adminTheme === 'dark' ? 'light' : 'dark'
    await requestThemeChange(newTheme)
    
    toast.success(`Admin theme changed to ${newTheme} mode`)
  }

  if (!canChangeTheme) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 px-0 opacity-50 cursor-not-allowed"
        disabled
      >
        <Settings className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">Theme locked</span>
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggle}
      className="h-8 w-8 px-0"
    >
      <Sun className={`h-[1.2rem] w-[1.2rem] transition-all ${adminTheme === 'dark' ? 'rotate-90 scale-0' : 'rotate-0 scale-100'}`} />
      <Moon className={`absolute h-[1.2rem] w-[1.2rem] transition-all ${adminTheme === 'dark' ? 'rotate-0 scale-100' : 'rotate-90 scale-0'}`} />
      <span className="sr-only">Toggle admin theme</span>
    </Button>
  )
}
