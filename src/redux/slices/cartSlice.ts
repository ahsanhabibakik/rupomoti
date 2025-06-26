import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '@/redux/store'

export interface CartItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
  category: string
  variantId?: string
  variantName?: string
  salePrice?: number
}

interface CartState {
  items: CartItem[]
  savedForLater: CartItem[]
  isCartOpen: boolean
  total: number
  shippingCost: number
  discount: number
  couponCode: string | null
}

const initialState: CartState = {
  items: [],
  savedForLater: [],
  isCartOpen: false,
  total: 0,
  shippingCost: 100, // Default shipping cost
  discount: 0,
  couponCode: null,
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.items.find(
        (item) =>
          item.id === action.payload.id &&
          item.variantId === action.payload.variantId
      )

      if (existingItem) {
        existingItem.quantity += action.payload.quantity
      } else {
        state.items.push(action.payload)
      }

      // Recalculate total
      state.total = state.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      )
    },

    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload)
      state.total = state.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      )
    },

    updateQuantity: (
      state,
      action: PayloadAction<{ id: string; quantity: number }>
    ) => {
      const item = state.items.find((item) => item.id === action.payload.id)
      if (item) {
        item.quantity = Math.max(0, action.payload.quantity)
        if (item.quantity === 0) {
          state.items = state.items.filter((i) => i.id !== action.payload.id)
        }
      }
      state.total = state.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      )
    },

    clearCart: (state) => {
      state.items = []
      state.total = 0
      state.discount = 0
      state.couponCode = null
      state.shippingCost = 100
    },

    toggleCart: (state) => {
      state.isCartOpen = !state.isCartOpen
    },

    setShippingCost: (state, action: PayloadAction<number>) => {
      state.shippingCost = action.payload
    },

    applyCoupon: (
      state,
      action: PayloadAction<{ code: string; discount: number }>
    ) => {
      state.couponCode = action.payload.code
      state.discount = action.payload.discount
    },

    removeCoupon: (state) => {
      state.couponCode = null
      state.discount = 0
    },

    saveForLater: (state, action: PayloadAction<string>) => {
      const item = state.items.find((item) => item.id === action.payload)
      if (item) {
        state.savedForLater.push({ ...item })
        state.items = state.items.filter((i) => i.id !== action.payload)
        state.total = state.items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        )
      }
    },

    moveToCart: (state, action: PayloadAction<string>) => {
      const item = state.savedForLater.find((item) => item.id === action.payload)
      if (item) {
        state.items.push({ ...item })
        state.savedForLater = state.savedForLater.filter(
          (i) => i.id !== action.payload
        )
        state.total = state.items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        )
      }
    },

    removeFromSaved: (state, action: PayloadAction<string>) => {
      state.savedForLater = state.savedForLater.filter(
        (item) => item.id !== action.payload
      )
    },
  },
})

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  toggleCart,
  setShippingCost,
  applyCoupon,
  removeCoupon,
  saveForLater,
  moveToCart,
  removeFromSaved,
} = cartSlice.actions

// Selectors
export const selectCartItems = (state: RootState) => state.cart.items
export const selectCartItemCount = (state: RootState) =>
  state.cart.items.reduce((total, item) => total + item.quantity, 0)
export const selectCartTotal = (state: RootState) =>
  state.cart.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  )

export default cartSlice.reducer 