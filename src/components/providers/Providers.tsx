'use client'

import { ReactNode } from 'react'
import { SessionProvider } from 'next-auth/react'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from '@/redux/store'
import { CartProvider } from './CartProvider'
import { Toaster } from 'sonner'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <CartProvider>
            {children}
            <Toaster 
              position="top-right"
              toastOptions={{
                style: {
                  background: 'hsl(var(--background))',
                  color: 'hsl(var(--foreground))',
                  border: '1px solid hsl(var(--border))',
                },
              }}
            />
          </CartProvider>
        </PersistGate>
      </Provider>
    </SessionProvider>
  )
} 