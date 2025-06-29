'use client'

import { useState } from 'react'
import { useAdminTheme } from './AdminThemeProvider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Palette, RotateCcw, Save, Settings } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

const DEFAULT_COLORS = {
  'color-primary': '#4A2E21',
  'color-secondary': '#C8B38A',
  'color-accent': '#E8CBAF',
  'color-success': '#10B981',
  'color-warning': '#F59E0B',
  'color-danger': '#EF4444',
  'color-info': '#3B82F6',
  'color-purple': '#8B5CF6',
}

const COLOR_LABELS = {
  'color-primary': 'Primary Color',
  'color-secondary': 'Secondary Color',
  'color-accent': 'Accent Color',
  'color-success': 'Success Color',
  'color-warning': 'Warning Color',
  'color-danger': 'Danger Color',
  'color-info': 'Info Color',
  'color-purple': 'Purple Color',
}

export function CustomColorManager() {
  const { canChangeTheme, customColors, updateCustomColors } = useAdminTheme()
  const [localColors, setLocalColors] = useState(customColors)
  const [isOpen, setIsOpen] = useState(false)

  if (!canChangeTheme) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 px-0 opacity-50 cursor-not-allowed"
        disabled
      >
        <Settings className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">Color customization locked</span>
      </Button>
    )
  }

  const handleColorChange = (colorKey: string, value: string) => {
    setLocalColors(prev => ({
      ...prev,
      [colorKey]: value
    }))
  }

  const handleSave = () => {
    updateCustomColors(localColors)
    toast.success('Custom colors applied successfully!')
    setIsOpen(false)
  }

  const handleReset = () => {
    setLocalColors(DEFAULT_COLORS)
    updateCustomColors(DEFAULT_COLORS)
    toast.success('Colors reset to default!')
  }

  const getCurrentColor = (colorKey: string) => {
    return localColors[colorKey] || DEFAULT_COLORS[colorKey as keyof typeof DEFAULT_COLORS] || '#000000'
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 px-0"
        >
          <Palette className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Customize colors</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Custom Color Manager
          </DialogTitle>
          <DialogDescription>
            Customize the theme colors for your admin dashboard. Changes will be applied immediately.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(COLOR_LABELS).map(([colorKey, label]) => (
              <Card key={colorKey}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">{label}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-lg border-2 border-gray-200 flex-shrink-0"
                      style={{ backgroundColor: getCurrentColor(colorKey) }}
                    />
                    <div className="flex-1">
                      <Label htmlFor={colorKey} className="text-xs text-muted-foreground">
                        Hex Color
                      </Label>
                      <Input
                        id={colorKey}
                        type="color"
                        value={getCurrentColor(colorKey)}
                        onChange={(e) => handleColorChange(colorKey, e.target.value)}
                        className="h-8 p-1 border-2"
                      />
                    </div>
                  </div>
                  <Input
                    type="text"
                    value={getCurrentColor(colorKey)}
                    onChange={(e) => handleColorChange(colorKey, e.target.value)}
                    placeholder="#000000"
                    className="h-8 text-xs font-mono"
                  />
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="border-t pt-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleSave}
                className="flex-1 sm:flex-none"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                className="flex-1 sm:flex-none"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset to Default
              </Button>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-semibold mb-3">Preview</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.entries(COLOR_LABELS).map(([colorKey, label]) => (
                <div key={colorKey} className="text-center">
                  <div 
                    className="w-full h-12 rounded-lg mb-2 border"
                    style={{ backgroundColor: getCurrentColor(colorKey) }}
                  />
                  <p className="text-xs text-muted-foreground">{label.replace(' Color', '')}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2 text-sm">Usage in Components</h4>
            <p className="text-xs text-muted-foreground mb-2">
              These colors can be used in your components with the following CSS classes:
            </p>
            <div className="font-mono text-xs space-y-1">
              <div>.bg-theme-primary, .text-theme-primary</div>
              <div>.bg-theme-secondary, .text-theme-secondary</div>
              <div>.bg-theme-accent, .text-theme-accent</div>
              <div>And more...</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
