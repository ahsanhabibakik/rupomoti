'use client'

import { useState, useEffect } from 'react'
import { Star, Check, X, MessageSquare, User, Calendar, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { showToast } from '@/lib/toast'
import Image from 'next/image'

interface Review {
  id: string
  rating: number
  title?: string
  comment?: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  reviewerName: string
  reviewerEmail?: string
  reviewerImage?: string
  isAnonymous: boolean
  createdAt: string
  updatedAt: string
  moderatedAt?: string
  moderationNote?: string
  product: {
    id: string
    name: string
    slug: string
    images: string[]
  }
}

export function ReviewModerationPanel() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReviews, setSelectedReviews] = useState<string[]>([])
  const [statusFilter, setStatusFilter] = useState('PENDING')
  const [moderationNote, setModerationNote] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchReviews()
  }, [statusFilter, currentPage])

  const fetchReviews = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/admin/reviews?status=${statusFilter}&page=${currentPage}&pageSize=20`
      )
      if (response.ok) {
        const data = await response.json()
        setReviews(data.reviews)
        setTotalPages(data.totalPages)
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
      showToast.error('Failed to fetch reviews')
    } finally {
      setLoading(false)
    }
  }

  const moderateReview = async (reviewId: string, action: 'approve' | 'reject', note?: string) => {
    try {
      const response = await fetch('/api/admin/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewId,
          action,
          moderationNote: note,
        }),
      })

      if (response.ok) {
        showToast.success(`Review ${action === 'approve' ? 'approved' : 'rejected'} successfully`)
        fetchReviews()
      } else {
        throw new Error('Failed to moderate review')
      }
    } catch (error) {
      console.error('Failed to moderate review:', error)
      showToast.error('Failed to moderate review')
    }
  }

  const bulkModerate = async (action: 'approve' | 'reject') => {
    if (selectedReviews.length === 0) {
      showToast.error('Please select reviews to moderate')
      return
    }

    try {
      const response = await fetch('/api/admin/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewIds: selectedReviews,
          action,
          moderationNote,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        showToast.success(data.message)
        setSelectedReviews([])
        setModerationNote('')
        fetchReviews()
      } else {
        throw new Error('Failed to moderate reviews')
      }
    } catch (error) {
      console.error('Failed to bulk moderate:', error)
      showToast.error('Failed to moderate reviews')
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedReviews(reviews.map(review => review.id))
    } else {
      setSelectedReviews([])
    }
  }

  const handleSelectReview = (reviewId: string, checked: boolean) => {
    if (checked) {
      setSelectedReviews([...selectedReviews, reviewId])
    } else {
      setSelectedReviews(selectedReviews.filter(id => id !== reviewId))
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pending</Badge>
      case 'APPROVED':
        return <Badge variant="outline" className="text-green-600 border-green-600">Approved</Badge>
      case 'REJECTED':
        return <Badge variant="outline" className="text-red-600 border-red-600">Rejected</Badge>
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-gray-200 rounded"></div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Review Moderation</h1>
        <div className="flex items-center space-x-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Filter className="w-4 h-4 text-gray-500" />
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedReviews.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium">
                  {selectedReviews.length} review{selectedReviews.length > 1 ? 's' : ''} selected
                </span>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    onClick={() => bulkModerate('approve')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Approve All
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => bulkModerate('reject')}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Reject All
                  </Button>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedReviews([])}
              >
                Clear Selection
              </Button>
            </div>
            {statusFilter === 'PENDING' && (
              <div className="mt-4">
                <Textarea
                  value={moderationNote}
                  onChange={(e) => setModerationNote(e.target.value)}
                  placeholder="Optional moderation note..."
                  rows={2}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {statusFilter === 'PENDING' && reviews.length > 0 && (
          <div className="flex items-center space-x-2 p-4 bg-gray-50 rounded-lg">
            <Checkbox
              checked={selectedReviews.length === reviews.length}
              onCheckedChange={handleSelectAll}
            />
            <span className="text-sm font-medium">Select All</span>
          </div>
        )}

        {reviews.map((review) => (
          <Card key={review.id} className="relative">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  {statusFilter === 'PENDING' && (
                    <Checkbox
                      checked={selectedReviews.includes(review.id)}
                      onCheckedChange={(checked) => handleSelectReview(review.id, !!checked)}
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="flex items-center space-x-2">
                        {review.reviewerImage ? (
                          <Image
                            src={review.reviewerImage}
                            alt={review.reviewerName}
                            width={32}
                            height={32}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-500" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{review.reviewerName}</p>
                          {review.reviewerEmail && (
                            <p className="text-xs text-gray-500">{review.reviewerEmail}</p>
                          )}
                        </div>
                      </div>
                      {review.isAnonymous && (
                        <Badge variant="outline">Anonymous</Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 mb-2">
                      {renderStars(review.rating)}
                      <span className="text-sm text-gray-500 flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(review.status)}
                  {statusFilter === 'PENDING' && (
                    <div className="flex items-center space-x-1">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            <Check className="w-3 h-3" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Approve Review</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <p>Are you sure you want to approve this review?</p>
                            <Textarea
                              placeholder="Optional approval note..."
                              onChange={(e) => setModerationNote(e.target.value)}
                            />
                            <div className="flex justify-end space-x-2">
                              <Button
                                onClick={() => moderateReview(review.id, 'approve', moderationNote)}
                              >
                                Approve
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="destructive">
                            <X className="w-3 h-3" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Reject Review</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <p>Are you sure you want to reject this review?</p>
                            <Textarea
                              placeholder="Reason for rejection..."
                              onChange={(e) => setModerationNote(e.target.value)}
                            />
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="destructive"
                                onClick={() => moderateReview(review.id, 'reject', moderationNote)}
                              >
                                Reject
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Product Info */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {review.product.images[0] && (
                    <Image
                      src={review.product.images[0]}
                      alt={review.product.name}
                      width={48}
                      height={48}
                      className="rounded"
                    />
                  )}
                  <div>
                    <p className="font-medium">{review.product.name}</p>
                    <p className="text-sm text-gray-500">Product ID: {review.product.id}</p>
                  </div>
                </div>
              </div>

              {/* Review Content */}
              {review.title && (
                <h4 className="font-medium mb-2">{review.title}</h4>
              )}
              {review.comment && (
                <p className="text-gray-700 mb-4">{review.comment}</p>
              )}

              {/* Moderation Info */}
              {review.moderatedAt && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Moderated on {new Date(review.moderatedAt).toLocaleString()}
                  </p>
                  {review.moderationNote && (
                    <p className="text-sm text-gray-700 mt-1">
                      <strong>Note:</strong> {review.moderationNote}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {reviews.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {statusFilter.toLowerCase()} reviews
            </h3>
            <p className="text-gray-600">
              {statusFilter === 'PENDING'
                ? 'All reviews have been moderated.'
                : `No ${statusFilter.toLowerCase()} reviews found.`}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
