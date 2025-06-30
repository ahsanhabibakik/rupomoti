'use client'

import useSWR from 'swr'
import { showToast } from '@/lib/toast'

interface WishlistItem {
  id: string
  productId: string
  product: {
    id: string
    name: string
    price: number
    images: string[]
    slug: string
  }
  createdAt: string
}

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error('Failed to fetch wishlist')
  }
  return res.json()
}

export function useWishlist() {
  const { data: wishlistItems = [], error, mutate, isLoading } = useSWR<WishlistItem[]>('/api/wishlist', fetcher)

  const addToWishlist = async (productId: string) => {
    return showToast.promise(
      fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      }).then(async (res) => {
        if (!res.ok) {
          const errorData = await res.json()
          throw new Error(errorData.error || 'Failed to add to wishlist')
        }
        mutate() // Re-fetch wishlist data
        return res.json()
      }),
      {
        loading: 'Adding to wishlist...',
        success: 'Added to wishlist!',
        error: (err) => err.message || 'Failed to add to wishlist',
      }
    )
  }

  const removeFromWishlist = async (productId: string) => {
    return showToast.promise(
      fetch('/api/wishlist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      }).then(async (res) => {
        if (!res.ok) {
          const errorData = await res.json()
          throw new Error(errorData.error || 'Failed to remove from wishlist')
        }
        mutate() // Re-fetch wishlist data
        return res.json()
      }),
      {
        loading: 'Removing from wishlist...',
        success: 'Removed from wishlist!',
        error: (err) => err.message || 'Failed to remove from wishlist',
      }
    )
  }

  const isInWishlist = (productId: string) => {
    return wishlistItems.some(item => item.productId === productId)
  }

  const clearWishlist = async () => {
    // This would require a separate API endpoint for clearing all wishlist items
    return showToast.promise(
      Promise.all(wishlistItems.map(item => removeFromWishlist(item.productId))),
      {
        loading: 'Clearing wishlist...',
        success: 'Wishlist cleared!',
        error: 'Failed to clear wishlist',
      }
    )
  }

  return {
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
    wishlistItemsCount: wishlistItems.length,
    isLoading,
    error,
    mutate,
  }
} 