import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

import authReducer from './slices/authSlice'
import cartReducer from './slices/cartSlice'
import uiReducer from './slices/uiSlice'

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['cart', 'auth'] // Only persist cart and auth state
}

export const store = configureStore({
  reducer: {
    auth: persistReducer(persistConfig, authReducer),
    cart: persistReducer(persistConfig, cartReducer),
    ui: uiReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE']
      }
    })
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch 