'use client'

import { Toaster as SonnerToaster } from 'sonner'

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      expand={false}
      richColors={true}
      closeButton={true}
      duration={4000}
      visibleToasts={5}
      toastOptions={{
        style: {
          background: 'hsl(var(--background))',
          color: 'hsl(var(--foreground))',
          border: '1px solid hsl(var(--border))',
          borderRadius: '8px',
          fontSize: '14px',
        },
        className: 'sonner-toast',
      }}
    />
  )
} 