'use client'

import { createContext, useContext, useReducer, ReactNode, useEffect, useState } from 'react'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
}

interface CartState {
  items: CartItem[]
  total: number
  itemCount: number
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'INITIALIZE'; payload: CartState }

interface CartContextType {
  state: CartState
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const initialState: CartState = {
  items: [],
  total: 0,
  itemCount: 0
}

function cartReducer(state: CartState, action: CartAction): CartState {
  try {
    switch (action.type) {
      case 'INITIALIZE':
        return action.payload

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
            itemCount: state.itemCount + 1
          }
        }

        return {
          ...state,
          items: [...state.items, action.payload],
          total: state.total + action.payload.price,
          itemCount: state.itemCount + 1
        }
      }

      case 'REMOVE_ITEM': {
        const item = state.items.find(item => item.id === action.payload)
        if (!item) return state

        return {
          ...state,
          items: state.items.filter(item => item.id !== action.payload),
          total: state.total - (item.price * item.quantity),
          itemCount: state.itemCount - item.quantity
        }
      }

      case 'UPDATE_QUANTITY': {
        const item = state.items.find(item => item.id === action.payload.id)
        if (!item) return state

        const quantityDiff = action.payload.quantity - item.quantity

        if (action.payload.quantity <= 0) {
          return {
            ...state,
            items: state.items.filter(item => item.id !== action.payload.id),
            total: state.total - (item.price * item.quantity),
            itemCount: state.itemCount - item.quantity
          }
        }

        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: action.payload.quantity }
              : item
          ),
          total: state.total + (item.price * quantityDiff),
          itemCount: state.itemCount + quantityDiff
        }
      }

      case 'CLEAR_CART':
        return initialState

      default:
        return state
    }
  } catch (error) {
    console.error('Error in cart reducer:', error)
    return state
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false)
  const [state, dispatch] = useReducer(cartReducer, initialState)

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('cart')
      if (savedCart) {
        dispatch({ type: 'INITIALIZE', payload: JSON.parse(savedCart) })
      }
      setIsInitialized(true)
    } catch (error) {
      console.error('Error initializing cart:', error)
      setIsInitialized(true)
    }
  }, [])

  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem('cart', JSON.stringify(state))
      } catch (error) {
        console.error('Error saving cart:', error)
      }
    }
  }, [state, isInitialized])

  const addItem = (item: CartItem) => {
    try {
      dispatch({ type: 'ADD_ITEM', payload: item })
    } catch (error) {
      console.error('Error adding item to cart:', error)
    }
  }

  const removeItem = (id: string) => {
    try {
      dispatch({ type: 'REMOVE_ITEM', payload: id })
    } catch (error) {
      console.error('Error removing item from cart:', error)
    }
  }

  const updateQuantity = (id: string, quantity: number) => {
    try {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } })
    } catch (error) {
      console.error('Error updating quantity:', error)
    }
  }

  const clearCart = () => {
    try {
      dispatch({ type: 'CLEAR_CART' })
    } catch (error) {
      console.error('Error clearing cart:', error)
    }
  }

  if (!isInitialized) {
    return null
  }

  return (
    <CartContext.Provider
      value={{
        state,
        addItem,
        removeItem,
        updateQuantity,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
} 