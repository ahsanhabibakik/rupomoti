import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { combineReducers } from 'redux'

import authReducer from './slices/authSlice'
import cartReducer from './slices/cartSlice'
import uiReducer from './slices/uiSlice'

const rootReducer = combineReducers({
  auth: authReducer,
  cart: cartReducer,
  ui: uiReducer
})

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['cart', 'auth'] // Only persist cart and auth state
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

const cartPersistConfig = {
  key: 'cart',
  storage,
  whitelist: ['items'], // only persist items array
}

const persistedCartReducer = persistReducer(cartPersistConfig, cartReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch 