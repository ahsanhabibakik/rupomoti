"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Star, X, Send } from 'lucide-react'
import { showToast } from '@/lib/toast'
import Image from 'next/image'

interface ReviewModalProps {
  isOpen: boolean
  onClose: () => void
  product: any
  existingReview?: any
  onReviewSubmitted: () => void
}

export function ReviewModal({ isOpen, onClose, product, existingReview, onReviewSubmitted }: ReviewModalProps) {
  const [rating, setRating] = useState(existingReview?.rating || 0)
  const [comment, setComment] = useState(existingReview?.comment || '')
  const [hoveredRating, setHoveredRating] = useState(0)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (rating === 0) {
      showToast.error('Please select a rating')
      return
    }

    setLoading(true)

    try {
      const url = existingReview ? '/api/reviews' : '/api/reviews'
      const method = existingReview ? 'PUT' : 'POST'
      const body = existingReview 
        ? { id: existingReview.id, rating, comment }
        : { productId: product.id, rating, comment }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (response.ok) {
        showToast.success(existingReview ? 'Review updated successfully!' : 'Review submitted successfully!')
        onReviewSubmitted()
        onClose()
        // Reset form
        setRating(0)
        setComment('')
      } else {
        showToast.error(data.error || 'Failed to submit review')
      }
    } catch (error) {
      console.error('Review submission error:', error)
      showToast.error('Failed to submit review')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !product) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {existingReview ? 'Edit Review' : 'Write a Review'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product Info */}
        <div className="flex items-center space-x-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="relative w-16 h-16 flex-shrink-0">
            <Image
              src={product.images?.[0] || '/images/placeholder.jpg'}
              alt={product.name}
              fill
              className="rounded-lg object-cover"
            />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{product.name}</h3>
            <p className="text-sm text-gray-600">₹{product.price?.toLocaleString()}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Rating *
            </label>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-colors"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoveredRating || rating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-3 text-sm text-gray-600">
                {rating === 0 ? 'Select a rating' : 
                 rating === 1 ? 'Poor' :
                 rating === 2 ? 'Fair' :
                 rating === 3 ? 'Good' :
                 rating === 4 ? 'Very Good' : 'Excellent'}
              </span>
            </div>
          </div>

          {/* Comment */}
          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
              Your Review (Optional)
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pearl-500 focus:border-transparent resize-none"
              placeholder="Share your experience with this product..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || rating === 0}
              className="flex-1 px-4 py-2 bg-pearl-600 text-white rounded-lg hover:bg-pearl-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {existingReview ? 'Update Review' : 'Submit Review'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
