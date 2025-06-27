'use client'

import { useState } from 'react'
import { SessionProvider } from 'next-auth/react'
import { Provider as ReduxProvider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from '@/redux/store'
import { Toaster } from 'sonner'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <ReduxProvider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SessionProvider>
          <QueryClientProvider client={queryClient}>
            {children}
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: 'hsl(var(--background))',
                  color: 'hsl(var(--foreground))',
                  border: '1px solid hsl(var(--border))',
                },
              }}
            />
          </QueryClientProvider>
        </SessionProvider>
      </PersistGate>
    </ReduxProvider>
  )
} 