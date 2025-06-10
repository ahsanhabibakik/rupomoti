'use client'

import { useState } from 'react'

interface WishlistItem {
  id: string
  name: string
  price: number
  image: string
}

export function useWishlistTest() {
  const [wishlistItems] = useState<WishlistItem[]>([])
  const wishlistItemsCount = wishlistItems.length

  return {
    wishlistItems,
    addToWishlist: () => {},
    removeFromWishlist: () => {},
    isInWishlist: () => false,
    clearWishlist: () => {},
    wishlistItemsCount,
  }
} 