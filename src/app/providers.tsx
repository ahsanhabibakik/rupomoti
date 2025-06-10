'use client'

import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from '@/redux/store'
import { CartProvider } from '@/components/providers/CartProvider'
import { Toaster } from '@/components/ui/toaster'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <CartProvider>
          {children}
          <Toaster />
        </CartProvider>
      </PersistGate>
    </Provider>
  )
} 