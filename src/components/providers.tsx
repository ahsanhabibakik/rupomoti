'use client'

import { useState } from 'react'
import { SessionProvider } from 'next-auth/react'
import { Provider as ReduxProvider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from '@/redux/store'
import { Toaster } from 'sonner'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@/components/theme-provider'

// Error boundary for session provider
function SafeSessionProvider({ children }: { children: React.ReactNode }) {
  try {
    return (
      <SessionProvider
        refetchInterval={5 * 60}
        refetchOnWindowFocus={false}
      >
        {children}
      </SessionProvider>
    )
  } catch (error) {
    console.error('SessionProvider error:', error)
    return <>{children}</>
  }
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <ReduxProvider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SafeSessionProvider>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider 
              defaultTheme="light" 
              enableSystem={false} 
              storageKey="main-site-theme"
              attribute="class"
              disableTransitionOnChange={true}
            >
              {children}
              <Toaster
                position="bottom-right"
                toastOptions={{
                  style: {
                    background: 'hsl(var(--background))',
                    color: 'hsl(var(--foreground))',
                    border: '1px solid hsl(var(--border))',
                    zIndex: 9999,
                  },
                }}
              />
            </ThemeProvider>
          </QueryClientProvider>
        </SafeSessionProvider>
      </PersistGate>
    </ReduxProvider>
  )
} 