'use client'

import { createContext, useContext, useReducer, useEffect } from 'react'
import { useLocalStorage } from '@/hooks/useLocalStorage'

type CartItem = {
  id: string
  name: string
  price: number
  image: string
  quantity: number
}

type CartState = {
  items: CartItem[]
  total: number
  itemCount: number
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }

const CartContext = createContext<{
  state: CartState
  add: (item: CartItem) => void
  remove: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clear: () => void
} | null>(null)

const initialState: CartState = {
  items: [],
  total: 0,
  itemCount: 0,
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.id === action.payload.id)
      
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
          total: state.total + action.payload.price,
          itemCount: state.itemCount + 1,
        }
      }

      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1 }],
        total: state.total + action.payload.price,
        itemCount: state.itemCount + 1,
      }
    }

    case 'REMOVE_ITEM': {
      const item = state.items.find(item => item.id === action.payload)
      if (!item) return state

      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
        total: state.total - (item.price * item.quantity),
        itemCount: state.itemCount - item.quantity,
      }
    }

    case 'UPDATE_QUANTITY': {
      const item = state.items.find(item => item.id === action.payload.id)
      if (!item) return state

      const quantityDiff = action.payload.quantity - item.quantity
      
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
        total: state.total + (item.price * quantityDiff),
        itemCount: state.itemCount + quantityDiff,
      }
    }

    case 'CLEAR_CART':
      return initialState

    default:
      return state
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [savedCart, setSavedCart] = useLocalStorage<CartState>('cart', initialState)
  const [state, dispatch] = useReducer(cartReducer, savedCart)

  useEffect(() => {
    setSavedCart(state)
  }, [state, setSavedCart])

  const add = (item: CartItem) => {
    dispatch({ type: 'ADD_ITEM', payload: item })
  }

  const remove = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id })
  }

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } })
  }

  const clear = () => {
    dispatch({ type: 'CLEAR_CART' })
  }

  return (
    <CartContext.Provider value={{ state, add, remove, updateQuantity, clear }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return {
    items: context.state.items,
    total: context.state.total,
    itemCount: context.state.itemCount,
    add: context.add,
    remove: context.remove,
    updateQuantity: context.updateQuantity,
    clear: context.clear,
  }
} 