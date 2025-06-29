'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/components/theme-provider'
import { useSession } from 'next-auth/react'
import { Sun, Moon, Monitor } from 'lucide-react'

interface SuperAdminThemeManagerProps {
  className?: string
}

export function SuperAdminThemeManager(props: SuperAdminThemeManagerProps = {}) {
  const { theme, setTheme } = useTheme()
  const { data: session } = useSession()

  const isSuperAdmin = session?.user?.role === 'SUPER_ADMIN'

  if (!isSuperAdmin) {
    return null
  }

  return (
    <Card className={props.className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sun className="h-5 w-5" />
          Theme Manager
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Button
            variant={theme === 'light' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTheme('light')}
          >
            <Sun className="h-4 w-4 mr-1" />
            Light
          </Button>
          <Button
            variant={theme === 'dark' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTheme('dark')}
          >
            <Moon className="h-4 w-4 mr-1" />
            Dark
          </Button>
          <Button
            variant={theme === 'system' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTheme('system')}
          >
            <Monitor className="h-4 w-4 mr-1" />
            System
          </Button>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Current theme: {theme}
        </p>
      </CardContent>
    </Card>
  )
}

export default SuperAdminThemeManager
