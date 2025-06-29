'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export function ThemeDemo() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Theme System Demo</h2>
        <p className="text-muted-foreground">
          This component demonstrates the new theme system with custom colors and proper isolation.
        </p>
      </div>

      {/* Color Palette Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Brand Color Palette</CardTitle>
          <CardDescription>
            These colors adapt to your custom theme settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="text-center">
              <div className="bg-theme-primary w-full h-16 rounded-lg mb-2"></div>
              <Badge variant="secondary" className="text-xs">Primary</Badge>
            </div>
            <div className="text-center">
              <div className="bg-theme-secondary w-full h-16 rounded-lg mb-2"></div>
              <Badge variant="secondary" className="text-xs">Secondary</Badge>
            </div>
            <div className="text-center">
              <div className="bg-theme-accent w-full h-16 rounded-lg mb-2"></div>
              <Badge variant="secondary" className="text-xs">Accent</Badge>
            </div>
            <div className="text-center">
              <div className="bg-theme-success w-full h-16 rounded-lg mb-2"></div>
              <Badge variant="secondary" className="text-xs">Success</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gradient Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Gradient Examples</CardTitle>
          <CardDescription>
            Dynamic gradients using your custom colors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="gradient-brand p-6 rounded-lg text-white">
              <h3 className="font-semibold text-lg">Brand Gradient</h3>
              <p className="opacity-90">Primary to Secondary gradient background</p>
            </div>
            <div className="gradient-accent p-6 rounded-lg text-white">
              <h3 className="font-semibold text-lg">Accent Gradient</h3>
              <p className="opacity-90">Accent to Secondary gradient background</p>
            </div>
            <div className="gradient-custom p-6 rounded-lg text-white">
              <h3 className="font-semibold text-lg">Custom Gradient</h3>
              <p className="opacity-90">Custom Primary to Custom Accent gradient</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Button Variations */}
      <Card>
        <CardHeader>
          <CardTitle>Button Variations</CardTitle>
          <CardDescription>
            How buttons look with the current theme
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button className="bg-theme-primary hover:bg-theme-primary/90">
              Custom Primary
            </Button>
            <Button className="bg-theme-accent hover:bg-theme-accent/90 text-black">
              Custom Accent
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Custom Background Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Backgrounds</CardTitle>
          <CardDescription>
            Examples using custom color utilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-custom-primary p-4 rounded-lg text-custom-primary">
              <h4 className="font-semibold">Custom Primary</h4>
              <p className="text-sm opacity-80">Background with custom primary color</p>
            </div>
            <div className="bg-custom-secondary p-4 rounded-lg text-custom-secondary">
              <h4 className="font-semibold">Custom Secondary</h4>
              <p className="text-sm opacity-80">Background with custom secondary color</p>
            </div>
            <div className="bg-custom-accent p-4 rounded-lg text-custom-secondary">
              <h4 className="font-semibold">Custom Accent</h4>
              <p className="text-sm opacity-80">Background with custom accent color</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Colors */}
      <Card>
        <CardHeader>
          <CardTitle>Status Colors</CardTitle>
          <CardDescription>
            Semantic colors for different states
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-theme-success p-3 rounded-lg text-white text-center">
              <div className="font-semibold">Success</div>
              <div className="text-xs opacity-80">Operation successful</div>
            </div>
            <div className="bg-theme-warning p-3 rounded-lg text-white text-center">
              <div className="font-semibold">Warning</div>
              <div className="text-xs opacity-80">Needs attention</div>
            </div>
            <div className="bg-theme-danger p-3 rounded-lg text-white text-center">
              <div className="font-semibold">Danger</div>
              <div className="text-xs opacity-80">Critical error</div>
            </div>
            <div className="bg-theme-info p-3 rounded-lg text-white text-center">
              <div className="font-semibold">Info</div>
              <div className="text-xs opacity-80">Information</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
