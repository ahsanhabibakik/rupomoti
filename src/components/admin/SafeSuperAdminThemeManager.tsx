'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Sun, Moon, Monitor, Shield, Palette, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

interface SafeSuperAdminThemeManagerProps {
  className?: string
}

function SafeSuperAdminThemeManager(props: SafeSuperAdminThemeManagerProps = {}) {
  const { data: session } = useSession()
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark' | 'system'>('light')
  const [isProcessing, setIsProcessing] = useState(false)

  const isSuperAdmin = session?.user?.role === 'SUPER_ADMIN'
  const isDev = process.env.NODE_ENV === 'development'
  const canChangeTheme = isSuperAdmin || isDev

  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('admin-theme') as 'light' | 'dark' | 'system' | null
    if (savedTheme) {
      setCurrentTheme(savedTheme)
    }
  }, [])

  const handleThemeChange = async (theme: 'light' | 'dark' | 'system') => {
    if (!canChangeTheme) {
      toast.error('You do not have permission to change themes')
      return
    }

    setIsProcessing(true)
    try {
      // Save to localStorage
      localStorage.setItem('admin-theme', theme)
      setCurrentTheme(theme)
      
      // Apply theme
      const root = document.documentElement
      if (theme === 'dark') {
        root.classList.add('dark')
      } else if (theme === 'light') {
        root.classList.remove('dark')
      } else {
        // System theme
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        if (prefersDark) {
          root.classList.add('dark')
        } else {
          root.classList.remove('dark')
        }
      }
      
      toast.success('Theme updated successfully!')
    } catch (error) {
      console.error('Theme change error:', error)
      toast.error('Failed to update theme')
    } finally {
      setIsProcessing(false)
    }
  }

  if (!canChangeTheme) {
    return (
      <Card className="border border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2 text-gray-500">
            <Shield className="h-5 w-5" />
            <span>Theme management requires Super Admin privileges</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-purple-500" />
          Theme Management
          {isSuperAdmin && (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              Super Admin
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Label className="text-sm font-medium">Choose Theme</Label>
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: 'light', label: 'Light', icon: Sun },
              { value: 'dark', label: 'Dark', icon: Moon },
              { value: 'system', label: 'System', icon: Monitor }
            ].map(({ value, label, icon: Icon }) => (
              <Button
                key={value}
                variant={currentTheme === value ? 'default' : 'outline'}
                className="flex flex-col items-center space-y-2 h-auto py-4"
                onClick={() => handleThemeChange(value as 'light' | 'dark' | 'system')}
                disabled={isProcessing}
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm">{label}</span>
                {currentTheme === value && <CheckCircle className="h-4 w-4 text-green-500" />}
              </Button>
            ))}
          </div>
        </div>

        {currentTheme && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Current theme: <strong>{currentTheme}</strong></span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default SafeSuperAdminThemeManager
