import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type CartItem = {
  id: string
  name: string
  price: number
  image: string
  quantity: number
}

interface CartState {
  items: CartItem[]
  total: number
  itemCount: number
}

const initialState: CartState = {
  items: [],
  total: 0,
  itemCount: 0,
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.items.find(item => item.id === action.payload.id)
      
      if (existingItem) {
        existingItem.quantity += 1
      } else {
        state.items.push({ ...action.payload, quantity: 1 })
      }
      
      state.total += action.payload.price
      state.itemCount += 1
    },
    removeItem: (state, action: PayloadAction<string>) => {
      const item = state.items.find(item => item.id === action.payload)
      if (!item) return

      state.total -= item.price * item.quantity
      state.itemCount -= item.quantity
      state.items = state.items.filter(item => item.id !== action.payload)
    },
    updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const item = state.items.find(item => item.id === action.payload.id)
      if (!item) return

      const quantityDiff = action.payload.quantity - item.quantity
      item.quantity = action.payload.quantity
      state.total += item.price * quantityDiff
      state.itemCount += quantityDiff
    },
    clearCart: (state) => {
      state.items = []
      state.total = 0
      state.itemCount = 0
    },
  },
})

export const { addItem, removeItem, updateQuantity, clearCart } = cartSlice.actions
export default cartSlice.reducer 