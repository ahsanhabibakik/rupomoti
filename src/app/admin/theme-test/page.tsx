'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAdminTheme } from '@/components/admin/AdminThemeProvider'
import { ThemeDemo } from '@/components/admin/ThemeDemo'

export default function ThemeTestPage() {
  const { adminTheme, customColors } = useAdminTheme()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Theme & Color Test Page</h1>
        <p className="text-muted-foreground mt-2">
          Test the admin theme toggle and custom color system. Use the theme toggle and color manager in the top bar.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Current Theme</CardTitle>
            <CardDescription>Admin theme status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Theme:</span>
                <span className="font-mono bg-muted px-2 py-1 rounded text-sm">{adminTheme}</span>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Theme Colors:</div>
                <div className="w-full h-4 bg-background border rounded" title="Background" />
                <div className="w-full h-4 bg-card border rounded" title="Card" />
                <div className="w-full h-4 bg-muted border rounded" title="Muted" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Brand Colors</CardTitle>
            <CardDescription>Theme color palette</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-theme-primary h-12 rounded flex items-center justify-center text-white text-xs font-medium">Primary</div>
              <div className="bg-theme-secondary h-12 rounded flex items-center justify-center text-white text-xs font-medium">Secondary</div>
              <div className="bg-theme-accent h-12 rounded flex items-center justify-center text-white text-xs font-medium">Accent</div>
              <div className="bg-theme-success h-12 rounded flex items-center justify-center text-white text-xs font-medium">Success</div>
              <div className="bg-theme-warning h-12 rounded flex items-center justify-center text-white text-xs font-medium">Warning</div>
              <div className="bg-theme-danger h-12 rounded flex items-center justify-center text-white text-xs font-medium">Danger</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Custom Colors</CardTitle>
            <CardDescription>Applied custom colors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {Object.entries(customColors).length > 0 ? (
                Object.entries(customColors).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 border rounded flex-shrink-0"
                      style={{ backgroundColor: value }}
                    />
                    <span className="text-xs font-mono truncate">{key}: {value}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No custom colors applied</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <ThemeDemo />
    </div>
  )
}
