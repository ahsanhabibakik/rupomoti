'use client'

import { useState, useEffect } from 'react'
import { Star, Edit2, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ReviewForm } from './review-form'
import { useSession } from 'next-auth/react'

interface Review {
  id: string
  rating: number
  title?: string
  comment?: string
  reviewerName: string
  reviewerImage?: string
  isAnonymous: boolean
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  createdAt: string
  updatedAt: string
}

interface ReviewSystemProps {
  productId: string
}

export function ReviewSystem({ productId }: ReviewSystemProps) {
  const { data: session } = useSession()
  const [reviews, setReviews] = useState<Review[]>([])
  const [userReview, setUserReview] = useState<Review | null>(null)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReviews()
    fetchUserReview()
  }, [productId])

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/reviews?productId=${productId}&status=APPROVED`)
      if (response.ok) {
        const data = await response.json()
        setReviews(data.reviews || [])
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
    }
  }

  const fetchUserReview = async () => {
    try {
      const response = await fetch(`/api/reviews?productId=${productId}`, {
        method: 'PUT',
      })
      if (response.ok) {
        const data = await response.json()
        setUserReview(data.review)
      }
    } catch (error) {
      console.error('Failed to fetch user review:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReviewSubmit = async (reviewData: any) => {
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...reviewData, productId }),
      })

      if (response.ok) {
        const data = await response.json()
        setUserReview(data.review)
        setShowReviewForm(false)
        // Refresh reviews list
        fetchReviews()
      }
    } catch (error) {
      console.error('Failed to submit review:', error)
    }
  }

  const renderStars = (rating: number, size = 'w-4 h-4') => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size} ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Review Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Customer Reviews</span>
            <div className="flex items-center space-x-2">
              {renderStars(Math.round(averageRating))}
              <span className="text-sm text-gray-600">
                ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* User's Review Status */}
          {userReview ? (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  <span className="text-blue-800 font-medium">Your Review</span>
                  {userReview.status === 'PENDING' && (
                    <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                      Awaiting Approval
                    </Badge>
                  )}
                  {userReview.status === 'APPROVED' && (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Approved
                    </Badge>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowReviewForm(true)}
                  className="flex items-center space-x-1"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit</span>
                </Button>
              </div>
              <div className="flex items-center space-x-2 mb-2">
                {renderStars(userReview.rating)}
                {userReview.title && (
                  <span className="font-medium">{userReview.title}</span>
                )}
              </div>
              {userReview.comment && (
                <p className="text-gray-700">{userReview.comment}</p>
              )}
              {userReview.status === 'PENDING' && (
                <p className="text-sm text-yellow-600 mt-2">
                  Your review is awaiting approval and will be visible once approved.
                </p>
              )}
            </div>
          ) : (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Share your experience</h3>
                  <p className="text-sm text-gray-600">
                    Help others by writing a review for this product
                  </p>
                </div>
                <Button onClick={() => setShowReviewForm(true)}>
                  Write a Review
                </Button>
              </div>
            </div>
          )}

          {/* Review Form */}
          {showReviewForm && (
            <ReviewForm
              initialData={userReview}
              onSubmit={handleReviewSubmit}
              onCancel={() => setShowReviewForm(false)}
            />
          )}
        </CardContent>
      </Card>

      {/* Reviews List */}
      {reviews.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">All Reviews</h3>
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      {review.reviewerImage ? (
                        <img
                          src={review.reviewerImage}
                          alt={review.reviewerName}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <span className="text-sm font-medium text-gray-600">
                          {review.reviewerName.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{review.reviewerName}</p>
                      <div className="flex items-center space-x-2">
                        {renderStars(review.rating)}
                        <span className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                {review.title && (
                  <h4 className="font-medium text-gray-900 mb-2">{review.title}</h4>
                )}
                {review.comment && (
                  <p className="text-gray-700">{review.comment}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {reviews.length === 0 && !userReview && (
        <Card>
          <CardContent className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
            <p className="text-gray-600 mb-4">Be the first to review this product!</p>
            <Button onClick={() => setShowReviewForm(true)}>
              Write the First Review
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
