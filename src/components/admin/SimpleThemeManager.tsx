'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Palette } from 'lucide-react'

// Simple test component to replace SuperAdminThemeManager temporarily
function SimpleThemeManager() {
  return (
    <Card className="border border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-purple-500" />
          Theme Manager (Test)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">
          Theme manager component is loading...
        </p>
      </CardContent>
    </Card>
  )
}

export default SimpleThemeManager
