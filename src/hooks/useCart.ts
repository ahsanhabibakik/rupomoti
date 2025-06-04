import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  selectCartItems,
  selectCartTotal,
  selectCartItemCount,
} from '@/redux/slices/cartSlice'
import { setCartDrawerOpen } from '@/redux/slices/uiSlice'

export function useCart() {
  const dispatch = useAppDispatch()
  const items = useAppSelector(selectCartItems)
  const total = useAppSelector(selectCartTotal)
  const itemCount = useAppSelector(selectCartItemCount)

  const add = (item: {
    id: string
    name: string
    price: number
    image: string
    variantId?: string
    variantName?: string
  }) => {
    dispatch(addToCart(item))
    dispatch(setCartDrawerOpen(true))
  }

  const remove = (id: string, variantId?: string) => {
    dispatch(removeFromCart({ id, variantId }))
  }

  const updateItemQuantity = (id: string, quantity: number, variantId?: string) => {
    dispatch(updateQuantity({ id, quantity, variantId }))
  }

  const clear = () => {
    dispatch(clearCart())
  }

  return {
    items,
    total,
    itemCount,
    add,
    remove,
    updateQuantity: updateItemQuantity,
    clear,
  }
} 