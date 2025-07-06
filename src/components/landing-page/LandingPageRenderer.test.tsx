'use client'

import React from 'react'
import { LandingPageData } from '@/types/landing-page'

interface LandingPageRendererProps {
  data: LandingPageData
  productId: string
  onAddToCart?: (productId: string, quantity: number) => void
  onAddToWishlist?: (productId: string) => void
  onOrderNow?: (productId: string) => void
}

export function LandingPageRenderer({ 
  data, 
  productId, 
  onAddToCart,
  onAddToWishlist,
  onOrderNow 
}: LandingPageRendererProps) {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          Landing Page Test
        </h1>
        <p className="text-center text-gray-600">
          Product ID: {productId}
        </p>
        <div className="mt-8">
          <button 
            onClick={() => onOrderNow?.(productId)}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Order Now
          </button>
        </div>
      </div>
    </div>
  )
}
