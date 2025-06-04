import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../store'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
  variantId?: string
  variantName?: string
}

interface CartState {
  items: CartItem[]
  total: number
  itemCount: number
}

const initialState: CartState = {
  items: [],
  total: 0,
  itemCount: 0
}

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.items.find(
        item => item.id === action.payload.id && item.variantId === action.payload.variantId
      )

      if (existingItem) {
        existingItem.quantity += 1
      } else {
        state.items.push({ ...action.payload, quantity: 1 })
      }

      state.total = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      state.itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0)
    },
    removeFromCart: (state, action: PayloadAction<{ id: string; variantId?: string }>) => {
      state.items = state.items.filter(
        item => !(item.id === action.payload.id && item.variantId === action.payload.variantId)
      )
      state.total = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      state.itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0)
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ id: string; variantId?: string; quantity: number }>
    ) => {
      const item = state.items.find(
        item => item.id === action.payload.id && item.variantId === action.payload.variantId
      )
      if (item) {
        item.quantity = Math.max(0, action.payload.quantity)
        if (item.quantity === 0) {
          state.items = state.items.filter(i => i !== item)
        }
      }
      state.total = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      state.itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0)
    },
    clearCart: (state) => {
      state.items = []
      state.total = 0
      state.itemCount = 0
    }
  }
})

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions

export const selectCartItems = (state: RootState) => state.cart.items
export const selectCartTotal = (state: RootState) => state.cart.total
export const selectCartItemCount = (state: RootState) => state.cart.itemCount

export default cartSlice.reducer 